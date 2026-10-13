#!/usr/bin/env bash
# Re-vendor snapcn (MIT) into the bench: the free component registry (offline installs via lvadd)
# and three agent skills. Usage: scripts/vendor-snapcn.sh [commit]
# The template pins the Remotion version snapcn itself builds against; update both together.
set -euo pipefail
COMMIT="${1:-afce9f0aa8c9d464409efd1e4d4f227ca4809c04}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BENCH="$ROOT/.workbenches/product-launch-video"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git clone -q https://github.com/snapcndev/snapcn.git "$WORK/snapcn"
git -C "$WORK/snapcn" checkout -q "$COMMIT"
SRC="$WORK/snapcn"

rm -rf "$BENCH/tools/share/registry"
mkdir -p "$BENCH/tools/share/registry"
cp "$SRC"/public/r/*.json "$BENCH/tools/share/registry/"
cp "$SRC/LICENSE" "$BENCH/tools/share/registry/LICENSE"

for skill in snapcn remotion-launch-video remotion-product-demo; do
  rm -rf "$BENCH/skills/$skill"
  cp -R "$SRC/skills/$skill" "$BENCH/skills/$skill"
  cp "$SRC/LICENSE" "$BENCH/skills/$skill/LICENSE"
done

cat > "$BENCH/skills/snapcn/NOTICE.md" <<NOTICE
# Provenance

Vendored unmodified from https://github.com/snapcndev/snapcn at commit
\`$COMMIT\` (MIT, Copyright (c) 2026 Sri Nath (snap-cn)):

- \`skills/snapcn\`, \`skills/remotion-launch-video\`, \`skills/remotion-product-demo\`
- the free component registry, \`public/r/*.json\`, at \`tools/share/registry/\`

The workflow skills carry their own THIRD_PARTY_NOTICES.md for material adapted from
everyinc/product-launch-video (MIT) and heygen-com/hyperframes (Apache-2.0).
Re-vendor with \`scripts/vendor-snapcn.sh [commit]\`.
NOTICE
echo "vendored snapcn $COMMIT"
