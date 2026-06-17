const express = require('express');
const { z } = require('zod');
const { prisma } = require('../prisma');
const { sendError, sendSuccess } = require('../utils/errors');
const { serializeOrder, serializeProduct, serializeGame } = require('../utils/serializers');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { isSameId } = require('../utils/ids');

const router = express.Router();
const ORDER_STATUSES = ['pending', 'processing', 'completed', 'failed', 'refunded'];

router.use(requireAuth, requireAdmin);

router.get('/orders', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: true,
          user: { select: { email: true } },
          statusHistory: { orderBy: { changedAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count(),
    ]);
    return sendSuccess(res, 200, {
      orders: orders.map(serializeOrder),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error('GET /api/admin/orders error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера при загрузке заказов');
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id },
      include: { items: true, statusHistory: { orderBy: { changedAt: 'asc' } } },
    });
    if (!order) {
      return sendError(res, 404, 'NOT_FOUND', 'Заказ не найден');
    }
    return sendSuccess(res, 200, { order: serializeOrder(order) });
  } catch (error) {
    console.error('GET /api/admin/orders/:id error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера при загрузке заказа');
  }
});

router.patch('/orders/:id', async (req, res) => {
  try {
    const status = typeof req.body?.status === 'string' ? req.body.status.trim() : '';
    if (!ORDER_STATUSES.includes(status)) {
      return sendError(res, 400, 'VALIDATION', 'Некорректный статус');
    }
    const changedAt = new Date();
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id: req.params.id } });
      if (!existing) return null;
      await tx.orderStatusEntry.create({
        data: {
          orderId: existing.id,
          status,
          changedAt,
          changedBy: req.user.id,
        },
      });
      return tx.order.update({
        where: { id: existing.id },
        data: { status, updatedAt: changedAt },
        include: { items: true, statusHistory: { orderBy: { changedAt: 'asc' } } },
      });
    });
    if (!order) {
      return sendError(res, 404, 'NOT_FOUND', 'Заказ не найден');
    }
    return sendSuccess(res, 200, { order: serializeOrder(order) });
  } catch (error) {
    console.error('PATCH /api/admin/orders/:id error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера');
  }
});

router.get('/products', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    return sendSuccess(res, 200, { products: products.map(serializeProduct) });
  } catch (error) {
    console.error('GET /api/admin/products error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить товары');
  }
});

const productSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  platform: z.string().min(1),
  price: z.number().positive(),
  oldPrice: z.number().positive().nullable().optional(),
  image: z.string().min(1),
  description: z.string().optional(),
  popular: z.boolean().optional(),
  inStock: z.boolean().optional(),
  stock: z.number().int().nonnegative().optional(),
  gameSlug: z.string().nullable().optional(),
});

router.post('/products', async (req, res) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные товара');
    }
    const data = parsed.data;
    const products = await prisma.product.findMany({ select: { id: true } });
    const numericIds = products
      .map((p) => p.id)
      .filter((id) => /^\d+$/.test(id))
      .map((id) => Number(id));
    const nextId = String((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    const stock = data.stock ?? 100;
    const product = await prisma.product.create({
      data: {
        id: nextId,
        title: data.title,
        category: data.category,
        platform: data.platform,
        price: data.price,
        oldPrice: data.oldPrice ?? null,
        image: data.image,
        description: data.description ?? null,
        popular: data.popular ?? false,
        inStock: data.inStock ?? stock > 0,
        stock,
        gameSlug: data.gameSlug ?? null,
      },
    });
    return sendSuccess(res, 201, { product: serializeProduct(product) });
  } catch (error) {
    console.error('POST /api/admin/products error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось создать товар');
  }
});

