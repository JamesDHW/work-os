# work-os — Product decision record

> Companion to `CONTEXT.md`. Each entry records the conflict between the sources (Work, Atelier, the 2026-10-04 conversation), the options, the recommendation and the decision.
>
> **Status values:** `Accepted` · `Proposed` (recommendation, awaiting decision) · `Superseded`.

---

## Foundations (accepted in conversation, 2026-10-04)

| ID | Decision | Replaces / resolves |
| --- | --- | --- |
| F01 | TypeScript throughout. Pi Durable is the agent runtime; pi-ai provides model access. | Atelier's Go daemon (`atelierd`); Work's spawning of the Pi CLI in tmux. |
| F02 | Web-first. No TUI, no tmux. The daemon serves the web app and a public API. | Work's Ink TUI and tmux handoff. |
| F03 | Tenant-shaped data model from day one; single-node deployment first. Adoption is opt-in: personal workspace → organisation. | Work's single-user model; Atelier's hosted-parity ambition is kept as a direction, not v1 scope. |
| F04 | work-os is not a model gateway. All model calls go through one Model port with attribution; spend and policy live in the gateway. | Atelier Epic 12 cost dashboards inside the product. |
| F05 | Environments are defined by `devcontainer.json`. Runtimes are pluggable and declare an isolation level. Gondolin is one possible runtime, not the primitive. | Work's Gondolin-only sandbox; Atelier's generic `SandboxProvider`. |
| F06 | Workflows are deferred. Each standard is one step; runs are started manually. | Atelier's Request types, Stations and graph engine (Epics 4, 6). |
| F07 | A run may call capabilities at any point, behind approval. There is no "finalize at the end" stage. | Atelier's deferred Finalize (Epic 5 D6, Epic 13). |
| F08 | No tool restrictions inside the environment. The boundary is the environment, its egress and its capabilities. | Atelier Epic 7 D6 (brief context scope enforced on every read). |
| F09 | Modules (chief of staff, signals, …) are opt-in, built on the public extension API, and back their data with native or external adapters. | — |
| F10 | Integrate systems of record; don't replace them (the Slack model, not Huly). Build natively only where agents give unique leverage. | — |
| F11 | No Lean vocabulary on the product surface. | Work's "Piece", Atelier's "Station", "Value stream", "Kaizen". |
| F12 | Fresh repository with `architecture-rules` enforced from the first commit; port Work's proven parts in one at a time. | Refactoring `work` in place (≈426 lint / 236 architecture errors). |
| F13 | Build for the first user first, keeping the doors in CONTEXT §16 open. (Security posture: see D05.) | — |
| F14 | The chief of staff sits outside projects, imposes no structure, reads sources on demand (read-only), can be woken by webhooks, and has pluggable memory. | — |

---

## Index of decisions

