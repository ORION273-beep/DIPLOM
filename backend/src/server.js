require('dotenv').config();

const { createApp } = require('./app');

const port = Number(process.env.PORT || process.env.BACKEND_PORT || 4000);

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('Missing JWT_ACCESS_SECRET or JWT_REFRESH_SECRET');
  process.exit(1);
}

const app = createApp();

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});

module.exports = app;
