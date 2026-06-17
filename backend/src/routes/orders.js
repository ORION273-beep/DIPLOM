const express = require('express');
const { randomUUID } = require('crypto');
const { z } = require('zod');
const { prisma } = require('../prisma');
const { sendError, sendSuccess, AppError } = require('../utils/errors');
const { serializeOrder } = require('../utils/serializers');
const { requireAuth } = require('../middleware/auth');
const { generateStringId } = require('../utils/ids');

const router = express.Router();

async function createUniqueOrderId() {
  for (let i = 0; i < 20; i += 1) {
    const id = generateStringId(8);
    const exists = await prisma.order.findUnique({ where: { id } });
    if (!exists) return id;
  }
  return randomUUID().replace(/-/g, '').slice(0, 12);
}

async function simulatePaymentCompletion(orderId) {
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== 'pending') return;
    await tx.orderStatusEntry.create({
      data: { orderId, status: 'processing', changedAt: now, changedBy: 'payment-sim' },
    });
    const completedAt = new Date(now.getTime() + 1);
    await tx.orderStatusEntry.create({
      data: { orderId, status: 'completed', changedAt: completedAt, changedBy: 'payment-sim' },
    });
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'completed', updatedAt: completedAt },
    });
  });
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const where = { userId: req.user.id };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, statusHistory: { orderBy: { changedAt: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    return sendSuccess(res, 200, {
      orders: orders.map(serializeOrder),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера при загрузке заказов');
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true, statusHistory: { orderBy: { changedAt: 'asc' } } },
    });
    if (!order) {
      return sendError(res, 404, 'NOT_FOUND', 'Заказ не найден');
    }
    return sendSuccess(res, 200, { order: serializeOrder(order) });
  } catch (error) {
    console.error('GET /api/orders/:id error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера при загрузке заказа');
  }
});

const orderItemsSchema = z.array(
  z.object({
    productId: z.union([z.string(), z.number()]),
    quantity: z.number().int().positive().optional(),
  })
);

const createOrderSchema = z.object({
  items: orderItemsSchema,
  paymentMethod: z.enum(['card', 'sbp', 'balance']).optional(),
  idempotencyKey: z.string().min(1).max(64).optional(),
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success || parsed.data.items.length === 0) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные заказа');
    }
    const userId = req.user.id;
    const paymentMethod = parsed.data.paymentMethod ?? 'card';
    const idempotencyKey = parsed.data.idempotencyKey?.trim() || null;

    if (idempotencyKey) {
      const existing = await prisma.order.findUnique({ where: { idempotencyKey } });
      if (existing && existing.userId === userId) {
        const full = await prisma.order.findUnique({
          where: { id: existing.id },
          include: { items: true, statusHistory: { orderBy: { changedAt: 'asc' } } },
        });
        return sendSuccess(res, 200, { order: serializeOrder(full) });
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const lines = [];
      for (const item of parsed.data.items) {
        const productId = String(item.productId);
        const quantity = item.quantity ?? 1;
        if (!productId || quantity <= 0) {
          throw new AppError(400, 'VALIDATION', 'Некорректные товары в заказе');
        }
        const product = await tx.product.findFirst({ where: { id: productId } });
        if (!product) {
          throw new AppError(404, 'NOT_FOUND', `Товар ${productId} не найден`);
        }
        if (product.inStock === false || product.stock < quantity) {
          throw new AppError(
            400,
            'OUT_OF_STOCK',
            `Товар «${product.title}» временно недоступен (осталось: ${product.stock})`
          );
        }
        const newStock = product.stock - quantity;
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: newStock,
            inStock: newStock > 0,
          },
        });
        lines.push({
          productId: product.id,
          title: product.title,
          image: product.image,
          quantity,
          priceAtPurchase: product.price,
        });
      }
      const totalAmount = lines.reduce((s, l) => s + l.priceAtPurchase * l.quantity, 0);

      if (paymentMethod === 'balance') {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user || user.balance < totalAmount) {
          throw new AppError(400, 'INSUFFICIENT_BALANCE', 'Недостаточно средств на балансе OneSec');
        }
        await tx.user.update({
          where: { id: userId },
          data: { balance: user.balance - totalAmount },
        });
      }

      const now = new Date();
      const orderId = await createUniqueOrderId();
      const created = await tx.order.create({
        data: {
          id: orderId,
          userId,
          status: 'pending',
          totalAmount,
          paymentMethod,
          idempotencyKey,
          createdAt: now,
          updatedAt: now,
          items: { create: lines },
          statusHistory: {
            create: [{ status: 'pending', changedAt: now, changedBy: 'system' }],
          },
        },
        include: { items: true, statusHistory: { orderBy: { changedAt: 'asc' } } },
      });

      await tx.cartItem.deleteMany({ where: { userId } });
      return created;
    });

    setImmediate(() => {
      simulatePaymentCompletion(order.id).catch((err) => {
        console.error('Payment simulation error:', err);
      });
    });

    return sendSuccess(res, 201, { order: serializeOrder(order) });
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.code, error.message);
    }
    console.error('POST /api/orders error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера при создании заказа');
  }
});

module.exports = router;
