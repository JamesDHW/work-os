# work-os — One-shot build brief

> Read this first, then `CONTEXT.md`, `DECISIONS.md`, `ARCHITECTURE.md` and `STYLE.md`.
> This brief is for an agent building v1 end to end **without interruptions**. Nobody is available to answer questions during the run. Wherever an earlier document says "ask", this brief says what to do instead.

---

## 1. Goal

Build the v1 **core loop** of work-os (scope chosen 2026-10-04):

- **Processes:** server, runner, egress gateway, web app, minimal CLI.
- **Server:** passkey sign-in, workspaces, projects (local folders on a runner), standards (`STANDARD.md`, `METHOD.md`, `AGENT.md`), runs with chat on Pi Durable, inbox with capability approvals (once / this run / always here, editable text payloads), checks, changed files, review, live updates over SSE, web push for blocking items.
- **Runner:** pairing, outbound link, devcontainer environments with the project folder mounted, tool execution in the container, checks, changed-file manifests, folder-bound host commands with a per-call credential, egress gateway control.
- **Bundled packages:** `base` (default agent, default environment, `author-standard`, `improve-standard`) and `github` (connection, read capabilities, `github.pr.create`, `git.push`).
- **Out of scope for this run:** ⌘K assistant, chief of staff, schedules, Slack/email signals, organisations beyond the personal workspace, mobile.

The run is also an **experiment**: how close does code written under `architecture-rules` get to code the user likes? Keep the evidence honest (§4).

## 2. Milestones

Each milestone ends with a full check (§3) and a local Git commit (never push).

| # | Milestone | Done when |
| --- | --- | --- |
| M0 | Preflight | Toolchain installed; architecture-rules pinned and running on a sample; Pi Durable API understood; findings recorded in `BUILD-NOTES.md` |
| M1 | Scaffold and foundations | Workspace, configs, `architecture.config.ts`; `shared`, `domain`, `protocol`, `config` with tests; full check green |
| M2 | Server | `core`, `db`, `secrets`, `push`, `package-store`, `harness`, `api`, `apps/server`; a run completes against a scripted fake model in tests |
| M3 | Runner and gateway | `sandbox`, `apps/runner`, `apps/egress-gateway`; server ↔ runner link tested in-process; Docker path tested when Docker is available |
| M4 | Web | Tokens, UI primitives, shell, scope routes, inbox, runs, standards, projects, settings, sign-in, SSE, push |
| M5 | Bundled packages, CLI, verification | `bundled/base`, `bundled/github`, CLI; end-to-end smoke; lint report; `BUILD-NOTES.md` complete |

## 3. Checking as you go

| When | What |
| --- | --- |
| After each slice (one package or one feature folder) | Type-check, architecture-check and lint for what changed; fix while the code is fresh |
| At each milestone and at the end | Everything across the repository, plus tests |

Commands: `pnpm typecheck`, `pnpm architecture:check`, `pnpm lint`, `pnpm test`. Do not run checks after every edit.

### What to do with each kind of failure

| Failure | Move |
| --- | --- |
| Type error | Fix it. |
| Structural (file type, naming, import boundary, compiler policy) | Restructure the code to fit. Changing `architecture.config.ts` is a last resort: never remove a boundary just to get green, and log every change with its reason in `BUILD-NOTES.md`. |
| Lint finding that improves the code | Fix it. |
| Lint finding whose fix would make the code worse (more indirection, duplicated logic, a contrived helper, a less readable flow) | Suppress that line: `// oxlint-disable-next-line <rule> -- <the concrete cost of complying>`. Keep going. |
| The same rule, same pattern, again and again | Keep suppressing with a consistent reason that names the pattern; record the pattern once in `BUILD-NOTES.md`. Do not change the rule's configuration. |
| The checker itself fails or crashes | Fall back to type-check plus plain `oxlint`, record it, retry at the next milestone. Never work around the tool. |

### Self-checks against gaming

- A reason must name a concrete cost. "Rule is noisy" or "simpler" alone is not a reason.
- If a package averages more than about one suppression per 150 lines, re-read that package before moving on and remove suppressions that a better structure would avoid.
- Suppressions are allowed only on lint rules. Structural checks and compiler requirements cannot be suppressed.

## 4. Experiment integrity

- `architecture-rules` is pinned to one commit for the whole run (`eb48638`). Do not edit it.
- Known false positives from `LINT-RULE-FINDINGS.md` are handled once, up front, as reasoned rule overrides in `architecture.config.ts`, and listed in `BUILD-NOTES.md`.
- At the end, generate `docs/lint-report.md` from the code: findings by rule, every suppression with its file and reason, rules that never fired, and configuration overrides.

## 5. Decisions during the run

- **Open decisions:** take the recommendation in `DECISIONS.md` and log it in `BUILD-NOTES.md`.
- **New decisions:** choose the option most consistent with `CONTEXT.md` and the style guide, implement it, and log the decision with the alternatives considered.
- **Dependencies:** use only those listed in `ARCHITECTURE.md`. If something else is unavoidable, prefer a platform API; otherwise add the smallest well-maintained library, pin it exactly, and log why.
- **Spike failures** (an assumption in `ARCHITECTURE.md` §11 turns out false): pick the simplest working alternative, keep it behind the same port, and log it.
- **Things that need the user's machine or secrets** (real model keys, macOS keychain, Tailscale, passkeys on a real hostname): build them behind ports, test with fakes, and list exactly what the user must do in `BUILD-NOTES.md` under "To verify on your machine".

## 6. Outputs at the end

- The code, with all checks run and their final state recorded.
- `BUILD-NOTES.md`: decisions, configuration changes, recurring rule conflicts, tool failures, spike outcomes, and "To verify on your machine".
- `docs/lint-report.md`.
- A Git commit per milestone.
