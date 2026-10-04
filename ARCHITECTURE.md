# work-os — Architecture

> **Status:** proposal, revision 2, 2026-10-04. Derived from `CONTEXT.md` and `DECISIONS.md`.
> The folder structure follows Work (`work`) and Atelier (`agent-studio`): thin apps, logic in packages, one package per external seam, feature folders inside `core`, and Atelier's web layout and styling (D47–D49). Code style is **not** taken from either; it is in `STYLE.md`.
> The enforceable form of this document is `architecture.config.ts`.

---

## 1. Shape of the system

```
 Phone · laptop · desktop (browser / installed web app)
        │  HTTPS over Tailscale: REST + SSE (/api), web app (/)
        ▼
┌──────────────────────────────── apps/server (always-on Mac mini) ────────────────────────────────┐
│ api ──▶ core ◀── db · harness · secrets · push · package-store                                   │
│                  (seams: each implements ports that core declares)                               │
└───────────────────────────────────────▲───────────────────────────────────────────────────────────┘
                                        │ WebSocket (/link), opened by the runner
┌───────────────────────────────────────┴──────── apps/runner (every machine with folders) ────────┐
│ link handlers ──▶ sandbox (devcontainer CLI · docker exec · file manifests · host git · gateway) │
│   ┌──────────── container (devcontainer, project folder bind-mounted) ────────────┐              │
│   │ agent's shell and file tools run here; network only via the egress gateway   │              │
│   └──────────────────────────────────────┬────────────────────────────────────────┘              │
│                       apps/egress-gateway (allowlisting proxy, one per runner) ──▶ internet      │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Server** owns all state: accounts, workspaces, packages, runs, transcripts, inbox, grants, credentials, schedules. The agent loop (Pi Durable) and every model call run here (D42).
- **Runner** owns nothing durable. It picks folders, starts containers, executes tool calls and approved folder-bound commands, and reports results. It dials out to the server (D28).
- **Egress gateway** is the only route out of a container (D05, D19).
- **Web app** is a static SPA served by the server. It talks only to the public API, typed by `api-types`.

## 2. Dependency direction

```
                     shared ◀── domain ◀── protocol
                                  ▲          ▲
              ┌──────────────── core ◀───────┼──────── api ◀──┐
              │  (features + ports)          │                │
  seams:  db · harness · secrets · push · package-store       ├── apps/server (composition)
              └──────── implement core's ports ───────────────┘
  sandbox ◀── apps/runner          protocol ◀── apps/egress-gateway
  sdk ◀── bundled packages          api-types ◀── apps/web, apps/cli          design-tokens ◀── apps/web
