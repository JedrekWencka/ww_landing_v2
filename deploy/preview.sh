#!/usr/bin/env bash
# Builds the redesign and publishes it as a PREVIEW on http://<server>:8081/
# (separate container, hidden from search engines; the live site is not touched).
set -euo pipefail

HOST="${HETZNER_HOST:-root@2.28.230.117}"
REMOTE_DIR="${REMOTE_DIR:-/opt/ww_preview}"
PORT=8081
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"
[ -d node_modules ] || npm ci
npm run build:preview

# Safety net: never upload a build that search engines are allowed to index.
for f in dist/index.html dist/pl/index.html; do
  grep -q 'noindex' "$f" || { echo "!! $f has no noindex tag — refusing to upload"; exit 1; }
done

# nginx in the container must be able to read every file
chmod -R u=rwX,go=rX dist nginx

ssh -o BatchMode=yes "$HOST" "mkdir -p '$REMOTE_DIR/dist' '$REMOTE_DIR/nginx'"
rsync -az --delete --exclude '.DS_Store' dist/ "$HOST:$REMOTE_DIR/dist/"
rsync -az --delete nginx/ "$HOST:$REMOTE_DIR/nginx/"
rsync -az docker-compose.yml "$HOST:$REMOTE_DIR/"
ssh -o BatchMode=yes "$HOST" "cd '$REMOTE_DIR' && docker compose up -d && docker compose exec -T web nginx -s reload"

echo "Preview: http://${HOST#*@}:$PORT/   (Polish: http://${HOST#*@}:$PORT/pl/)"
