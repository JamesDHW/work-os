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

## M3 — Runner, sandbox and egress gateway

- **Drivers:** `docker` (default) runs `devcontainer up` with an app-composed config (`--override-config`), the project folder bind-mounted at `/workspace`, the container on the internal `work-os-egress` network and labelled `work-os.run=<run id>`; tool calls are `docker exec … bash -c`. `unsafeHost` runs commands directly in the project folder and exists for tests and for machines without Docker; it is never chosen implicitly (`WORK_OS_RUNNER_DRIVER=unsafeHost`).
- **Egress gateway:** a container on both the default bridge and the internal network. It accepts CONNECT and plain HTTP proxy requests from registered container IPs to allowlisted hosts on ports 80/443 only, and reports blocked requests, which the runner forwards to the server as `egressBlocked` observations. The control API listens on `127.0.0.1:3129` with a per-runner-process bearer token. Verified here: the internal network has no direct route out, the gateway answers 403 for unlisted hosts, and blocked hosts are reported.
- **Changed files** come from content-hash manifests taken when the environment is first prepared and when the run completes (`.git` and `node_modules` skipped; files over 5 MB compared by size and modification time). A Git diff for the changed paths is added when the folder is a repository. Reopened runs keep their original start manifest, so the review shows everything the run changed.
- **Host commands:** only `git`, run in the project folder with `GIT_TERMINAL_PROMPT=0`; the credential travels per call as an `http.extraHeader` in `GIT_CONFIG_*` environment variables, never on the command line or on disk.
- **Pairing:** `work-os-runner pair <server URL> <code>` exchanges a one-time code (10 minutes) for a runner id and token, stored in `~/.work-os/runner/credentials.json` (0600).
- **Gateway image:** `pnpm egress:image` bundles the gateway with Vite into one file and builds `work-os/egress-gateway:local` from `node:24-alpine`. In this workspace (registries blocked) the image and the dev container image were built from a debootstrapped Ubuntu rootfs; `WORK_OS_NODE_IMAGE` overrides the base.
- **Smoke test:** `pnpm smoke` (`scripts/smoke-host.sh`) drives the public API end to end: setup, pairing, runner, project, run with the scripted model (bash writes `hello.txt`, then `complete`), review, accept. Passed with the host driver and, using local images, with the Docker driver.
- **Not done in M3:** the server ↔ runner link is tested through real processes in the smoke test rather than in-process in Vitest.

## M4 — Web app

- Screens: home (blocking inbox and active runs), inbox with question, approval, review and escalation answers, runs list with a start-run dialog, run page (transcript with live streaming text, steer and follow-up messages, changed files with a coloured diff, capability calls, add a capability, stop), projects with a machine folder browser, project page, standards list and editor, settings (machines and pairing codes, connections, standing approvals, passkeys, push notifications).
- Routes load data in TanStack loaders and return a `LoadResult` (`toFailure` / `toReady`), so a failed request renders an error notice instead of throwing. `useServerEvents` re-runs loaders on every server event.
- Routes import through a `#web/*` subpath import (`apps/web/package.json` `imports`), which TypeScript, Vite and the checker all resolve. This replaces `../../../../` chains (`no-deep-relative-imports`).
- Event handlers are named and return `void`. Async work starts through `startAction` (`api/startAction.ts`), which owns the promise (`no-misused-promises`). List items pass their id through the element's `value` or `name` attribute so one named handler serves every row (`named-jsx-handlers`).

- Verified in a browser (Playwright, Chromium) against the built app served by the server: every main screen renders in light and dark themes, and the end-to-end test below drives the core loop through the UI.
- After the first browser pass: tool entries in the transcript show a one-line preview of their arguments or output, the run page keeps the message box on finished runs (sending reopens the run, which the server already supports), and the connection-kind list skips capabilities that need no connection.

## M5 — CLI, end-to-end test and lint report

- **CLI** (`apps/cli`, `work-os`): `doctor` checks Node.js, Docker, the egress gateway image, this machine's runner pairing and the server; `pair <server URL> <code>` runs the runner's own pair command (the runner owns its credentials file); `install [--server-only | --runner-only]` writes a LaunchAgent (macOS) or a systemd user unit (Linux) per service and prints the command that starts it. It never starts or loads services itself.
- **End-to-end test** (`pnpm e2e`, `e2e/coreLoop.spec.ts`): Playwright starts a throwaway server with the built web app, a scripted model and a fixed setup code (`scripts/e2e-server.sh`). The test creates the account through the setup screen, pairs a machine from Settings and starts a host-driver runner with the code shown on screen, adds a project through the dialog, starts a run, waits for review, accepts it from the inbox and checks the file on disk. Passes here in about 12 seconds. Set `WORK_OS_CHROMIUM` to use an installed Chromium instead of Playwright's download.
- **Lint report:** `docs/lint-report.md` (findings by rule, every suppression with its reason, rules that never fired, configuration overrides).
- **Docs:** `README.md` (how to run and check it). STYLE.md §7 now records the loader pattern (`LoadResult`, props into screens, `#web/…` imports) and the handler pattern (`startAction`, row ids through `value` or `name`).
- **Final state:** typecheck clean (both programs), `architecture-check` clean, 96 unit tests, `pnpm smoke` passes with the host driver and with the Docker driver (local images), `pnpm e2e` passes.

## Deviations from ARCHITECTURE.md

