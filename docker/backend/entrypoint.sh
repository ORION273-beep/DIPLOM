#!/bin/sh
set -e

cd /app

echo "Running Prisma migrations..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "RUN_SEED=true — seeding database..."
  npm run db:seed
else
  GAME_COUNT=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.game.count()
      .then((n) => { console.log(n); return prisma.\$disconnect(); })
      .catch(() => { console.log(0); return prisma.\$disconnect(); });
  ")
  if [ "$GAME_COUNT" = "0" ]; then
    echo "Database is empty — running initial seed..."
    npm run db:seed
  else
    echo "Database already has data — skipping seed."
  fi
fi

echo "Starting backend server..."
exec node src/server.js
