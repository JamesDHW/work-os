#!/usr/bin/env bash
# End-to-end smoke test: server + host-driver runner + scripted model, through the public API.
set -euo pipefail
scratch="$(mktemp -d)"
trap 'pkill -f "^node apps/(server|runner)/src/main.ts" || true; rm -rf "$scratch"' EXIT
mkdir -p "$scratch/project" && echo "# Demo" > "$scratch/project/README.md"
port=4398
export WORK_OS_DATA_DIR="$scratch/server" WORK_OS_PORT="$port" WORK_OS_SETUP_CODE="SETUP-12345" WORK_OS_DEFAULT_MODEL="scripted/scripted"
export WORK_OS_MASTER_KEY="$(node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("base64"))')"
export WORK_OS_SCRIPTED_RESPONSES='[{"toolCalls":[{"name":"bash","arguments":{"command":"echo hello > hello.txt && cat hello.txt"}}]},{"toolCalls":[{"name":"complete","arguments":{"summary":"Wrote hello.txt"}}]}]'
node apps/server/src/main.ts > "$scratch/server.log" 2>&1 &
for _ in $(seq 1 50); do curl -sf "localhost:$port/api/setup" > /dev/null && break; sleep 0.2; done
api() { curl -sf -b "$scratch/cookies" -c "$scratch/cookies" -H content-type:application/json "$@"; }
json() { python3 -c "import json,sys;d=json.load(sys.stdin);print($1)"; }
api -d '{"setupCode":"SETUP-12345","displayName":"Ada"}' "localhost:$port/api/setup" > /dev/null
workspace="$(api "localhost:$port/api/session" | json "d['workspaces'][0]['id']")"
environment_id="default"
if [ -n "${WORK_OS_SMOKE_DEVCONTAINER:-}" ]; then
  environment_id="local"
  mkdir -p "$WORK_OS_DATA_DIR/workspaces/$workspace/environments/local"
  echo "$WORK_OS_SMOKE_DEVCONTAINER" > "$WORK_OS_DATA_DIR/workspaces/$workspace/environments/local/devcontainer.json"
fi
code="$(api -X POST "localhost:$port/api/w/$workspace/runners/pairing-codes" | json "d['code']")"
export WORK_OS_RUNNER_DATA_DIR="$scratch/runner" WORK_OS_RUNNER_DRIVER="${WORK_OS_RUNNER_DRIVER:-unsafeHost}"
node apps/runner/src/main.ts pair "http://localhost:$port" "$code" > /dev/null 2>&1
node apps/runner/src/main.ts > "$scratch/runner.log" 2>&1 &
for _ in $(seq 1 50); do [ "$(api "localhost:$port/api/w/$workspace/runners" | json "d[0]['isOnline']")" = "True" ] && break; sleep 0.2; done
runner="$(api "localhost:$port/api/w/$workspace/runners" | json "d[0]['id']")"
project="$(api -d "{\"name\":\"Demo\",\"runnerId\":\"$runner\",\"path\":\"$scratch/project\",\"environmentId\":\"$environment_id\"}" "localhost:$port/api/w/$workspace/projects" | json "d['id']")"
run="$(api -d "{\"projectId\":\"$project\",\"standardId\":\"task\",\"prompt\":\"Write hello.txt\"}" "localhost:$port/api/w/$workspace/runs" | json "d['id']")"
for _ in $(seq 1 "${WORK_OS_SMOKE_POLLS:-150}"); do
  status="$(api "localhost:$port/api/w/$workspace/runs/$run" | json "d['run']['state']['status']")"
  [ "$status" = "reviewing" ] || [ "$status" = "failed" ] && break; sleep 0.2
done
detail="$(api "localhost:$port/api/w/$workspace/runs/$run")"
echo "$detail" | json "d['run']['state'], d['changedFiles']"
[ "$(echo "$detail" | json "d['run']['state']['status']")" = "reviewing" ] || { echo "FAIL: run did not reach review"; cat "$scratch/server.log" "$scratch/runner.log" | tail -40; exit 1; }
[ "$(cat "$scratch/project/hello.txt")" = "hello" ] || { echo "FAIL: hello.txt missing"; echo "$detail" | json "d['transcript']"; tail -20 "$scratch/runner.log"; exit 1; }
item="$(api "localhost:$port/api/w/$workspace/inbox" | json "[i['id'] for i in d if i['payload']['kind']=='review'][0]")"
api -d '{"answer":{"kind":"accept"}}' "localhost:$port/api/w/$workspace/inbox/$item/answer" > /dev/null
final="$(api "localhost:$port/api/w/$workspace/runs/$run" | json "d['run']['state']")"
echo "final: $final"
[ "$final" = "{'status': 'completed', 'outcome': 'accepted'}" ] || { echo "FAIL: run not accepted"; exit 1; }
echo "SMOKE OK"