| ID | Topic | Decision |
| --- | --- | --- |
| D01 | What a standard is | Two markdown files: STANDARD.md (frontmatter config + criteria) and METHOD.md |
| D02 | Agent configuration: reusable presets or inline | Reusable agent presets; presets carry no permissions |
| D03 | Name of the runtime unit | Run |
| D04 | Principals | Runs act on behalf of whoever started them (or a service account); agents are never principals |
| D05 | How permissive v1 is | Full posture from day one: containers, allowlisted egress, credentials only via capabilities, external writes approved |
| D06 | Where an environment's files come from | mount the project folder directly |
| D07 | Environment lifecycle | Container destroyed at the end; the mounted local folder is never deleted |
| D08 | Artifacts | No artifact store: changed files, external actions and a summary are the output |
| D09 | Default approval policy | once / this run / always for this standard on this target |
| D10 | Editing payloads before approval | A — edit text payloads; diffs go back as a revision request |
| D11 | Where capabilities are declared | declared on the standard; a human can add a capability to a live run |
| D12 | Completion: checks and review | A — checks, then the standard's review policy |
| D13 | Subagents | C — no subagents in v1 |
| D14 | Run chat and steering | A — steer any run from any client; reopen finished runs |
| D15 | Assistant and chief of staff | Two separate agents: the ⌘K assistant and the chief of staff |
| D16 | Where standards and configuration live | A — a workspace's configuration is a Git-backed package |
| D17 | Moving work between personal and organisation workspaces | not built |
| D18 | What a project is | A local folder (runner + path); connections set up per workspace, chosen per project |
| D19 | Default egress inside environments | A — base allowlist per environment definition, per-standard additions, humans only, blocked requests logged with one-click add |
| D20 | Chief-of-staff memory default | A — markdown notes folder, overridable |
| D21 | Generated dashboard | A — JSON spec rendered from an approved component catalogue |
| D22 | Chief-of-staff scope across workspaces | one chief of staff per workspace |
| D23 | Triggers in v1 | A — manual Play plus schedules on standards |
| D24 | Model setup for v1 | A — pi-ai direct to providers plus LM Studio, attribution headers from day one |
| D25 | Notifications in v1 | push only when a run is blocked on the user; badges for everything else |
| D26 | When LLM analysis of runs happens | only when the user asks |
| D27 | User-visible branches | defer |
| D28 | v1 host, access and authentication | server + runners |
| D29 | Repository and name | `work-os` in `~/Repos/Personal`; organisation packages in separate repositories |
| D30 | Keeping reviewers to the criteria | separate files |
| D31 | Git push without credentials in the environment | A — push is a capability |
| D32 | Concurrent runs on one project folder | allow concurrent writers |
| D33 | Rollback for directly mounted folders | no rollback in v1 |
| D34 | Secrets already in the project folder | the user's responsibility |
| D35 | Where a project's environment definition comes from | B — always configured in the app |
| D36 | Boundary between the assistant and the chief of staff | A — the assistant acts; the chief of staff proposes |
| D37 | How the chief of staff learns about events | Poll read-only APIs in v1; webhooks later behind the same interface |
| D38 | Skills | SKILL.md in the workspace package, loaded on demand |
| D41 | Home screen | Chief-of-staff dashboard; Inbox one click away |
| D42 | Where the agent loop runs (server + runner split) | A — harness on the server; runner executes tools |
| D43 | Where capability calls execute (server + runner) | API calls on the server; file-bound calls on the runner host with a per-call credential from the server |
| D44 | Authoring and improvement standards | ordinary standards in a base package |
| D45 | What Play asks for | free-text prompt with an optional `input` hint |
| D46 | Authoring formats | Users author Markdown/JSON only (AGENT.md, STANDARD.md, METHOD.md, SKILL.md, devcontainer.json, workos.yaml); TypeScript only for extensions |
| D47 | Repository folder structure | Work/Atelier layout: thin apps, seam packages, flat feature folders in core, Atelier web layout |
| D48 | Styling | vanilla-extract + design-tokens package, copied from Atelier |
| D49 | Web data loading and routing | TanStack Router file-based, scope-shaped routes with loaders; no client cache library (proposed) |
| D50 | HTTP framework | Hono + @hono/zod-openapi |
| D51 | Checking during the one-shot build | Check per slice and per milestone; reasoned line suppressions; no interruptions |
| D52 | Release-age exception | Pin @earendil-works/* 1.0.2 despite the 14-day rule |

---

## Decision entries

### D01 — What a standard is

- **Work:** Standard = markdown acceptance criteria. Operating mode = separate markdown method, 1:1 with the standard. Profile = separate TypeScript config (environment, capabilities).
- **Atelier:** Standard = Agent + Brief + Checks, bound to a Station. No separate criteria document; output rubric sits on the station.
- **Conversation:** "each standard is a markdown file + configuration of an agent", standards and operating modes closer to Work.

| Option | Summary |
| --- | --- |
| **A** | A standard is a directory: `STANDARD.md` (criteria) + `METHOD.md` (method) + `standard.ts` (agent ref, subagents, skills, capabilities, checks, review, environment). |
| B | One markdown file with frontmatter carrying all configuration. |
| C | Atelier's model: Agent + Brief + Checks, with no separate criteria document. |

**Recommendation:** A. It keeps Work's reasons for separating criteria from method (different change rates; reviewers judge against criteria only) and gives configuration a typed home.
**Status:** Accepted, 2026-10-04. **Decision: two markdown files** (revised after D30). `STANDARD.md` holds frontmatter configuration (schema-validated at load) and the criteria; `METHOD.md` holds the method.

### D02 — Agent configuration: reusable presets or inline

- **Work:** no agent concept; Pi config inside a Profile.
- **Atelier:** reusable Agent in a workspace catalog (model policy, tools, base prompt, escalation temperament).

| Option | Summary |
| --- | --- |
| **A** | Reusable agent presets (model requirements, base instructions, default skills) referenced by standards and subagent declarations. Presets carry no permissions. |
| B | Agent configuration inline in each standard. |
| C | Keep Work's Profiles (environment + capabilities + agent bundled). |

**Recommendation:** A.
**Status:** Accepted, 2026-10-04. **Decision: A.**

### D03 — Name of the runtime unit

Work: Session. Atelier: Request (and station runs). Pi Durable: conversation.

**Recommendation:** **Run.** "Session" suggests a chat; "Request" is reserved for demand if workflows return.
**Status:** Accepted, 2026-10-04. **Decision: Run.**

### D04 — Principals

- **Atelier:** agents are never principals; runs act as a user or a workspace service account.
- **Work:** no identity model (single user).

**Recommendation:** Adopt Atelier's rule. Runs act on behalf of the principal who started them; triggered runs act as a service account or the trigger's owner. Agents have no identity in the permission model.
**Status:** Accepted, 2026-10-04. **Decision: A.**

### D05 — How permissive v1 is

- **Work:** sandbox-first (Gondolin, deny-by-default egress) from the start.
- **Conversation:** start with "a generic web interface wrapper around Pi Durable which can code with all my permissions".

| Option | Summary |
| --- | --- |
| **A** | Containers from day one (devcontainer + Docker) with a permissive policy: open egress, the user's Git credentials available for push, approvals only for clearly external writes. Tighten through policy later. |
| B | Run on the host first, like a coding agent; add containers later. |
| C | Full posture from day one: allowlisted egress, every external write approved. |

**Recommendation:** A. The container is the part you keep, and devcontainers make it cheap. Permissiveness lives in configuration.
**Status:** Accepted, 2026-10-04. **Decision: C — full posture from day one.** Containers, allowlisted egress, credentials only through capabilities, every external write approved. Consequence: Git push needs a mechanism that keeps credentials out of the environment (D31).

### D06 — Where an environment's files come from

- **Work:** full copy of the local working directory (APFS clonefile), including `.env` and `node_modules`.
- **Atelier:** isolated worktree/branch from the project's Git store.

| Option | Summary |
| --- | --- |
| **A** | Fresh clone of the repository at a ref into a named volume. Secrets injected by work-os, not copied from `.env`. Optional "include my local changes" for the local runner only. |
| B | Copy of the local working directory (Work). |
| C | Git worktree on the host. |

**Recommendation:** A. It works with remote runners and multiple machines, and does not copy local secrets into the environment.
**Status:** Accepted, 2026-10-04. **Decision: mount the project folder directly.** A project may not be a Git repository (much work is not development). v1 bind-mounts the whole folder into the environment; no copy, no clone. Opens D32–D34.

### D07 — Environment and volume lifecycle

| Option | Summary |
| --- | --- |
| **A** | Container destroyed when the run ends; volume kept until the run is archived or expires (default 14 days). A finished run can be reopened as a chat, which re-creates the container on the same volume. |
| B | Destroy everything at the end. |
| C | Keep the environment running until archived. |

**Recommendation:** A.
**Status:** Accepted, 2026-10-04. **Decision: the container is destroyed; the mounted folder is the user's local directory and is never deleted.**

### D08 — Artifacts

- **Work:** Pieces are whatever the session produced; no explicit store.
- **Atelier:** artifacts live in the app first, are reviewed, then finalized.

| Option | Summary |
| --- | --- |
| **A** | Agents submit artifacts explicitly (`submit_artifact`); they are copied out of the environment, versioned and shown with a viewer. |
| B | Outputs live only in Git or external systems. |
| C | The transcript is the output. |

**Recommendation:** A.
**Status:** Accepted, 2026-10-04. **Decision: B — changed files are the output.** Plus external actions from the capability log and the agent's summary. No artifact store in v1.

### D09 — Default approval policy

| Kind of call | Recommended default |
| --- | --- |
| Read within declared capabilities | Allowed |
| Reversible write | Ask; may allow for the rest of the run |
| Irreversible or destructive | Always ask |

Standing grants are set by humans per standard; agents never create grants.
**Status:** Accepted, 2026-10-04. **Decision: once / this run / always for this standard on this target.** Irreversible actions offer only 'once'.

### D10 — Editing payloads before approval

- **Work:** separate draft and send actions.

**Recommendation:** The pending capability call *is* the draft. The approval shows the exact payload and lets the approver edit text payloads before approving.
**Status:** Accepted, 2026-10-04. **Decision: A — edit text payloads; diffs go back as a revision request.** Edits are recorded as corrections.

### D11 — Where capabilities are declared

- **Work:** on the Profile.
- **Atelier:** permissions bound at the Station; tools listed on the Agent.

**Recommendation:** On the standard. Undeclared capabilities are not registered as tools. Agents and subagents carry no permissions of their own.
**Status:** Accepted, 2026-10-04. **Decision: declared on the standard; a human can add a capability to a live run.**

### D12 — Completion: checks and review

- **Work:** no checks; outcome recorded on exit.
- **Atelier:** Checks gate the station; Review decides acceptance.

**Recommendation:** Standards declare checks (commands run before completion is accepted, with a retry limit) and a review policy (`required | optional | none`). Review outcomes are recorded against the standard and the reviewer.
**Status:** Accepted, 2026-10-04. **Decision: A — checks, then the standard's review policy.**

### D13 — Subagents

- **Work:** deferred; would be a Pi extension with depth and budget limits.
- **Atelier:** delegation configurable per agent with max depth.
- **Conversation:** must be configurable, unlike tools where subagents are hidden.

**Recommendation:** Declared by the standard as named agent presets, plus a generic helper. Depth 1 by default; concurrency and token budget limits from the standard within workspace ceilings; subagents get the run's capabilities or fewer.
**Status:** Accepted, 2026-10-04. **Decision: C — no subagents in v1.** Revisit with per-standard configuration when added.

### D14 — Run chat and steering

**Recommendation:** Every run has a chat that can be messaged, steered or interrupted from any client. Subagent conversations are visible and steerable. Finished runs can be reopened interactively (with D07).
**Status:** Accepted, 2026-10-04. **Decision: A — steer any run from any client; reopen finished runs.** (Subagent steering moot until D13 is revisited.)

### D15 — Assistant and chief of staff

- **Work:** Composer (LLM that turns a description into a session spec; cannot widen permissions).
- **Atelier:** ⌘K palette and a bounded intake REPL.
- **Conversation:** ⌘K natural language ("let's create a standard together"); chief of staff as a chat outside projects.

| Option | Summary |
| --- | --- |
| **A** | One app-level assistant (⌘K and a chat panel). The chief-of-staff module adds memory, source access, triggers and the dashboard to it. |
| B | Two separate agents: a command assistant and a chief of staff. |
| C | No assistant in v1; chief of staff only. |

**Recommendation:** A.
**Status:** Accepted, 2026-10-04. **Decision: B — two separate agents:** a ⌘K command assistant and a chief-of-staff chat with its own memory. Boundary: D36.

### D16 — Where standards and configuration live

- **Work:** packages are editable Git checkouts registered with the daemon.
- **Atelier:** three hidden Git-backed stores (workspace config, project config, filespace); users never see Git.

| Option | Summary |
| --- | --- |
| **A** | A workspace's configuration is itself a Git-backed package, editable in the app or in an editor. It may extend other packages. |
| B | Configuration in the database only, edited in the app. |
| C | Atelier's three hidden stores. |

**Recommendation:** A.
**Status:** Accepted, 2026-10-04. **Decision: A — a workspace's configuration is a Git-backed package.**

### D17 — Moving work between personal and organisation workspaces

**Recommendation:** Explicit copy (fork) with recorded provenance. No live links between workspaces.
**Status:** Accepted, 2026-10-04. **Decision: not built.** Standards belong to one workspace; moving one is a manual copy-paste.

### D18 — What a project is

- **Work:** a persistent context; may point at a repo, a directory, or nothing.
- **Atelier:** an execution context with filespace roots, request types and membership.

**Recommendation:** Zero or more repositories, an environment definition, connections it may use, and project standards. Non-code projects are Git repositories of markdown.
**Status:** Accepted, 2026-10-04. **Decision: connections are configured at workspace level; each project picks which it may use.** (Project = local folder per D06.)

### D19 — Default egress inside environments

| Option | Summary |
| --- | --- |
| **A** | Allowlist per environment (package registries, Git host, model gateway) with a per-standard "open" switch; all egress logged. |
| B | Open by default. |
| C | Deny by default. |

**Recommendation:** A as the target; v1 may ship with the "open" switch on (see D05).
**Status:** Accepted, 2026-10-04. **Decision: A — base allowlist per environment definition, per-standard additions, humans only, blocked requests logged with one-click add.**

### D20 — Chief-of-staff memory default

**Recommendation:** A folder of markdown notes in the personal workspace package, read and written through tools. Schema-free and editable by the user. Pluggable for alternatives (a Notion database, a vector store).
**Status:** Accepted, 2026-10-04. **Decision: A — markdown notes folder, overridable.**

### D21 — Generated dashboard

| Option | Summary |
| --- | --- |
| **A** | The LLM composes a declarative JSON spec from an approved component catalog, bound to read-only queries; the app renders it. |
| B | The LLM writes HTML rendered in a sandboxed iframe. |
| C | A fixed dashboard. |

**Recommendation:** A, with B as a later escape hatch.
**Status:** Accepted, 2026-10-04. **Decision: A — JSON spec rendered from an approved component catalogue.**

### D22 — Chief-of-staff scope across workspaces

**Recommendation:** The chief of staff is user-scoped and lives in the personal workspace. It reads organisation workspaces only through the user's own permissions; organisations can disable that access. Organisations never see the personal workspace.
**Status:** Accepted, 2026-10-04. **Decision: one chief of staff per workspace**, no cross-view between personal and organisation workspaces.

### D23 — Triggers in v1

**Recommendation:** Manual Play for standards; schedules and webhooks only for the chief of staff. General triggers after.
**Status:** Accepted, 2026-10-04. **Decision: A — manual Play plus schedules on standards.**

### D24 — Model setup for v1

**Recommendation:** pi-ai pointed at a provider directly (and LM Studio for local models), sending attribution headers from day one. Swap to an organisation gateway by configuration.
**Status:** Accepted, 2026-10-04. **Decision: A — pi-ai direct to providers plus LM Studio, attribution headers from day one.**

### D25 — Notifications in v1

**Recommendation:** In-app badges plus web push for blocking items only.
**Status:** Accepted, 2026-10-04. **Decision: push only when a run is blocked on the user; badges for everything else.**

### D26 — When LLM analysis of runs happens

- **Work:** record observations automatically; never propose improvements from a single occurrence.

**Recommendation:** Mechanical observations always. LLM analysis only on demand, on rejection, or when an observation recurs.
**Status:** Accepted, 2026-10-04. **Decision: only when the user asks.** Mechanical observations are still recorded on every run (recording is not analysis).

### D27 — User-visible branches

- **Atelier:** global branch selector; branches as the experiment tool for process and content.

**Recommendation:** Defer. Runs use Git branches inside their repositories; improvement runs produce branches on the workspace package. No product-level branch chrome in v1.
**Status:** Accepted, 2026-10-04. **Decision: defer.**

### D28 — v1 host, access and authentication

**Recommendation:** One daemon on an always-on machine reached over Tailscale; a single local account with a passkey or session cookie; OIDC later.
**Status:** Accepted, 2026-10-04. **Decision: server + runners.** A server daemon on the Mac mini holds account, workspace, run records, inbox and credentials, reached over Tailscale with a local account. A runner on each machine lets the user run against any local folder on that machine. Open the app anywhere, pick a machine and folder, start a run, get notified. Follow-up: D42.

### D29 — Repository and name

**Recommendation:** New repository `work-os` under `~/Repos/Personal`; organisation-specific packages in separate repositories.
**Status:** Accepted, 2026-10-04. **Decision: `work-os` in `~/Repos/Personal`; organisation packages in separate repositories.**

### D30 — Keeping reviewers to the criteria

Follows from D01 (single file). Work kept criteria and method in separate files so a reviewing agent never saw the method.

| Option | Summary |
| --- | --- |
| **A** | Fixed top-level headings (`# Criteria`, `# Method`). The loader splits them; producing agents get both, reviewing agents get only Criteria. `doctor` rejects a standard missing either heading. |
| B | Reviewers see the whole file; the review prompt tells them to ignore the method. |
| C | Method optional; when absent the agent works from criteria alone. |

**Recommendation:** A (and allow an empty Method section, which covers C).
**Status:** Accepted, 2026-10-04. **Decision: separate files** (`STANDARD.md` + `METHOD.md`). Reviewing agents load only `STANDARD.md`.

### D31 — Git push without credentials in the environment

Follows from D05. Work's full-copy workspaces carried the user's Git setup; that is no longer allowed.

| Option | Summary |
| --- | --- |
| **A** | Clone and fetch are done by the daemon (or through the egress proxy with a read-only token injected). The agent commits inside the environment; pushing is a capability (`git.push`) the daemon performs from the volume. The approval shows the commits and diff. |
| B | Egress proxy injects a write token for the allowlisted Git host (Gondolin-style placeholder secrets). Push looks native to the agent; approval happens at the proxy. |
| C | Short-lived, repo-scoped token (for example a GitHub App installation token) placed in the environment for the run. |

**Recommendation:** A. It keeps one approval mechanism for every external write and shows exactly what will be pushed.
**Status:** Accepted, 2026-10-04. **Decision: A — push is a capability.**

### D32 — Concurrent runs on one project folder

Follows from D06. Work copied the folder per session precisely so parallel sessions could not collide.

| Option | Summary |
| --- | --- |
| **A** | Direct mount by default. If the folder is a Git repository and another run is already writing to it, the new run gets a Git worktree beside the folder instead (or a standard can always ask for one: `isolation: shared \| worktree`). Non-Git folders allow one writing run at a time; others queue or mount read-only. |
| B | One writing run per project folder, always. Parallelism comes from different projects. |
| C | Allow concurrent writers; collisions are the user's problem. |

**Recommendation:** A.
**Status:** Accepted, 2026-10-04. **Decision: allow concurrent writers.** Standards can instruct agents to use Git worktrees themselves. v2: multiple ways to create an environment (environment sources).

### D33 — Rollback for directly mounted folders

Follows from D06. The agent is unrestricted inside the environment and now writes to the user's real folder.

| Option | Summary |
| --- | --- |
| **A** | Snapshot the folder before each run (APFS clone on macOS, which is instant and nearly free; a tarball elsewhere). Any run can be rolled back from the run page. Snapshots expire with the run record. |
| B | Rely on Git: require a clean commit or create a checkpoint commit before the run; non-Git folders have no rollback. |
| C | No rollback. |

**Recommendation:** A.
**Status:** Accepted, 2026-10-04. **Decision: no rollback in v1.**

### D34 — Secrets already in the project folder

Follows from D06 and D05. Mounting the folder means `.env` files and similar enter the environment, which contradicts "credentials never enter an environment" in spirit.

| Option | Summary |
| --- | --- |
| **A** | Visible to the agent; exfiltration is contained by the egress allowlist (Work's position). A per-project mask list (default `.env*`, `*.pem`, `id_*`) can hide files by overlaying empty mounts. |
| B | Always mask known secret patterns; the run gets secrets only through work-os-injected environment variables. |
| C | Refuse to start a run in a folder containing unmasked secrets. |

**Recommendation:** A with the default mask list on, so a project can opt in to exposing `.env` when its dev server needs it.
**Status:** Accepted, 2026-10-04. **Decision: the user's responsibility.** Mounting a folder that contains secrets is the user's choice; more environment sources may come later.

### D35 — Where a project's environment definition comes from

| Option | Summary |
| --- | --- |
| **A** | Precedence: the folder's own `.devcontainer/` if present → the environment chosen in project settings → the workspace default. Workspaces keep a small library of reusable environment definitions (for example "node", "writing"). |
| B | Always configured in the app; folder `.devcontainer/` ignored. |
| C | Always from the folder; a folder without one cannot run. |

**Recommendation:** A.
**Status:** Accepted, 2026-10-04. **Decision: B — always configured in the app.** Folder `.devcontainer/` is not read automatically.

### D36 — Boundary between the assistant and the chief of staff

Follows from D15.

| Option | Summary |
| --- | --- |
| **A** | **Assistant** = acts on work-os (create and edit standards, start runs, answer inbox items, navigate), scoped to the active workspace. **Chief of staff** = thinks across everything (priorities, memory, sources, dashboard) and *proposes*: suggested runs and draft replies appear as one-click actions or inbox items; it never starts runs or edits configuration itself. |
| B | Both can do everything; they differ only in persona and memory. |
| C | The chief of staff can call the assistant's tools, so it can act after confirmation in its own chat. |

**Recommendation:** A. It keeps the chief of staff read-only by construction and gives each a clear job.
**Status:** Accepted, 2026-10-04. **Decision: A — the assistant acts; the chief of staff proposes.**

### D37 — How the chief of staff learns about events

A local daemon reached over Tailscale cannot receive public webhooks without a relay.

**Decision:** poll read-only APIs on a schedule in v1 and emit events; add webhooks later (relay or hosted) behind the same event interface.
**Status:** Accepted, 2026-10-04.

### D41 — Home screen

**Decision:** the chief-of-staff dashboard for the active workspace; Inbox one click away (Inbox is home if the module is off).
**Status:** Accepted, 2026-10-04.

### D42 — Where the agent loop runs (server + runner split)

Follows from D28.

| Option | Summary |
| --- | --- |
| **A** | The Pi Durable harness (agent loop, transcript, model calls) runs on the **server**. The runner is a remote execution environment: it runs the container and executes tool calls (shell, file reads and writes) in the mounted folder. If a laptop sleeps, the run pauses at its next tool call and resumes when the runner reconnects; the inbox shows "runner offline". One source of truth; LM Studio sits next to the harness. |
| B | The whole run executes on the runner; the server mirrors state and inbox. Runs keep going if the server is down, but a sleeping laptop stops them anyway, and run state is split across machines. |
| C | Support both per run. |

**Recommendation:** A.
**Status:** Accepted, 2026-10-04. **Decision: A — harness on the server; runner executes tools.**

### D43 — Where capability calls execute (server + runner)

Follows from D28 and D42. Credentials live on the server, but some capabilities act on files in a runner's folder.

**Decision:** API capabilities execute on the server. For actions on files, the server gives the runner the command to run and the credential it needs (for example a GitHub token) for that approved call; the runner executes it on its host, outside the container. Notes: the runner must not persist the credential or pass it into the container; prefer short-lived, narrowly scoped tokens (GitHub App installation tokens, fine-grained PATs) where available.
**Status:** Accepted, 2026-10-04.

### D38 — Skills

**Recommendation:** open `SKILL.md` format in the workspace package. Agent presets list default skills; standards list extra ones; the agent sees names and descriptions and loads full skills on demand.
**Status:** Accepted, 2026-10-04. **Decision: SKILL.md in the workspace package, loaded on demand.**

### D44 — Authoring and improvement standards

**Recommendation:** `author-standard` and `improve-standard` are ordinary standards in a base package every workspace extends. The ⌘K assistant starts them; they produce a diff on the workspace package for review. Nothing in core treats them specially, and workspaces can override them.
**Status:** Accepted, 2026-10-04. **Decision: ordinary standards in a base package.**

### D45 — What Play asks for

**Recommendation:** one free-text prompt. A standard may set an `input` hint in frontmatter (for example "Linear ticket id or URL") shown as the placeholder. No forms.
**Status:** Accepted, 2026-10-04. **Decision: free-text prompt with an optional `input` hint.**

### D46 — Authoring formats: where TypeScript is allowed

Work used TypeScript for configuration (`work.package.ts`, `profiles/*.ts`) and Markdown for knowledge. D01 and D35 moved standard settings into Markdown and environments into the app, leaving CONTEXT §5.14 contradictory and the agent-preset format (D02) undecided.

**Decision:** anything a user authors is Markdown or JSON and editable in the app; TypeScript is only for code that adds new capabilities.

- Agent presets: `agents/<id>/AGENT.md` (YAML header: model requirements, default skills, thinking level; body: base instructions).
- Package manifest: `workos.yaml` (name, `extends`, optional code entry point).
- Environment definitions: `environments/<id>/devcontainer.json`, with the egress allowlist under `customizations.workos`.
- TypeScript only for adapters and capabilities, Pi Durable extensions, modules and their UI views, environment runtimes, memory stores and trigger sources.

**Status:** Accepted, 2026-10-04.

### D47 — Repository folder structure

The first architecture proposal used per-feature layer folders (`routes/`, `operations/`, `ports/`, `adapters/`). The user prefers the folder structures of Work and Atelier (not their code style).

**Decision:** thin `apps/*` processes; logic in `packages/*`; one seam package per external system (`db`, `harness`, `sandbox`, `secrets`, `push`, `package-store`, after Atelier's `db`/`sandbox`/`llm` seams); `core` with flat feature folders (after Work's `packages/core`); `protocol`, `shared`, `sdk` (Work); `domain`, `api`, `api-types`, `config`, `design-tokens` (Atelier); Atelier's web layout (`api/`, `shell/`, `ui/`, concept folders, scope-shaped `routes/`). Bundled work-os packages go in `bundled/` rather than Work's `packages/base`.
**Status:** Accepted, 2026-10-04.

### D48 — Styling

Atelier chose vanilla-extract explicitly (`packages/design-tokens/PLAN.md`, `specs/workspace-scaffold-plan.md`).

**Decision:** copy Atelier. `@work-os/design-tokens` is pure data (a `Tokens` contract and light/dark theme objects, zero dependencies). `apps/web/src/ui/theme.css.ts` creates typed `vars` with `createGlobalTheme` per `[data-theme]`; components style with `@vanilla-extract/recipes` in colocated `.css.ts` files; `@tabler/icons-react` behind `ui/Icon`; Radix primitives only for overlays (menu, popover, dialog). No Tailwind or utility CSS. Theme values start from Atelier's Harbour light/dark and are tuned toward the Vercel-like mockup.
**Status:** Accepted, 2026-10-04.

### D49 — Web data loading and routing

Atelier: TanStack Router, migrated to file-based routing; data through route loaders, never `useEffect`; per-workspace `openapi-fetch` client; Vercel-style scope routes (`/w/$workspaceId/p/$projectId`).

| Option | Summary |
| --- | --- |
| **A** | Copy Atelier: file-based scope-shaped routes, loaders for data, `router.invalidate()` driven by the SSE stream for live updates. No client cache library. |
| B | Loaders plus TanStack Query for caching and fine-grained invalidation. |

**Recommendation:** A. One data mechanism; add a cache library only if invalidating whole routes proves too coarse.
**Status:** Proposed.

### D50 — HTTP framework for the server API

Requirements: OpenAPI generated from the same schemas that validate requests (Atelier's huma pipeline: handlers → OpenAPI → `api-types` → `openapi-fetch`); SSE; WebSocket for the runner link; functional handlers (no classes, decorators or `this`, per STYLE.md); small; portable beyond Node if the server is ever compiled with Bun or hosted on a fetch-based runtime.

| Option | Fit |
| --- | --- |
| **Hono + `@hono/zod-openapi`** | Closest TypeScript analogue to huma: routes declared with zod schemas emit the OpenAPI document. Web-standard Request/Response, so it runs on Node, Bun and Workers. Built-in SSE helper; WebSocket via `@hono/node-ws`. Small and functional. Weaker: younger middleware ecosystem than Express/Fastify; `@hono/zod-openapi` with zod 4 needs checking. |
| Fastify + `fastify-type-provider-zod` + `@fastify/swagger` + `@fastify/websocket` | Most mature Node option, fast, JSON-Schema-native. Weaker: Node-only; plugin encapsulation and `decorate`/`this` conventions clash with the style guide; more concepts to learn. |
| oRPC (`@orpc/server` + `@orpc/openapi`) | Contract-first: one zod contract gives server handlers, a typed client without code generation, and an OpenAPI document; streaming via event iterators. Weaker: newer; procedure-shaped rather than resource-shaped; best client experience depends on the oRPC client rather than the generated-types pipeline chosen from Atelier. |
| ts-rest | Contract-first REST with zod and OpenAPI generation. Weaker: smaller, slower-moving project; SSE and WebSocket handled outside it. |
| Express 5 + zod + `zod-to-openapi` | Ubiquitous. Weaker: no typed request/response, OpenAPI assembled by hand, more glue code. |
| tRPC | Excellent TypeScript-only DX. Weaker: not OpenAPI/REST, which contradicts the language-neutral contract (Atelier). |
| Effect `HttpApi` | Fully typed with OpenAPI. Weaker: requires adopting the Effect paradigm, far outside the minimal language subset. |
| NestJS | Decorators and classes; ruled out by the style guide. |
| Plain `node:http` | No dependency. Weaker: routing, SSE, WebSocket upgrade, cookies and OpenAPI generation all hand-written. |

**Recommendation:** Hono, with oRPC as the strongest alternative if a codegen-free typed client becomes more valuable than the generated-types pipeline.
**Status:** Accepted, 2026-10-04. **Decision: Hono + `@hono/zod-openapi`.**

### D51 — Checking during the one-shot build

v1 is built in one uninterrupted run by an agent. `architecture-rules` is untested on a real codebase, and the run doubles as the experiment.

**Decision:** the agent checks after each slice and at each milestone (type-check, architecture-check, lint; tests at milestones). Type errors and structural failures are always fixed. Lint findings are fixed when compliance improves the code; otherwise the line is suppressed with `-- <concrete cost>`. Recurring conflicts are logged in `BUILD-NOTES.md`, never "fixed" by reconfiguring rules. `architecture-rules` is pinned to `eb48638` for the run; known false positives are overridden once, up front, with reasons. The run ends with `docs/lint-report.md`. Details in `BUILD.md`.
**Status:** Accepted, 2026-10-04.

### D52 — Release-age exception for Pi Durable

STYLE.md requires a 14-day minimum release age. Pi Durable 1.0.x, pi-ai and chord were published 1–3 October 2026; the only older versions are pre-1.0 with a different API.

**Decision:** pin `@earendil-works/pi-durable`, `@earendil-works/pi-ai` and `@earendil-works/chord` at 1.0.2 exactly, excluded from the release-age rule. Every other dependency follows the rule.
**Status:** Accepted, 2026-10-04.
