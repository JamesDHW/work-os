#!/usr/bin/env bash
# Regenerates packages/api-types from the server's OpenAPI document. Uses a throwaway data folder and key.
set -euo pipefail
scratch="$(mktemp -d)"
trap 'rm -rf "$scratch"' EXIT
WORK_OS_DATA_DIR="$scratch" \
WORK_OS_MASTER_KEY="$(node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("base64"))')" \
  node apps/server/src/writeOpenApiDocument.ts packages/api-types/openapi.json
pnpm --filter @work-os/api-types exec openapi-typescript openapi.json --output src/apiSchema.ts
