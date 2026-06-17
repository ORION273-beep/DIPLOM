#!/bin/sh
set -e

cd /app

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

node src/server.js &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd /app/web
exec node --max-old-space-size=400 server.js
