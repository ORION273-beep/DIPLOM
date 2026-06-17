const { spawnSync } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, '..', 'backend');
const result = spawnSync(
  'npx',
  ['prisma', 'db', 'seed'],
  {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    },
  }
);

process.exit(result.status ?? 1);
