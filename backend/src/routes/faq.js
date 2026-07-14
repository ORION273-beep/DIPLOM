const express = require('express');
const { FaqItem, toPlain } = require('../db/models');
const { sendError, sendSuccess } = require('../utils/errors');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const items = await FaqItem.find().sort({ sort: 1 }).lean();
    return sendSuccess(res, 200, { items: items.map(toPlain) });
  } catch (error) {
    console.error('GET /api/faq error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить FAQ');
  }
});

module.exports = router;
