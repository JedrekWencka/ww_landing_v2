#!/usr/bin/env bash
# Installs / updates the shop API on the server (container ww-shop-api, folder /opt/ww_shop).
#   ./deploy/shop-api.sh
# First run: it creates /opt/ww_shop/.env from .env.example and stops, so you can fill in the Stripe keys
# ON THE SERVER (ssh in and edit the file). Keys never pass through this script or through chat.
# Run it again afterwards. Data (stock, orders) lives in /opt/ww_shop/data and is never touched.
set -euo pipefail

HOST="${HETZNER_HOST:-root@2.28.230.117}"
REMOTE_DIR="${SHOP_DIR:-/opt/ww_shop}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Running the API tests first..."
node server/test/shop.test.mjs

ssh -o BatchMode=yes "$HOST" "mkdir -p '$REMOTE_DIR/src/data' '$REMOTE_DIR/data'"
rsync -az --delete server/ "$HOST:$REMOTE_DIR/server/"
rsync -az src/data/products.js "$HOST:$REMOTE_DIR/src/data/products.js"
rsync -az src/links.js "$HOST:$REMOTE_DIR/src/links.js"
rsync -az Dockerfile.shop docker-compose.shop.yml "$HOST:$REMOTE_DIR/"

if ! ssh -o BatchMode=yes "$HOST" "test -s '$REMOTE_DIR/.env'"; then
  scp -q .env.example "$HOST:$REMOTE_DIR/.env"
  ssh "$HOST" "chmod 600 '$REMOTE_DIR/.env'"
  echo
  echo "Created $REMOTE_DIR/.env from the template. Fill in the Stripe keys, then run this script again:"
  echo "  ssh $HOST nano $REMOTE_DIR/.env"
  exit 0
fi

ssh -o BatchMode=yes "$HOST" "cd '$REMOTE_DIR' && docker compose -f docker-compose.shop.yml up -d --build && sleep 2 && curl -s http://172.17.0.1:8787/api/health && echo"
echo "Shop API is running. Orders: ssh $HOST 'docker exec ww-shop-api node server/admin.mjs orders'"
