#!/bin/sh
set -e

echo "[onesec-web] PORT=${PORT:-unset} HOSTNAME=${HOSTNAME:-unset} BACKEND_URL=${BACKEND_URL:-unset}"

exec node --max-old-space-size=400 server.js
