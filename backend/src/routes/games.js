const express = require('express');
const { prisma } = require('../prisma');
const { sendError, sendSuccess } = require('../utils/errors');
const { serializeGame } = require('../utils/serializers');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const games = await prisma.game.findMany({ orderBy: { id: 'asc' } });
    return sendSuccess(res, 200, { games: games.map(serializeGame) });
  } catch (error) {
    console.error('GET /api/games error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить игры');
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const game = await prisma.game.findUnique({ where: { slug: req.params.slug } });
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
