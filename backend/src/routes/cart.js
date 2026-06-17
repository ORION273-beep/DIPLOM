const express = require('express');
const { z } = require('zod');
const { prisma } = require('../prisma');
const { sendError, sendSuccess } = require('../utils/errors');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const cartItemSchema = z.object({
  productId: z.union([z.string(), z.number()]),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  oldPrice: z.number().nonnegative().nullable().optional(),
  image: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  gameSlug: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
});

function serializeCartItem(item) {
  return {
    id: item.productId,
    title: item.title,
    price: item.price,
    oldPrice: item.oldPrice ?? undefined,
    image: item.image,
    quantity: item.quantity,
    gameSlug: item.gameSlug ?? undefined,
    category: item.category ?? undefined,
    platform: item.platform ?? undefined,
  };
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });
    return sendSuccess(res, 200, { items: items.map(serializeCartItem) });
  } catch (error) {
    console.error('GET /api/cart error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка при загрузке корзины');
  }
});

router.post('/', async (req, res) => {
  try {
    const parsed = cartItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные товара');
    }
    const data = parsed.data;
    const productId = String(data.productId);
    const quantity = data.quantity ?? 1;

    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId: req.user.id, productId },
      },
      create: {
        userId: req.user.id,
        productId,
        title: data.title,
        price: data.price,
        oldPrice: data.oldPrice ?? null,
        image: data.image,
        quantity,
        gameSlug: data.gameSlug ?? null,
        category: data.category ?? null,
        platform: data.platform ?? null,
      },
      update: {
        title: data.title,
        price: data.price,
        oldPrice: data.oldPrice ?? null,
        image: data.image,
        quantity,
        gameSlug: data.gameSlug ?? null,
        category: data.category ?? null,
        platform: data.platform ?? null,
      },
    });
    return sendSuccess(res, 201, { item: serializeCartItem(item) });
  } catch (error) {
    console.error('POST /api/cart error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка при добавлении в корзину');
  }
});

const mergeSchema = z.object({
  items: z.array(cartItemSchema),
});

router.post('/merge', async (req, res) => {
  try {
    const parsed = mergeSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные корзины');
    }
    const userId = req.user.id;

    for (const raw of parsed.data.items) {
      const productId = String(raw.productId);
      const quantity = raw.quantity ?? 1;
      const existing = await prisma.cartItem.findUnique({
        where: { userId_productId: { userId, productId } },
      });
      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + quantity,
            title: raw.title,
            price: raw.price,
            oldPrice: raw.oldPrice ?? null,
            image: raw.image,
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId,
            productId,
            title: raw.title,
            price: raw.price,
            oldPrice: raw.oldPrice ?? null,
            image: raw.image,
            quantity,
            gameSlug: raw.gameSlug ?? null,
            category: raw.category ?? null,
            platform: raw.platform ?? null,
          },
        });
      }
    }

    const items = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return sendSuccess(res, 200, { items: items.map(serializeCartItem) });
  } catch (error) {
    console.error('POST /api/cart/merge error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка при синхронизации корзины');
  }
});

router.patch('/:productId', async (req, res) => {
  try {
    const productId = String(req.params.productId);
    const quantity = Number(req.body?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return sendError(res, 400, 'VALIDATION', 'Некорректное количество');
    }
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });
    if (!existing) {
      return sendError(res, 404, 'NOT_FOUND', 'Товар не найден в корзине');
    }
    const item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });
    return sendSuccess(res, 200, { item: serializeCartItem(item) });
  } catch (error) {
    console.error('PATCH /api/cart/:productId error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка при обновлении корзины');
  }
});

router.delete('/:productId', async (req, res) => {
  try {
    const productId = String(req.params.productId);
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id, productId },
    });
    return sendSuccess(res, 200, { removed: true });
  } catch (error) {
    console.error('DELETE /api/cart/:productId error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка при удалении из корзины');
  }
});

router.delete('/', async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    return sendSuccess(res, 200, { cleared: true });
  } catch (error) {
    console.error('DELETE /api/cart error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка при очистке корзины');
  }
});

module.exports = router;
