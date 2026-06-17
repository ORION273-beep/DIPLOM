#!/bin/sh
set -e

cd /app

echo "[onesec] running prisma migrate..."
npx prisma migrate deploy

node <<'EOF'
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

(async () => {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('Empty database — running seed...');
      execSync('npm run db:seed', { stdio: 'inherit' });
    }
  } finally {
    await prisma.$disconnect();
  }
})();
EOF

export BACKEND_PORT=4001
export BACKEND_HOST=127.0.0.1
export BACKEND_URL=http://127.0.0.1:4001
export HOSTNAME=0.0.0.0

echo "[onesec] starting backend on ${BACKEND_HOST}:${BACKEND_PORT}..."
node --max-old-space-size=128 src/server.js &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

sleep 1

echo "[onesec] starting Next.js on PORT=${PORT:-3000}..."
cd /app/web
exec node --max-old-space-size=256 server.js
