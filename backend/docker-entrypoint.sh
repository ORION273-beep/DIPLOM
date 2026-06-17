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

exec node src/server.js