router.patch('/products/:id', async (req, res) => {
  try {
    const parsed = productSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные товара');
    }
    const products = await prisma.product.findMany();
    const existing = products.find((p) => isSameId(p.id, req.params.id));
    if (!existing) {
      return sendError(res, 404, 'NOT_FOUND', 'Товар не найден');
    }
    const data = parsed.data;
    const stock = data.stock ?? existing.stock;
    const product = await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...data,
        stock,
        inStock: data.inStock ?? stock > 0,
      },
    });
    return sendSuccess(res, 200, { product: serializeProduct(product) });
  } catch (error) {
    console.error('PATCH /api/admin/products/:id error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось обновить товар');
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    const existing = products.find((p) => isSameId(p.id, req.params.id));
    if (!existing) {
      return sendError(res, 404, 'NOT_FOUND', 'Товар не найден');
    }
    await prisma.product.delete({ where: { id: existing.id } });
    return sendSuccess(res, 200, {});
  } catch (error) {
    console.error('DELETE /api/admin/products/:id error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось удалить товар');
  }
});

router.get('/stats', async (_req, res) => {
  try {
    const [orderCount, productCount, userCount, revenueAgg, statusGroups, topProducts] =
      await Promise.all([
        prisma.order.count(),
        prisma.product.count(),
        prisma.user.count(),
        prisma.order.aggregate({
          where: { status: 'completed' },
          _sum: { totalAmount: true },
        }),
        prisma.order.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        prisma.orderItem.groupBy({
          by: ['title'],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        }),
      ]);

    const ordersByStatus = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count.status])
    );

    return sendSuccess(res, 200, {
      stats: {
        orderCount,
        productCount,
        userCount,
        revenue: revenueAgg._sum.totalAmount ?? 0,
        ordersByStatus,
        topProducts: topProducts.map((p) => ({
          title: p.title,
          quantity: p._sum.quantity ?? 0,
        })),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить статистику');
  }
});

router.get('/games', async (_req, res) => {
  try {
    const games = await prisma.game.findMany({ orderBy: { name: 'asc' } });
    return sendSuccess(res, 200, { games: games.map(serializeGame) });
  } catch (error) {
    console.error('GET /api/admin/games error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить игры');
  }
});

const gameSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  cover: z.string().min(1),
  genres: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
  popular: z.boolean().optional(),
});

router.post('/games', async (req, res) => {
  try {
    const parsed = gameSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные игры');
    }
    const data = parsed.data;
    const existing = await prisma.game.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return sendError(res, 409, 'CONFLICT', 'Игра с таким slug уже существует');
    }
    const games = await prisma.game.findMany({ select: { id: true } });
    const numericIds = games
      .map((g) => g.id)
      .filter((id) => /^\d+$/.test(id))
      .map((id) => Number(id));
    const nextId = String((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    const game = await prisma.game.create({
      data: {
        id: nextId,
        slug: data.slug,
        name: data.name,
        cover: data.cover,
        genres: data.genres ?? [],
        platforms: data.platforms ?? [],
        description: data.description ?? null,
        popular: data.popular ?? false,
      },
    });
    return sendSuccess(res, 201, { game: serializeGame(game) });
  } catch (error) {
    console.error('POST /api/admin/games error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось создать игру');
  }
});

router.patch('/games/:id', async (req, res) => {
  try {
    const parsed = gameSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные игры');
    }
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });
    if (!game) {
      return sendError(res, 404, 'NOT_FOUND', 'Игра не найдена');
    }
    if (parsed.data.slug && parsed.data.slug !== game.slug) {
      const slugTaken = await prisma.game.findUnique({ where: { slug: parsed.data.slug } });
      if (slugTaken) {
        return sendError(res, 409, 'CONFLICT', 'Slug уже занят');
      }
    }
    const updated = await prisma.game.update({
      where: { id: game.id },
      data: parsed.data,
    });
    return sendSuccess(res, 200, { game: serializeGame(updated) });
  } catch (error) {
    console.error('PATCH /api/admin/games/:id error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось обновить игру');
  }
});

