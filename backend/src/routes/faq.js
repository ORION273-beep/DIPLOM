const express = require('express');
const { prisma } = require('../prisma');
const { sendError, sendSuccess } = require('../utils/errors');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const items = await prisma.faqItem.findMany({ orderBy: { sort: 'asc' } });
    return sendSuccess(res, 200, { items });
  } catch (error) {
    console.error('GET /api/faq error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить FAQ');
  }
});

module.exports = router;
