const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-key-32chars!!';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-32chars!';

const { createApp } = require('../src/app');
const app = createApp();

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

  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ email, password });

  assert.equal(registerRes.status, 201);
  assert.equal(registerRes.body.ok, true);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.ok, true);
  assert.ok(loginRes.body.accessToken);
  assert.equal(loginRes.body.user.email, email);
});

test('POST /api/auth/forgot-password and reset-password flow', async () => {
  const email = `reset_${Date.now()}@example.com`;
  const password = 'secret123';
  await request(app).post('/api/auth/register').send({ email, password });

  const forgotRes = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email });
  assert.equal(forgotRes.status, 200);

  const { prisma } = require('../src/prisma');
  const row = await prisma.passwordResetToken.findFirst({
    where: { user: { email } },
    orderBy: { createdAt: 'desc' },
  });
  assert.ok(row, 'reset token should exist');

  const resetRes = await request(app)
    .post('/api/auth/reset-password')
    .send({ token: row.token, password: 'newpass123' });
  assert.equal(resetRes.status, 200);

  const loginOld = await request(app).post('/api/auth/login').send({ email, password });
  assert.equal(loginOld.status, 401);

  const loginNew = await request(app).post('/api/auth/login').send({ email, password: 'newpass123' });
  assert.equal(loginNew.status, 200);
});

test('PATCH /api/auth/password changes password', async () => {
  const { email, password, token } = await registerAndLogin(`pwd_${Date.now()}@example.com`);

  const res = await request(app)
    .patch('/api/auth/password')
    .set('Authorization', `Bearer ${token}`)
    .send({ currentPassword: password, newPassword: 'newpass456' });
  assert.equal(res.status, 200);

  const loginNew = await request(app).post('/api/auth/login').send({ email, password: 'newpass456' });
  assert.equal(loginNew.status, 200);
});

test('POST /api/orders decrements stock', async () => {
  const { token } = await registerAndLogin(`order_${Date.now()}@example.com`);

  const productsRes = await request(app).get('/api/products?inStock=1&limit=1');
  const product = productsRes.body.products[0];
  assert.ok(product, 'need at least one product');

  const beforeStock = product.stock;

  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      paymentMethod: 'card',
      items: [{ productId: product.id, quantity: 1 }],
    });

  assert.equal(orderRes.status, 201);
  assert.equal(orderRes.body.order.paymentMethod, 'card');

  const productRes = await request(app).get(`/api/products/${product.id}`);
  assert.equal(productRes.body.product.stock, beforeStock - 1);
});

test('POST /api/orders with balance deducts user balance', async () => {
  const email = `bal_${Date.now()}@example.com`;
  const { token } = await registerAndLogin(email);
  const { prisma } = require('../src/prisma');
  await prisma.user.update({ where: { email }, data: { balance: 10000 } });

  const productsRes = await request(app).get('/api/products?inStock=1&limit=1');
  const product = productsRes.body.products[0];

  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      paymentMethod: 'balance',
      items: [{ productId: product.id, quantity: 1 }],
    });
  assert.equal(orderRes.status, 201);

  const user = await prisma.user.findUnique({ where: { email } });
  assert.ok(user.balance < 10000);
});

test('POST /api/orders rejects insufficient balance', async () => {
  const email = `nobal_${Date.now()}@example.com`;
  const { token } = await registerAndLogin(email);
  const { prisma } = require('../src/prisma');
  await prisma.user.update({ where: { email }, data: { balance: 0 } });

  const productsRes = await request(app).get('/api/products?inStock=1&limit=1');
  const product = productsRes.body.products[0];

  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      paymentMethod: 'balance',
      items: [{ productId: product.id, quantity: 1 }],
    });
  assert.equal(orderRes.status, 400);
  assert.equal(orderRes.body.error.code, 'INSUFFICIENT_BALANCE');
});

