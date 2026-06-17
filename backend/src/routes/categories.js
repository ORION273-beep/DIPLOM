const express = require('express');
const { prisma } = require('../prisma');
const { sendError, sendSuccess } = require('../utils/errors');
const { serializeCategory } = require('../utils/serializers');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
    return sendSuccess(res, 200, { categories: categories.map(serializeCategory) });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить категории');
  }
});

module.exports = router;