- No `shiki`, `react-diff-view` or `cmdk`. The diff view is a small line-classifying component, code is not syntax-highlighted, and there is no command palette. The file types still allow these packages.
- The CLI's `pair` starts the runner's pair command instead of reimplementing pairing, so the CLI must run from a checkout next to `apps/runner`.
- The server ↔ runner link is tested through real processes (smoke and e2e) rather than in-process in Vitest.

## Known issues

- **Changed files were empty once.** The first Docker-driver smoke run of the final session reported `reviewing` with no changed files although `hello.txt` was written. Five reruns reported the file correctly, and the stored run record of a kept rerun had it. Not reproduced; worth watching on the first real runs.
- **Shutdown warning.** Stopping the server while a runner is connected logs `Failed query: update "runners" set "last_seen_at"`: the database closes before the runner's disconnect handler records the time. Harmless; the next connection updates it.
- **Peer dependency warning.** `@hono/node-ws` 1.3.1 declares `@hono/node-server ^1.19`; the build uses 2.1.1. WebSockets work (smoke and e2e), but `pnpm install` prints the warning.

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
- `projects.tsconfigs` += `apps/web/tsconfig.json`: the web app is a separate TypeScript program (DOM lib, JSX).
- `WEB_CONCEPTS` += `settings`: the settings screen and its sections.
- `webUi.imports.external` += `react-markdown`, `remark-gfm`: the Markdown primitive lives in the UI layer.
- `tooling.imports.internal` += `e2e`: the Playwright config reads the e2e port from `e2e/e2e.constants.ts`.
- `e2e`: covers `e2e/**/*.ts` with `.spec` and `.constants` suffixes, and may use the `child_process`, `fs/promises`, `os` and `path` builtins (the spec starts a runner and creates a scratch project).
- `webRouteTree.rules`: the generated route tree turns off the rules its generated code breaks (interfaces, `as any` casts, mutable maps, re-bound imports, length). The TanStack plugin's default `/* eslint-disable */` header is replaced through `routeTreeFileHeader`, because `reasoned-suppressions` is a mandatory structural check and rejects a file-wide disable.

## Recurring rule conflicts

- **`id-denylist` on `data`** where an external API names a field `data` (OpenAI model lists, WebSocket message events, Hono SSE messages). Suppressed at the single point that touches the external shape, with the API named in the reason.

- **`no-misused-promises` on async handlers.** Every async click or submit handler returned a promise to a `void` prop. Resolved once with `startAction` rather than per-site suppressions.

## Tool failures

- **Device sync reused a stale file.** Committing a file to the user's machine under the same name as an earlier commit delivered the earlier content (the M2 sync landed the M1 bundle, so the repo looked unchanged). Fix: every sync uses a uniquely named bundle and the device checks its hash before fetching.
- **architecture-check printed `context canceled` once** (after the harness slice) and passed on the immediate rerun. Not reproduced since.

- **A `git checkout` of a file with uncommitted edits** (while looking for a checker option) reverted one earlier configuration change, `projects.tsconfigs` += `apps/web/tsconfig.json`. It was restored from the build log before the M4 commit, and every other change in that file was re-applied.

## Checker observations

- **Reassigned `let` is not reported.** `export let value = 1; value = 2;` passes: `prefer-const` only fires when a binding is never reassigned, and no rule bans `let` itself. STYLE.md bans `let`; the code follows STYLE.md, the checker does not enforce it.

## To verify on your machine

- **Install and run the browser test once:** `pnpm install`, then `pnpm exec playwright install chromium` and `pnpm e2e`.
- **Passkeys from your phone over Tailscale:** WebAuthn needs HTTPS outside `localhost`. Run `tailscale serve --bg 4310` (HTTPS on the Mac's tailnet name, proxied to the server), start the server with `WORK_OS_PUBLIC_ORIGIN=https://<machine>.<tailnet>.ts.net` and `WORK_OS_WEB_DIST=apps/web/dist` (after `pnpm web:build`), then add a passkey on the phone from Settings > Passkeys while signed in on the Mac. Passkeys were not exercised here (no authenticator in a headless browser); the setup flow and sessions were.
- **Push notifications:** after a passkey sign-in on the phone, add work-os to the home screen and use Settings > Notifications. Not exercised here.
- **LM Studio:** `WORK_OS_LMSTUDIO_URL=http://localhost:1234/v1` and `models.default: lmstudio/<model id>` in the workspace's `workos.yaml`. The provider is wired and type-checked; no real model was called in this build (runs used the scripted model).
- **CLI services:** `node apps/cli/src/main.ts install`, then the printed `launchctl bootstrap …` commands. The rendered files are unit-tested; loading them with launchd was not tried here.

- Runner pairing writes `~/.work-os/runner/credentials.json` (mode 0600). Check the mode after `work-os-runner pair`.
- Build the egress gateway image once: `pnpm egress:image` (pulls `node:24-alpine`).
- Docker Desktop for Mac: run the Docker smoke test, `WORK_OS_RUNNER_DRIVER=docker pnpm smoke`. It pulls `mcr.microsoft.com/devcontainers/base:ubuntu-24.04` the first time. Check that a run container cannot reach the internet directly and that an allowlisted host works through the gateway (`curl https://<allowed host>` inside a run).
- macOS keychain: the server asks for keychain access on first start to create its master key. On Linux without a secret service, set `WORK_OS_MASTER_KEY`.
- Model access: set `ANTHROPIC_API_KEY` (or another provider key) or `WORK_OS_LMSTUDIO_URL=http://localhost:1234/v1`, then set the workspace's `models.default` in `~/.work-os/server/workspaces/<id>/workos.yaml` (for example `lmstudio/<model id>`).