test('POST /api/orders idempotency returns same order', async () => {
  const { token } = await registerAndLogin(`idem_${Date.now()}@example.com`);
  const productsRes = await request(app).get('/api/products?inStock=1&limit=1');
  const product = productsRes.body.products[0];
  const key = `idem-${Date.now()}`;
  const body = {
    paymentMethod: 'card',
    idempotencyKey: key,
    items: [{ productId: product.id, quantity: 1 }],
  };

  const first = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send(body);
  const second = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send(body);
  assert.equal(first.status, 201);
  assert.equal(second.status, 200);
  assert.equal(first.body.order.id, second.body.order.id);
});

test('PATCH /api/admin/orders/:id updates status', async () => {
  const adminEmail = `admin_${Date.now()}@example.com`;
  await request(app).post('/api/auth/register').send({ email: adminEmail, password: 'secret123' });
  const { prisma } = require('../src/prisma');
  await prisma.user.update({
    where: { email: adminEmail },
    data: { role: 'ADMIN' },
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: 'secret123' });

  const token = loginRes.body.accessToken;

  const ordersRes = await request(app)
    .get('/api/admin/orders')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(ordersRes.status, 200);
  const order = ordersRes.body.orders[0];
  assert.ok(order, 'need at least one order in seed');

  const patchRes = await request(app)
    .patch(`/api/admin/orders/${order.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'processing' });

  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.body.order.status, 'processing');
});

test('admin products CRUD', async () => {
  const adminEmail = `admprod_${Date.now()}@example.com`;
  await request(app).post('/api/auth/register').send({ email: adminEmail, password: 'secret123' });
  const { prisma } = require('../src/prisma');
  await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } });
  const loginRes = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'secret123' });
  const token = loginRes.body.accessToken;

  const createRes = await request(app)
    .post('/api/admin/products')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test Product',
      category: 'test',
      platform: 'pc',
      price: 99,
      image: '/placeholder.svg',
      stock: 5,
    });
  assert.equal(createRes.status, 201);
  const id = createRes.body.product.id;

  const patchRes = await request(app)
    .patch(`/api/admin/products/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ price: 89 });
  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.body.product.price, 89);

  const delRes = await request(app)
    .delete(`/api/admin/products/${id}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(delRes.status, 200);
});

test('GET /api/admin/stats requires admin', async () => {
  const { token } = await registerAndLogin(`user_${Date.now()}@example.com`);
  const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 403);
});

test('cart CRUD for authenticated user', async () => {
  const { token } = await registerAndLogin(`cart_${Date.now()}@example.com`);
  const productsRes = await request(app).get('/api/products?limit=1');
  const product = productsRes.body.products[0];

  const addRes = await request(app)
    .post('/api/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 2,
    });
  assert.equal(addRes.status, 201);

  const listRes = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.items.length, 1);
  assert.equal(listRes.body.items[0].quantity, 2);

  const delRes = await request(app)
    .delete(`/api/cart/${product.id}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(delRes.status, 200);
});

test('favorites CRUD for authenticated user', async () => {
  const { token } = await registerAndLogin(`fav_${Date.now()}@example.com`);

  const productsRes = await request(app).get('/api/products?limit=1');
  const product = productsRes.body.products[0];
  assert.ok(product);

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
  assert.equal(listRes.body.favorites.length, 1);

  const delRes = await request(app)
    .delete(`/api/favorites/${product.id}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(delRes.status, 200);
});

test('POST /api/reviews requires completed order', async () => {
  const { token } = await registerAndLogin(`rev_${Date.now()}@example.com`);
  const res = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${token}`)
    .send({ rating: 5, text: 'Отличный сервис, всё быстро!' });
  assert.equal(res.status, 403);
});

test('unknown route returns standardized error', async () => {
  const res = await request(app).get('/api/unknown-route');
  assert.equal(res.status, 404);
  assert.equal(res.body.ok, false);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});

test('unauthorized admin returns 403', async () => {
  const { token } = await registerAndLogin(`noadmin_${Date.now()}@example.com`);
  const res = await request(app)
    .get('/api/admin/products')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 403);
});
