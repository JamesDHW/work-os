#!/usr/bin/env bash
# Throwaway server for the browser end-to-end test: the built web app, a scripted model and a fixed setup code.
set -euo pipefail
scratch="$(mktemp -d)"
trap 'kill "${server_pid:-}" 2>/dev/null || true; rm -rf "$scratch"' EXIT INT TERM
pnpm -s web:build > /dev/null
export WORK_OS_DATA_DIR="$scratch/server" WORK_OS_PORT="4399" WORK_OS_SETUP_CODE="E2E-SETUP-CODE" WORK_OS_DEFAULT_MODEL="scripted/scripted"
export WORK_OS_WEB_DIST="$PWD/apps/web/dist"
export WORK_OS_MASTER_KEY="$(node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("base64"))')"
export WORK_OS_SCRIPTED_RESPONSES='[{"toolCalls":[{"name":"bash","arguments":{"command":"echo hello > hello.txt && cat hello.txt"}}]},{"toolCalls":[{"name":"complete","arguments":{"summary":"Wrote hello.txt"}}]}]'
node apps/server/src/main.ts &
server_pid=$!
wait "$server_pid"
