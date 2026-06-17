require('dotenv').config();

const { createApp } = require('./app');

const port = Number(process.env.BACKEND_PORT || process.env.PORT || 4000);
const host = process.env.BACKEND_HOST || '0.0.0.0';

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('Missing JWT_ACCESS_SECRET or JWT_REFRESH_SECRET');
  process.exit(1);
}

const app = createApp();

app.listen(port, host, () => {
  console.log(`Backend API listening on http://${host}:${port}`);
});

module.exports = app;
