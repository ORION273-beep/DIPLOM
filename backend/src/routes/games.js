const express = require('express');
const { Game, toPlain } = require('../db/models');
const { sendError, sendSuccess } = require('../utils/errors');
const { serializeGame } = require('../utils/serializers');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const games = await Game.find().sort({ _id: 1 }).lean();
    return sendSuccess(res, 200, { games: games.map((g) => serializeGame(toPlain(g))) });
  } catch (error) {
    console.error('GET /api/games error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить игры');
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const game = toPlain(await Game.findOne({ slug: req.params.slug }).lean());
    if (!game) {
      return sendError(res, 404, 'NOT_FOUND', 'Игра не найдена');
    }
    return sendSuccess(res, 200, { game: serializeGame(game) });
  } catch (error) {
    console.error('GET /api/games/:slug error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить игру');
  }
});

module.exports = router;
