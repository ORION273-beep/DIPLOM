const express = require('express');
const { Category, toPlain } = require('../db/models');
const { sendError, sendSuccess } = require('../utils/errors');
const { serializeCategory } = require('../utils/serializers');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const categories = await Category.find().sort({ _id: 1 }).lean();
    return sendSuccess(res, 200, {
      categories: categories.map((c) => serializeCategory(toPlain(c))),
    });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить категории');
  }
});

module.exports = router;
