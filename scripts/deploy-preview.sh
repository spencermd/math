#!/usr/bin/env bash
# Publish a preview of the current checkout at https://spencermd.github.io/math/preview/ without touching the live
# site: only the preview/ folder on gh-pages changes. The preview saves progress under its own key, so trying it
# never touches a learner's real progress. The next scripts/deploy.sh replaces the whole site and drops the preview.
set -euo pipefail
cd "$(dirname "$0")/.."

sha=$(git rev-parse --short HEAD)
build() { BASE_PATH=/math/preview NEXT_PUBLIC_STORAGE_SUFFIX=-preview npm run build; }
# The build sometimes stops on Next's advisory check and passes when run again.
build || build

pages=$(mktemp -d)
trap 'git worktree remove --force "$pages" 2>/dev/null || true' EXIT
git fetch --depth=1 origin gh-pages
git worktree add --detach "$pages" FETCH_HEAD
rm -rf "$pages/preview"
mkdir -p "$pages/preview"
cp -R apps/web/out/. "$pages/preview"/
git -C "$pages" add -A preview
if git -C "$pages" diff --cached --quiet; then
  echo "Preview already up to date."
  exit 0
fi
git -C "$pages" commit -q -m "Preview MathTree build ($sha) at /preview"
git -C "$pages" push origin HEAD:gh-pages
echo "Previewed $sha at https://spencermd.github.io/math/preview/"