router.delete('/games/:id', async (req, res) => {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });
    if (!game) {
      return sendError(res, 404, 'NOT_FOUND', 'Игра не найдена');
    }
    await prisma.game.delete({ where: { id: game.id } });
    return sendSuccess(res, 200, {});
  } catch (error) {
    console.error('DELETE /api/admin/games/:id error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось удалить игру');
  }
});

router.get('/faq', async (_req, res) => {
  try {
    const items = await prisma.faqItem.findMany({ orderBy: { sort: 'asc' } });
    return sendSuccess(res, 200, { items });
  } catch (error) {
    console.error('GET /api/admin/faq error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить FAQ');
  }
});

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  sort: z.number().int().optional(),
});

router.post('/faq', async (req, res) => {
  try {
    const parsed = faqSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные FAQ');
    }
    const items = await prisma.faqItem.findMany({ select: { id: true } });
    const numericIds = items
      .map((i) => i.id)
      .filter((id) => /^\d+$/.test(id))
      .map((id) => Number(id));
    const nextId = String((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    const item = await prisma.faqItem.create({
      data: { id: nextId, ...parsed.data, sort: parsed.data.sort ?? 0 },
    });
    return sendSuccess(res, 201, { item });
  } catch (error) {
    console.error('POST /api/admin/faq error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось создать FAQ');
  }
});

router.patch('/faq/:id', async (req, res) => {
  try {
    const parsed = faqSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные FAQ');
    }
    const item = await prisma.faqItem.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    return sendSuccess(res, 200, { item });
  } catch (error) {
    console.error('PATCH /api/admin/faq/:id error:', error);
    return sendError(res, 404, 'NOT_FOUND', 'FAQ не найден');
  }
});

router.delete('/faq/:id', async (req, res) => {
  try {
    await prisma.faqItem.delete({ where: { id: req.params.id } });
    return sendSuccess(res, 200, {});
  } catch (error) {
    console.error('DELETE /api/admin/faq/:id error:', error);
    return sendError(res, 404, 'NOT_FOUND', 'FAQ не найден');
  }
});

router.get('/reviews', async (_req, res) => {
  try {
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
    return sendSuccess(res, 200, { reviews });
  } catch (error) {
    console.error('GET /api/admin/reviews error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить отзывы');
  }
});

router.patch('/reviews/:id', async (req, res) => {
  try {
    const published = Boolean(req.body?.published);
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { published },
    });
    return sendSuccess(res, 200, { review });
  } catch (error) {
    console.error('PATCH /api/admin/reviews/:id error:', error);
    return sendError(res, 404, 'NOT_FOUND', 'Отзыв не найден');
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    return sendSuccess(res, 200, {});
  } catch (error) {
    console.error('DELETE /api/admin/reviews/:id error:', error);
    return sendError(res, 404, 'NOT_FOUND', 'Отзыв не найден');
  }
});

router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          balance: true,
          blocked: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);
    return sendSuccess(res, 200, {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role.toLowerCase(),
        balance: u.balance,
        blocked: u.blocked,
        createdAt: u.createdAt.toISOString(),
        orderCount: u._count.orders,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить пользователей');
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const data = {};
    if (typeof req.body?.role === 'string') {
      const role = req.body.role.toUpperCase();
      if (!['USER', 'ADMIN'].includes(role)) {
        return sendError(res, 400, 'VALIDATION', 'Некорректная роль');
      }
      data.role = role;
    }
    if (typeof req.body?.blocked === 'boolean') {
      data.blocked = req.body.blocked;
    }
    if (typeof req.body?.balance === 'number' && req.body.balance >= 0) {
      data.balance = req.body.balance;
    }
    if (Object.keys(data).length === 0) {
      return sendError(res, 400, 'VALIDATION', 'Нет данных для обновления');
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, email: true, role: true, balance: true, blocked: true },
    });
    return sendSuccess(res, 200, {
      user: {
        ...user,
        role: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('PATCH /api/admin/users/:id error:', error);
    return sendError(res, 404, 'NOT_FOUND', 'Пользователь не найден');
  }
});

module.exports = router;
