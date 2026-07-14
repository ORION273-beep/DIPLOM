const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const yaml = require('yaml');
const swaggerUi = require('swagger-ui-express');
const { isMongoReady } = require('./db/ensureMongo');
const { sendError } = require('./utils/errors');

const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const reviewsRoutes = require('./routes/reviews');
const faqRoutes = require('./routes/faq');
const favoritesRoutes = require('./routes/favorites');
const cartRoutes = require('./routes/cart');
const paymentsRoutes = require('./routes/payments');

function loadOpenApiSpec() {
  const specPath = path.join(__dirname, '..', 'openapi.yaml');
  const raw = fs.readFileSync(specPath, 'utf-8');
  return yaml.parse(raw);
}

function createApp() {
  const app = express();
  const isTest = process.env.NODE_ENV === 'test';
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());

  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const ordersLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const adminLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });

  if (!isTest) {
    app.use('/api', apiLimiter);
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
    app.use('/api/auth/signup', authLimiter);
    app.use('/api/auth/refresh', authLimiter);
    app.use('/api/auth/forgot-password', authLimiter);
    app.use('/api/auth/reset-password', authLimiter);
    app.use('/api/orders', ordersLimiter);
    app.use('/api/admin', adminLimiter);
  }

  app.get('/api/health', async (_req, res) => {
    if (isMongoReady()) {
      return res.json({ ok: true, status: 'ok', db: 'connected' });
    }
    return res.status(503).json({ ok: false, status: 'degraded', db: 'disconnected' });
  });

  try {
    const openApiSpec = loadOpenApiSpec();
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  } catch (err) {
    console.warn('Swagger UI disabled:', err.message);
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/games', gamesRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/faq', faqRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/payments', paymentsRoutes);

  app.use((_req, res) => {
    return sendError(res, 404, 'NOT_FOUND', 'Маршрут не найден');
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    return sendError(res, 500, 'INTERNAL', 'Внутренняя ошибка сервера');
  });

  return app;
}

module.exports = { createApp };
