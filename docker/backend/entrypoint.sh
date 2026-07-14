#!/bin/sh
set -e

cd /app

echo "Starting backend (MongoDB will be connected by server)..."
exec node src/server.js
