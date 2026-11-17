#!/usr/bin/env bash
# Publish the site: build the static export for https://spencermd.github.io/math/ and push it to gh-pages.
# Run from a clean, pushed main. Each deploy is one commit on gh-pages, so reverting it rolls the site back.
set -euo pipefail
cd "$(dirname "$0")/.."

sha=$(git rev-parse --short HEAD)
# The build sometimes stops on Next's advisory check and passes when run again.
BASE_PATH=/math npm run build || BASE_PATH=/math npm run build

pages=$(mktemp -d)
trap 'git worktree remove --force "$pages" 2>/dev/null || true' EXIT
git fetch --depth=1 origin gh-pages
git worktree add --detach "$pages" FETCH_HEAD
find "$pages" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R apps/web/out/. "$pages"/
touch "$pages/.nojekyll"
git -C "$pages" add -A
if git -C "$pages" diff --cached --quiet; then
  echo "Site already up to date."
  exit 0
fi
git -C "$pages" commit -q -m "Deploy MathTree static build ($sha)"
git -C "$pages" push origin HEAD:gh-pages
echo "Deployed $sha."
