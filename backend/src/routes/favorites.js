const express = require('express');
const { z } = require('zod');
const { Favorite, toPlain } = require('../db/models');
const { sendError, sendSuccess } = require('../utils/errors');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const favoriteSchema = z.object({
  productId: z.union([z.string(), z.number()]),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  oldPrice: z.number().nonnegative().nullable().optional(),
  image: z.string().min(1),
});

function serializeFavorite(f) {
  return {
    id: f.productId,
    title: f.title,
    price: f.price,
    oldPrice: f.oldPrice ?? null,
    image: f.image,
  };
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    return sendSuccess(res, 200, {
      favorites: favorites.map((f) => serializeFavorite(toPlain(f))),
    });
  } catch (error) {
    console.error('GET /api/favorites error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка при загрузке избранного');
  }
});

router.post('/', async (req, res) => {
  try {
    const parsed = favoriteSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные товара');
    }

    const { productId, title, price, oldPrice, image } = parsed.data;
    const productIdStr = String(productId);

    const favorite = toPlain(
      await Favorite.findOneAndUpdate(
        { userId: req.user.id, productId: productIdStr },
        {
          $set: {
            userId: req.user.id,
            productId: productIdStr,
            title,
            price,
            oldPrice: oldPrice ?? null,
            image,
          },
        },
        { upsert: true, new: true },
      ).lean(),
    );

    return sendSuccess(res, 201, { favorite: serializeFavorite(favorite) });
  } catch (error) {
    console.error('POST /api/favorites error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка при добавлении в избранное');
  }
});

router.delete('/:productId', async (req, res) => {
  try {
    const productId = String(req.params.productId);
    await Favorite.deleteMany({ userId: req.user.id, productId });
    return sendSuccess(res, 200, { removed: true });
  } catch (error) {
    console.error('DELETE /api/favorites/:productId error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка при удалении из избранного');
  }
});

module.exports = router;
