#!/usr/bin/env bash
# Compiles the work-os CLI into one executable with Bun. The services it manages still run on Node from a checkout
# (apps/server, apps/runner need node:sqlite, native modules and the devcontainer CLI), so the binary is the
# installer and controller, not the whole app.
set -euo pipefail
cd "$(dirname "$0")/.."
target="${1:-}"
out="dist/work-os${target:+-$target}"
mkdir -p dist
bun build --compile ${target:+--target="$target"} apps/cli/src/main.ts --outfile "$out"
echo "Built $out"
