const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-key-32chars!!';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-32chars!';

let app;
let ensureMongoConnection;
let shutdownMongo;
let runSeed;

test.before(async () => {
  ({ ensureMongoConnection, shutdownMongo } = require('../src/db/ensureMongo'));
  ({ runSeed } = require('../src/db/seed'));
  await ensureMongoConnection({ allowMemoryFallback: true });
  await runSeed({ wipe: true });
  const { createApp } = require('../src/app');
  app = createApp();
});

test.after(async () => {
  if (shutdownMongo) await shutdownMongo();
});

async function registerAndLogin(email, password = 'secret123') {
  await request(app).post('/api/auth/register').send({ email, password });
  const loginRes = await request(app).post('/api/auth/login').send({ email, password });
  return { email, password, token: loginRes.body.accessToken };
}

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});

test('GET /api/products returns product list', async () => {
  const res = await request(app).get('/api/products');
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.ok(Array.isArray(res.body.products));
  assert.ok(res.body.products.length > 0);
});

test('GET /api/products?q filters by title', async () => {
  const allRes = await request(app).get('/api/products?limit=1');
  const title = allRes.body.products[0]?.title?.slice(0, 4);
  if (!title) return;
  const res = await request(app).get(`/api/products?q=${encodeURIComponent(title)}`);
  assert.equal(res.status, 200);
  assert.ok(res.body.products.length >= 1);
});

test('GET /api/categories returns category list', async () => {
  const res = await request(app).get('/api/categories');
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.ok(Array.isArray(res.body.categories));
});

test('GET /api/reviews returns published reviews', async () => {
  const res = await request(app).get('/api/reviews');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.reviews));
});

test('GET /api/faq returns faq items', async () => {
  const res = await request(app).get('/api/faq');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.items));
  assert.ok(res.body.items.length > 0);
});

test('POST /api/auth/register and login flow', async () => {
  const email = `test_${Date.now()}@example.com`;
  const password = 'secret123';

  const registerRes = await request(app).post('/api/auth/register').send({ email, password });

  assert.equal(registerRes.status, 201);
  assert.equal(registerRes.body.ok, true);

  const loginRes = await request(app).post('/api/auth/login').send({ email, password });

  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.ok, true);
  assert.ok(loginRes.body.accessToken);
  assert.equal(loginRes.body.user.email, email);
});

test('cart requires auth', async () => {
  const res = await request(app).get('/api/cart');
  assert.equal(res.status, 401);
});

test('cart add and list for authenticated user', async () => {
  const { token } = await registerAndLogin(`cart_${Date.now()}@example.com`);
  const productsRes = await request(app).get('/api/products?limit=1');
  const product = productsRes.body.products[0];
  assert.ok(product);

  const addRes = await request(app)
    .post('/api/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  assert.equal(addRes.status, 201);

  const listRes = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.items.some((i) => String(i.id) === String(product.id)));
});

test('favorites add and remove', async () => {
  const { token } = await registerAndLogin(`fav_${Date.now()}@example.com`);
  const productsRes = await request(app).get('/api/products?limit=1');
  const product = productsRes.body.products[0];

  const addRes = await request(app)
    .post('/api/favorites')
    .set('Authorization', `Bearer ${token}`)
    .send({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
  assert.equal(addRes.status, 201);

  const listRes = await request(app)
    .get('/api/favorites')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.favorites.length >= 1);

  const delRes = await request(app)
    .delete(`/api/favorites/${product.id}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(delRes.status, 200);
});

test('create order decrements stock', async () => {
  const { token } = await registerAndLogin(`order_${Date.now()}@example.com`);
  const productsRes = await request(app).get('/api/products?limit=1');
  const product = productsRes.body.products[0];
  const before = product.stock;

  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ items: [{ productId: product.id, quantity: 1 }], paymentMethod: 'card' });

  assert.equal(orderRes.status, 201);
  assert.ok(orderRes.body.order?.id);

  const afterRes = await request(app).get(`/api/products/${product.id}`);
  assert.equal(afterRes.body.product.stock, before - 1);
});

test('admin products requires admin', async () => {
  const { token } = await registerAndLogin(`user_${Date.now()}@example.com`);
  const res = await request(app)
    .get('/api/admin/products')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 403);
});
