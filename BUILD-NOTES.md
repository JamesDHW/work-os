# work-os — Build notes (one-shot v1 build)

Running log of the uninterrupted v1 build described in `BUILD.md`. Newest entries at the bottom of each section.

## Environment

- Built in a Linux cloud workspace (Ubuntu 24.04, 2 CPUs, 7 GB RAM), synced to `~/Repos/Personal/work-os` at each milestone.
- Node 24.20.0 (from the `node-linux-x64` npm package, because nodejs.org is blocked by the workspace's egress policy), pnpm 11.27.1.
- Docker Engine available locally, but every public image registry (Docker Hub, MCR, GHCR, ECR Public, Quay) is blocked. Container tests use locally built images (see M3).

## M0 — Preflight

- **architecture-rules** pinned to `eb48638` (GitHub `main`, identical to the local checkout). Installed from GitHub with pnpm.
- **Native test suite** (`ARCHITECTURE_NATIVE_TESTS=1`): 407 passed, 6 failed. No allocator failures in this environment.
  - `no-binding-alias`: 4 valid cases are reported (global `undefined` initialisation and reset, event callback, sibling-scope shadow). Matches LINT-RULE-FINDINGS §3. Left enabled; work-os code never reassigns, so exposure is low.
  - `pure-conditions`: misses `(count++, isReady) ? … : …` (a false negative; harmless here).
  - CLI naming test: fails because the temporary project cannot find the `oxlint-tsgolint` binary. Consumers must list `oxlint-tsgolint` as a direct devDependency (work-os does).
- **Lint and architecture check are one command.** `architecture-check` runs inventory, naming, imports, compiler policy and the full Oxlint profile. `pnpm lint` and `pnpm architecture:check` therefore run the same checker.
- **Suppression placement:** `no-raw-exceptions` reports on the `catch` clause, so its suppression sits on the line before `} catch`.
- **Pi Durable 1.0.2:** API matches the announcement. Relevant findings:
  - Tools use TypeBox schemas (`Type` re-exported from pi-ai); TypeBox stays inside `harness`.
  - `HarnessOptions.env(target)` receives the conversation id and returns any `ExecutionEnv` (FileSystem + Shell). A runner-backed environment is a supported shape.
  - A faux provider (`fauxProvider()` in pi-ai) scripts model responses, including tool calls, for tests.
  - Custom endpoints (LM Studio, gateways) via `createProvider({ baseUrl, headers, ... })`; per-request header transforms exist for attribution.
  - Durable approvals: a tool's `execute()` can wait; on restart a `replay: "safe"` tool reruns, so approval and capability tools are made idempotent by keying their records on the tool task id.
- **Drizzle:** the stable release (0.45.x) has no `node:sqlite` driver (only the 1.0 release candidates do). Decision: Drizzle's `sqlite-proxy` driver over `node:sqlite` `DatabaseSync`. Same schema API; Postgres later.
- **Release ages (D52):** every dependency resolved at a version ≥14 days old except `@earendil-works/*` 1.0.2.

## Decisions taken during the run

- **D49 (web data loading)** was still proposed; took the recommendation (loaders + `router.invalidate()` from SSE, no client cache library).
- **`tryCatch` split in two:** `tryCatch` (sync) and `tryCatchAsync` (async) instead of one overloaded function. Overloads need `function` declarations (banned by STYLE.md); two arrow functions keep one way per case without suppressions. STYLE.md examples updated.
- **Optional fields use `exactOptional()`** (zod 4.6) so schemas satisfy the domain types under `exactOptionalPropertyTypes`. Domain types use `field?: T` where a caller may omit a value, `T | null` where absence is known, `T | undefined` where it is not known. Schemas declare `satisfies z.ZodType<DomainType>` so drift is a type error.
- **Runner link is small:** `prepareEnvironment`, `stopEnvironment`, `exec` (with optional stdin), `collectChanges`, `hostCommand` (git only, credential per call) and `listFolders`. Pi Durable's `FileSystem` operations are implemented on the server as shell commands sent through `exec` (base64 for content), so file access happens inside the container with the container's permissions and the runner never maps container paths to host paths. Alternatives considered: a generic file-operation request (14 operations, host path mapping, a second code path for temporary files) and a file server inside the container (needs an agent binary in every image). Cost: one `docker exec` per file operation; acceptable for v1, revisit if latency shows.
- **Run waits for input:** a run whose agent answers without calling `complete` is `waiting` with reason `input` and gets a question in the inbox (the agent's last message), so every blocked run shows up in one place. Added `input` to `WaitingReason`.
- **Agent harness:** one Pi Durable Harness over `durable.sqlite`; each run is an ownerless conversation with a `workos.run` document linking it to the run. Tools: Pi's `read`/`write`/`edit`/`bash` (through the runner-backed environment) plus `ask_user`, `call_capability`, `complete` and `load_skill`. Turn settlement is detected with `waitForIdle()` after each submission and on resume; live progress is reported from the conversation view, throttled to one event per 400 ms. Pi Durable exports no constructor for its branded numeric conversation ids, so `harness/runs/toConversationId.ts` carries the one type-assertion suppression.
- **Scripted model:** `harness/models/createScriptedProvider.ts` wraps pi-ai's faux provider so tests and the end-to-end smoke run without a model key.
- **Observations:** recorded mechanically (questions, refused capabilities, failed checks, rejected reviews, revision requests, blocked egress) for `improve-standard` to use later. v1 does not yet feed them to the agent automatically.
- **HTTP API typing:** every route declares the shared error responses (400/401/403/404/409/500/503) and returns `WorkOsError`s through `respondWithError`, so failures stay values all the way to the response. Hono's typed responses reject readonly arrays and recurse forever on the recursive JSON type, so response mappers copy arrays and nested free-form JSON (run spec, capability arguments, devcontainer, passkey options) is typed as an opaque `JsonObject` (`Record<string, unknown>`) in responses. The recursive `JsonValue` schema also sent the OpenAPI generator into infinite recursion until it was defined once rather than inside the lazy getter.
- **Approval edits are text-only:** `editedArguments` in an approval answer is a string map (D-inbox: editable *text* payloads), which also keeps the recursive JSON type out of request schemas.
- **Runner link authentication:** the runner sends its token in the first `hello` message instead of an HTTP header, because the platform `WebSocket` client cannot set headers.
- **First-run setup:** the server logs a one-time setup code while no account exists; `POST /api/setup` with that code creates the first user, a personal workspace and a session. `WORK_OS_SETUP_CODE` fixes the code for tests. Passkeys are registered after setup and used for every later sign-in.
- **Master key:** read from the OS keychain (`@napi-rs/keyring`), or from `WORK_OS_MASTER_KEY` (base64, 32 bytes) where no keychain exists (CI, Linux servers without a secret service).
- **Default model alias:** new workspace packages set `default: anthropic/claude-sonnet-5-5` unless `WORK_OS_DEFAULT_MODEL` says otherwise. LM Studio models appear as `lmstudio/<model id>` when `WORK_OS_LMSTUDIO_URL` is set.
- **API types:** `pnpm api-types` composes the server against a throwaway data folder, writes `packages/api-types/openapi.json` and runs openapi-typescript. openapi-typescript needs the TypeScript 5 compiler API (TypeScript 7 has no JS API), so `api-types` pins `typescript` 5.9.3 as its own dev dependency. Logged as a dependency addition.
- **Runner credentials file:** the runner token is stored in `~/.work-os/runner/credentials.json` with mode 0600 rather than the OS keychain, because `@napi-rs/keyring` is only listed for `secrets` on the server. Logged under "To verify on your machine".

## Configuration changes to `architecture.config.ts`

- `defaults.rules["unnecessary-conditions"]`: `checkTypePredicates: false` (LINT-RULE-FINDINGS §1, decided before the run). Type predicates over `unknown` are the narrowing contract at boundaries.
- `test.imports.external` += `zod`: SDK tests build argument schemas.
- `harness.imports.external` += `@earendil-works/*/**` subpaths: Pi Durable and pi-ai publish their tools, storage, env and providers as subpath exports.
- `serverApp.imports.external` += `@hono/node-server/**` (static file serving); `serverApp.imports.builtins` += `fs/promises` (create the data folder before opening SQLite).
- `apiTypes.rules`: `max-file-lines-warn`, `readonly-type-properties` and `type-aliases` off for the generated file (the "exempt generated files" rule applied through configuration).

## Recurring rule conflicts

- **`id-denylist` on `data`** where an external API names a field `data` (OpenAI model lists, WebSocket message events, Hono SSE messages). Suppressed at the single point that touches the external shape, with the API named in the reason.

## Tool failures

- **Device sync reused a stale file.** Committing a file to the user's machine under the same name as an earlier commit delivered the earlier content (the M2 sync landed the M1 bundle, so the repo looked unchanged). Fix: every sync uses a uniquely named bundle and the device checks its hash before fetching.
- **architecture-check printed `context canceled` once** (after the harness slice) and passed on the immediate rerun. Not reproduced since.

## Checker observations

- **Reassigned `let` is not reported.** `export let value = 1; value = 2;` passes: `prefer-const` only fires when a binding is never reassigned, and no rule bans `let` itself. STYLE.md bans `let`; the code follows STYLE.md, the checker does not enforce it.

## To verify on your machine

- Runner pairing writes `~/.work-os/runner/credentials.json` (mode 0600). Check the mode after `work-os runner pair`.
