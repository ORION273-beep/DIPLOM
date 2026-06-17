const express = require('express');
const { prisma } = require('../prisma');
const { sendError, sendSuccess } = require('../utils/errors');

const router = express.Router();

/**
 * Simulated payment webhook — advances order pending → processing → completed.
 * In production this would be called by a payment provider.
 */
router.post('/webhook', async (req, res) => {
  try {
    const orderId = typeof req.body?.orderId === 'string' ? req.body.orderId.trim() : '';
    const secret = typeof req.body?.secret === 'string' ? req.body.secret : '';
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'dev-webhook-secret';

    if (!orderId) {
      return sendError(res, 400, 'VALIDATION', 'orderId обязателен');
    }
    if (secret !== webhookSecret) {
      return sendError(res, 403, 'FORBIDDEN', 'Неверный секрет webhook');
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return sendError(res, 404, 'NOT_FOUND', 'Заказ не найден');
    }
    if (order.status === 'completed') {
      return sendSuccess(res, 200, { orderId, status: 'completed', message: 'Уже оплачен' });
    }
    if (order.status === 'failed' || order.status === 'refunded') {
      return sendError(res, 400, 'INVALID_STATUS', `Заказ в статусе ${order.status}`);
    }

    const now = new Date();
    const nextStatus = order.status === 'pending' ? 'processing' : 'completed';

    await prisma.$transaction(async (tx) => {
      await tx.orderStatusEntry.create({
        data: {
          orderId: order.id,
          status: nextStatus,
          changedAt: now,
          changedBy: 'payment-webhook',
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: nextStatus, updatedAt: now },
      });
      if (nextStatus === 'processing') {
        // Second webhook call completes the order
        const later = new Date(now.getTime() + 1);
        await tx.orderStatusEntry.create({
          data: {
            orderId: order.id,
            status: 'completed',
            changedAt: later,
            changedBy: 'payment-webhook',
          },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'completed', updatedAt: later },
        });
      }
    });

    return sendSuccess(res, 200, { orderId, status: 'completed' });
  } catch (error) {
    console.error('POST /api/payments/webhook error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка обработки webhook');
  }
});

module.exports = router;
