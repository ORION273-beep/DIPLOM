const express = require('express');
const { prisma } = require('../prisma');
const { sendError, sendSuccess } = require('../utils/errors');
const { serializeProduct } = require('../utils/serializers');
const { isSameId } = require('../utils/ids');

const router = express.Router();

const CURRENCY_CATEGORIES = [
  'pubg-mobile',
  'genshin-impact',
  'free-fire',
  'brawl-stars',
  'minecraft',
  'roblox',
];

function buildProductWhere(query) {
  const where = { AND: [] };

  if (typeof query.gameSlug === 'string' && query.gameSlug) {
    where.AND.push({ gameSlug: query.gameSlug });
  }
  if (typeof query.category === 'string' && query.category) {
    where.AND.push({ category: query.category });
  }
  if (typeof query.platform === 'string' && query.platform) {
    where.AND.push({ platform: query.platform });
  }
  if (query.inStock === '1') {
    where.AND.push({ inStock: true });
  }
  if (query.popular === '1' || query.sort === 'popular') {
    where.AND.push({ popular: true });
  }

  const min = query.min != null ? Number(query.min) : null;
  const max = query.max != null ? Number(query.max) : null;
  if (min != null && !Number.isNaN(min)) {
    where.AND.push({ price: { gte: min } });
  }
  if (max != null && !Number.isNaN(max)) {
    where.AND.push({ price: { lte: max } });
  }

  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q) {
    where.AND.push({
      OR: [
        { title: { contains: q } },
        { title: { contains: q.toLowerCase() } },
        { title: { contains: q.charAt(0).toUpperCase() + q.slice(1).toLowerCase() } },
      ],
    });
  }

  if (query.discount === '1') {
    where.AND.push({ oldPrice: { not: null } });
  }

  if (query.currency === '1') {
    where.AND.push({
      OR: [
        { category: { in: CURRENCY_CATEGORIES } },
        { gameSlug: { in: CURRENCY_CATEGORIES } },
      ],
    });
  }

  if (where.AND.length === 0) {
    return {};
  }
  return where;
}

function buildProductOrder(sort) {
  if (sort === 'price_asc') return { price: 'asc' };
  if (sort === 'price_desc') return { price: 'desc' };
  return { id: 'asc' };
}

router.get('/', async (req, res) => {
  try {
    const where = buildProductWhere(req.query);
    const sort = typeof req.query.sort === 'string' ? req.query.sort : '';
    const onlyDiscount = req.query.discount === '1';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));
    const skip = (page - 1) * limit;

    let products = await prisma.product.findMany({
      where,
      orderBy: buildProductOrder(sort),
    });

    if (onlyDiscount) {
      products = products.filter((p) => p.oldPrice != null && p.oldPrice > p.price);
    }

    const total = products.length;
    const paged = products.slice(skip, skip + limit);

    return sendSuccess(res, 200, {
      products: paged.map(serializeProduct),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить товары');
  }
});

router.get('/:id', async (req, res) => {
  try {
    let product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      const products = await prisma.product.findMany();
      product = products.find((p) => isSameId(p.id, req.params.id)) ?? null;
    }
    if (!product) {
      return sendError(res, 404, 'NOT_FOUND', 'Товар не найден');
    }
    return sendSuccess(res, 200, { product: serializeProduct(product) });
  } catch (error) {
    console.error('GET /api/products/:id error:', error);
    return sendError(res, 500, 'SERVER', 'Не удалось загрузить товар');
  }
});

module.exports = router;