```

1. `domain` imports only `shared`. No I/O, time, randomness or third-party code.
2. `core` holds the application logic and **declares** the ports it needs (store, agent runtime, runner gateway, vault, push, package reader). It imports no infrastructure library.
3. **Seam packages** (`db`, `harness`, `secrets`, `push`, `package-store`, `sandbox`) each wrap one external system and implement ports declared in `core` (or, for `sandbox`, the runner's own operations). Only seam packages import infrastructure libraries.
4. `api` is the HTTP entry point: it validates with `protocol`, calls `core`, and emits the OpenAPI document.
5. `apps/*` are thin: read `config`, construct seams, inject them into `core`, start listening. Nothing else constructs a seam.
6. The web app and CLI never import server packages. Their types come from `api-types`, generated from the OpenAPI document (Atelier's pipeline).
7. Bundled work-os packages import only `sdk`; effects (HTTP, credentials, workspace files) are injected by the host.

---

## 3. Repository layout

```
work-os/
├── CONTEXT.md · DECISIONS.md · ARCHITECTURE.md · STYLE.md · architecture.config.ts
├── package.json · pnpm-workspace.yaml · tsconfig.base.json · tsconfig.json
├── oxlint.config.ts · oxfmt.config.ts · vitest.config.ts · playwright.config.ts
├── e2e/                               end-to-end tests against a real server and runner
│
├── apps/                              processes — thin entry points only           (Work apps/, Atelier apps/)
│   ├── server/                        read config, build seams, inject into core, mount api + /link, serve web build
│   ├── runner/                        pairing, link client, handlers that call sandbox
│   ├── egress-gateway/                allowlisting HTTP(S) proxy, built as a small OCI image
│   ├── web/                           React SPA + installable web app (Atelier layout, §7)
│   └── cli/                           `work-os` command: install services, pair a runner, doctor
│
├── packages/                          libraries
│   ├── shared/                        WorkOsError hierarchy, tryCatch                (Work shared)
│   ├── domain/                        entity types and pure decisions, ORM-free     (Atelier domain)
│   ├── protocol/                      zod schemas: HTTP API, runner link, package file formats, dashboard specs (Work protocol)
│   ├── api-types/                     generated from the server's OpenAPI document  (Atelier api-types)
│   ├── config/                        environment- and flag-driven runtime config   (Atelier config)
│   ├── core/                          server application logic, one folder per feature (Work core, Atelier service)
│   ├── api/                           HTTP routes and middleware over core; OpenAPI document (Atelier api)
│   ├── db/                            seam: Drizzle tables, migrations, store implementations (Atelier db, Work store)
│   ├── harness/                       seam: agent runtime — Pi Durable, pi-ai, agent tools (Atelier llm seam)
│   ├── sandbox/                       seam: environments, tool execution, file manifests, host commands, egress control (Atelier sandbox, Work gondolin)
│   ├── secrets/                       seam: credential vault — OS keychain + AES-GCM
│   ├── push/                          seam: web push
│   ├── package-store/                 seam: work-os packages on disk — workos.yaml, frontmatter, Git, extension loading (Work package)
│   ├── sdk/                           public extension API for package developers   (Work sdk)
│   └── design-tokens/                 pure token data and types, zero dependencies  (Atelier design-tokens)
│
└── bundled/                           work-os packages shipped with the product      (Work packages/base, extended)
    ├── base/                          author-standard, improve-standard, default agent and environment
    ├── github/ · notion/ · slack/ · linear/ · google/   adapters: connections, capabilities, polling sources
    └── chief-of-staff/                module: agent, markdown memory store, dashboard tools, polling triggers
```

`bundled/` is the one departure from Work, which kept its base package in `packages/base`. Bundled packages are work-os packages (a `workos.yaml`, Markdown/JSON content, optional extension code), not libraries, and there will be several, so they get their own top-level folder.

### Inside `core` (Work style: one flat folder per feature)

```
packages/core/src/
├── identity/        account, passkeys, sessions, runner pairing
├── workspaces/      workspaces, memberships, principals
├── catalogue/       standards, agents, skills, environments from the workspace package; doctor
├── projects/        project = runner + folder + environment + connections
├── runs/            compose spec, start, steer, reopen, complete, checks, outputs, review
├── capabilities/    registry, declared-capability filtering, grants, approvals, execution
├── connections/     connection setup and credential use
├── inbox/           items, compare-and-set answers, ranking, routing answers to sources
├── runners/         runner presence and the RunnerGateway port
├── schedules/       cron schedules for standards and connection polling
├── notifications/   push only for blocking items
├── events/          event bus port and event types
├── observations/    mechanical observation capture and queries
├── modules/         module host for SDK modules
└── assistant/       ⌘K assistant operations
```

Each feature folder is flat. Files are named after their one concept: operations (`startRun.ts`), the ports that feature declares (`RunStore.ts`, `AgentRuntime.ts`), feature constants (`runs.constants.ts`), and colocated tests (`startRun.test.ts`). No `routes/`, `ports/`, `adapters/` subfolders: the package a file lives in already says which layer it is.

### Inside seam packages

Each seam package has one folder per port it implements, named after the core feature it serves: `db/src/runs/runStore.ts`, `harness/src/runs/agentRuntime.ts`, `harness/src/tools/callCapabilityTool.ts`, `sandbox/src/environments/startEnvironment.ts`. Drizzle tables live in `db/src/tables/`, one table per file; generated migrations in `db/migrations/`.

### Inside `api`

One folder per feature with its route definitions (`api/src/runs/runRoutes.ts`), plus `api/src/middleware/` (session, workspace scope, error mapping) and `api/src/openApiDocument.ts`.

---

## 4. Server packages and their third-party dependencies

| Package | Third-party | Node built-ins |
| --- | --- | --- |
| `shared` | — | — |
| `domain` | — | — |
| `protocol` | `zod` | — |
| `config` | `zod` | — (apps read `process.env` and pass it in) |
| `core` | `croner` (pure cron calculation, schedules only) | — |
| `api` | `hono`, `@hono/zod-openapi` | — |
| `db` | `drizzle-orm` (`node:sqlite` driver now, Postgres later); `drizzle-kit` (dev) | `sqlite` |
| `harness` | `@earendil-works/pi-durable`, `@earendil-works/pi-ai`, `@earendil-works/chord` | — |
| `secrets` | `@napi-rs/keyring` | `crypto` |
| `push` | `web-push` | — |
| `package-store` | `yaml` | `fs/promises`, `path`, `child_process` (Git) |
| `sdk` | `zod` | — |
| `apps/server` | `@hono/node-server`, `@hono/node-ws` | `process` |

Authentication uses passkeys: `@simplewebauthn/server` in `api` (verification is request handling) and `@simplewebauthn/browser` in the web app.

## 5. Runner, gateway and CLI

| Package | Responsibility | Third-party | Built-ins |
| --- | --- | --- | --- |
| `sandbox` | `environments/` (effective devcontainer config, up/down), `tools/` (shell, read, write, edit, search in the container), `checks/`, `outputs/` (hash manifests, `git status`/`git diff`), `hostCommands/` (approved folder-bound commands with a per-call credential, D43), `folders/` (browse local folders), `egress/` (gateway control) | `@devcontainers/cli` (invoked as a subprocess) | `child_process`, `fs/promises`, `path`, `crypto`, `os` |
| `apps/runner` | Pairing, outbound link with reconnection, handlers mapping link messages to `sandbox` | — (global `WebSocket`, `fetch`) | `process` |
| `apps/egress-gateway` | CONNECT-based allowlisting by hostname, per-container run mapping, blocked-request reports | — | `http`, `net`, `process` |
| `apps/cli` | Install launchd/systemd services, pair a runner, doctor | `openapi-fetch` | `util` (`parseArgs`), `fs/promises`, `path`, `os`, `child_process`, `process` |

Host requirement for runners: Docker Desktop or Docker Engine.

## 6. Bundled packages and the SDK

`sdk` exposes `defineAdapter`, `defineCapability`, `defineModule`, `defineMemoryStore`, `defineTriggerSource` and the types of injected host services (`HttpClient`, `CredentialProvider`, `WorkspaceFiles`, `EventEmitter`). Bundled packages import only `sdk` (and `zod` for capability argument schemas).

First-party module UI (the chief-of-staff dashboard and chat) lives in the web app's concept folders (`apps/web/src/chiefOfStaff/`, `apps/web/src/dashboard/`), following Atelier's rule that components are web-only and belong in the app. Loading UI from third-party packages is deferred.

---

## 7. Web app (Atelier layout)

```
apps/web/src/
├── main.tsx                     mount, theme pre-paint, router provider
├── router.tsx                   router instance from the generated route tree
├── routeTree.gen.ts             generated by the TanStack Router plugin
├── api/
│   ├── client.ts                createWorkspaceClient (openapi-fetch + api-types)
│   └── serverEvents.ts          SSE subscription → router.invalidate()
├── shell/                       AppShell, TopBar (breadcrumb scope), Sidebar, WorkspaceSwitcher,
│                                ProjectSwitcher, CommandPalette (⌘K assistant)
├── ui/                          primitives: theme.css.ts, theme.ts, Button/, Text/, Icon/, Input/,
│                                Card/, Menu/, Dialog/, StatusBadge/, Avatar/, EmptyState/ …
├── inbox/ · runs/ · standards/ · projects/ · agents/ · connections/ · environments/
├── chiefOfStaff/ · dashboard/   concept folders holding screen components
└── routes/                      file-based routes, scope-shaped (Vercel scope system)
    ├── __root.tsx
    ├── index.tsx                          redirect to the active workspace or sign-in
    ├── signIn/index.tsx
    └── w/$workspaceId/
        ├── route.tsx                      workspace shell + loader (workspace, client)
        ├── index.tsx                      home: chief-of-staff dashboard (D41)
        ├── inbox/index.tsx
        ├── runs/index.tsx · runs/$runId/index.tsx
        ├── standards/index.tsx · standards/$standardId/index.tsx
        ├── settings/{user,workspace,project}.tsx
        └── p/$projectId/route.tsx · p/$projectId/index.tsx
```

- **Components** live in a module folder: `RunCard/RunCard.tsx`, `RunCard.css.ts` (vanilla-extract recipe), and `RunCard.hook.ts` when it has behaviour. No barrels.
- **Data** comes from TanStack Router **loaders**, never `useEffect`. Live updates: `serverEvents.ts` listens to the SSE stream and calls `router.invalidate()` for affected routes. No client cache library (D49).
- **Styling** is vanilla-extract with tokens from `@work-os/design-tokens` (D48), copied from Atelier: `ui/theme.css.ts` turns the token objects into typed `vars` via `createGlobalTheme` for `:root` and each `[data-theme]`; `theme.ts` flips `data-theme`; a pre-paint script in `index.html` avoids a flash. Components use `recipe` variants that reference `vars` only. No Tailwind, no utility classes, no raw colours.
- **Overlays** (menus, popovers, dialogs) use Radix primitives, confined to `ui/Menu`, `ui/Popover`, `ui/Dialog`. Everything else is native elements.
- **Icons** are `@tabler/icons-react` behind `ui/Icon` with a typed `name` union.

### Web third-party dependencies

| Library | Purpose |
| --- | --- |
| `react`, `react-dom` | UI |
| `@tanstack/react-router` (+ `@tanstack/router-plugin`, dev) | File-based, scope-shaped routing and loaders |
| `openapi-fetch` (+ `openapi-typescript`, dev, in `api-types`) | Typed API client |
| `@vanilla-extract/css`, `@vanilla-extract/recipes` (+ `@vanilla-extract/vite-plugin`, dev) | Styling |
| `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `@radix-ui/react-dialog` | Accessible overlays only |
| `@tabler/icons-react` | Icons |
| `cmdk` | ⌘K palette behaviour (unstyled) |
| `react-markdown`, `remark-gfm` | Markdown (standards, outputs, chat) |
| `shiki` | Code highlighting |
| `react-diff-view` | Diffs for changed files in Git folders |
| `@simplewebauthn/browser` | Passkey sign-in |
| `vite`, `@vitejs/plugin-react` (dev) | Build |

`packages/design-tokens` has no dependencies.

## 8. Tooling

| Tool | Purpose |
| --- | --- |
| `pnpm` workspaces, Node 24 LTS | Package management and runtime |
| `typescript` 7 | Type checking, extending `architecture-rules/tsconfig.base.json` |
| `oxlint`, `oxlint-tsgolint`, `oxfmt` | Lint and format |
| `architecture-rules` | File types, naming, import boundaries, custom rules |
| `vitest`, `@testing-library/react` | Unit and hook tests, colocated `*.test.ts(x)` |
| `@playwright/test` | End-to-end tests in `e2e/*.spec.ts` |

All direct dependencies are pinned exactly, with a committed lockfile and a 14-day minimum release age. Pi Durable is experimental: pin it exactly and upgrade deliberately.

---

## 9. Key flows

**Play**

1. `POST /api/w/{workspaceId}/runs` → `core/runs/startRun`: load the standard and agent (`package-store` via the catalogue port), `composeRunSpec` (pure, `domain`), save the run (`db`).
2. `RunnerGateway.prepareEnvironment` → runner → `sandbox/environments`: effective devcontainer config, start manifest, `devcontainer up`.
3. `AgentRuntime.startConversation` (`harness`): Pi Durable conversation with the agent's model and instructions, `STANDARD.md` + `METHOD.md` as prompt sections, runner-backed shell/file tools, declared capabilities, `ask_user` and `complete`.
4. The starting prompt is submitted with `requestId` = run id, so a retry cannot start the run twice.

**Shell or file tool** → `harness` runner-backed execution environment → `RunnerGateway` → runner → `sandbox/tools` → `docker exec` → result. Offline runner: the call waits durably; the inbox shows "runner offline".

**Capability call** → `harness/tools/callCapabilityTool` → `core/capabilities/authorizeCapabilityCall` (`matchGrant`, `decideApproval` in `domain`) → allowed: execute; otherwise an inbox item and a durable wait → approve, edit or reject from any client → execute on the server (API capabilities through the bundled adapter with a credential from `secrets`) or as a runner host command (folder-bound) → result or structured refusal.

**Complete** → `complete` tool → runner runs checks; failures return to the agent (bounded, then escalate) → `sandbox/outputs` computes changed files → review per the standard → container down; the folder is untouched.

**Events** → `core` publishes events → `api` streams them over SSE → `serverEvents.ts` invalidates routes. Blocking inbox items also go through `push`.

---

## 10. Storage

| Location (server) | Contents |
| --- | --- |
| `~/.work-os/server/work-os.sqlite` | `db`: accounts, passkeys, sessions, workspaces, memberships, projects, runners, runs (spec, outcome), inbox items, grants, capability call log, connections (encrypted secrets), schedules, push subscriptions, observations |
| `~/.work-os/server/durable.sqlite` | `harness`: Pi Durable conversations, tasks, transcripts, documents |
| `~/.work-os/server/workspaces/<id>/` | `package-store`: the workspace package (Git repository) |

| Location (runner) | Contents |
| --- | --- |
| OS keychain | Runner token from pairing |
| `~/.work-os/runner/runs/<id>/` | Effective devcontainer config, start and end manifests |

Every tenant-owned table carries `workspace_id`.

## 11. Spikes before committing

1. **Pi Durable:** runner-backed remote execution environment; tool parameter schemas (TypeBox or JSON Schema from `z.toJSONSchema`); durable wait on approvals; restart and resume.
2. **devcontainer CLI:** external `--config` with the project folder as workspace; internal network attachment; `exec` latency.
3. **Egress gateway on Docker Desktop for Mac.**
4. **Passkeys over Tailscale** (`tailscale serve` hostname as the relying party).
5. **Drizzle on `node:sqlite`**; **`@hono/zod-openapi` with zod 4**.
6. **Runner link:** reconnection, request correlation, laptop sleep and wake.

## 12. Deferred

Multi-tenant hosting and Postgres, remote runners and microVM runtimes, other environment sources, third-party module UI loading, subagents, workflows, native mobile.
