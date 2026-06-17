#!/usr/bin/env bash
set -euo pipefail

# Configure Render web service via API (Node runtime, no hardcoded PORT).
# Usage: RENDER_API_KEY=rnd_... ./scripts/render-configure.sh

: "${RENDER_API_KEY:?Set RENDER_API_KEY from https://dashboard.render.com/u/settings#api-keys}"

API="https://api.render.com/v1"
SERVICE_NAME="${SERVICE_NAME:-orion-diplom-web}"

service_id="$(
  curl -fsS -H "Authorization: Bearer ${RENDER_API_KEY}" \
    "${API}/services?limit=100" \
    | node -e "
      let data = '';
      process.stdin.on('data', (c) => (data += c));
      process.stdin.on('end', () => {
        const json = JSON.parse(data);
        const item = (json || []).find((x) => x.service?.name === process.argv[1]);
        if (!item) {
          console.error('Service not found:', process.argv[1]);
          process.exit(1);
        }
        process.stdout.write(item.service.id);
      });
    " "${SERVICE_NAME}"
)"

echo "Service: ${SERVICE_NAME} (${service_id})"

curl -fsS -X PATCH \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  "${API}/services/${service_id}" \
  -d '{
    "serviceDetails": {
      "runtime": "node",
      "buildCommand": "npm ci && BACKEND_URL=https://orion-diplom-api.onrender.com npm run render-build",
      "startCommand": "npm run render-start",
      "healthCheckPath": "/api/health",
      "envSpecificDetails": {
        "buildCommand": "npm ci && BACKEND_URL=https://orion-diplom-api.onrender.com npm run render-build",
        "startCommand": "npm run render-start"
      }
    }
  }' > /dev/null

echo "Updated runtime to Node."

curl -fsS -X POST \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  "${API}/services/${service_id}/deploys" \
  -d '{"clearCache":"clear"}' > /dev/null

echo "Deploy triggered."
