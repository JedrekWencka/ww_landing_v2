#!/usr/bin/env bash
# Publishes the site to https://whitewaterband.com/ (PRODUCTION, indexable by Google).
#   ./deploy/hetzner.sh          asks for confirmation first
#   ./deploy/hetzner.sh --yes    no question
# Before uploading it keeps a backup of the files that are live now and prints the roll-back command.
# It never touches the server's nginx.conf (that file also serves b19studio.net).
set -euo pipefail

HOST="${HETZNER_HOST:-root@2.28.230.117}"
REMOTE_DIR="${REMOTE_DIR:-/opt/ww_landing}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ "${1:-}" != "--yes" ]; then
  read -r -p "Publish this build to https://whitewaterband.com/ ? [y/N] " answer
  [[ "$answer" =~ ^[Yy]$ ]] || { echo "Cancelled."; exit 1; }
fi

cd "$ROOT"
[ -d node_modules ] || npm ci
npm run build

# Safety net: a production build must be indexable and carry its canonical link.
for f in dist/index.html dist/pl/index.html; do
  if grep -q 'noindex' "$f"; then
    echo "!! $f contains noindex: this is a preview build, refusing to publish"
    exit 1
  fi
  grep -q 'rel="canonical"' "$f" || { echo "!! $f has no canonical link, refusing to publish"; exit 1; }
done

# nginx in the container must be able to read every file
chmod -R u=rwX,go=rX dist

BACKUP="dist.bak-$(date +%Y%m%d-%H%M%S)"
ssh -o BatchMode=yes "$HOST" "set -e
  mkdir -p '$REMOTE_DIR/dist'
  cp -a '$REMOTE_DIR/dist' '$REMOTE_DIR/$BACKUP'
  ls -dt '$REMOTE_DIR'/dist.bak-* | tail -n +4 | xargs -r rm -rf
  if [ -d '$REMOTE_DIR/public/.well-known' ]; then rsync -a '$REMOTE_DIR/public/.well-known/' '$REMOTE_DIR/dist/.well-known/'; fi"

# Same folder, new contents (the container keeps its mount); .well-known belongs to the certificate renewal.
rsync -az --delete --exclude '.git' --exclude '.DS_Store' --exclude '.well-known' dist/ "$HOST:$REMOTE_DIR/dist/"

echo
echo "Live: https://whitewaterband.com/   (previous version kept in $REMOTE_DIR/$BACKUP)"
echo "Roll back:"
echo "  ssh $HOST \"rsync -a --delete --exclude .well-known $REMOTE_DIR/$BACKUP/ $REMOTE_DIR/dist/\""
