const express = require('express');
const { z } = require('zod');
const { prisma } = require('../prisma');
const { sendError, sendSuccess } = require('../utils/errors');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, 200, { reviews });
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить отзывы');
  }
});

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10).max(2000),
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные отзыва');
    }

    const completedOrder = await prisma.order.findFirst({
      where: { userId: req.user.id, status: 'completed' },
    });
    if (!completedOrder) {
      return sendError(res, 403, 'FORBIDDEN', 'Отзыв можно оставить только после завершённого заказа');
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const author = user?.email?.split('@')[0] || 'Покупатель';

    const review = await prisma.review.create({
      data: {
        author,
        rating: parsed.data.rating,
        text: parsed.data.text.trim(),
        userId: req.user.id,
        published: false,
      },
    });

    return sendSuccess(res, 201, {
      review,
      message: 'Отзыв отправлен на модерацию',
    });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось сохранить отзыв');
  }
});

module.exports = router;
