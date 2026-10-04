# work-os — Context

> **Status:** synthesis with all product decisions accepted, 2026-10-04. Architecture to follow.
> Supersedes `work/CONTEXT.md` and `agent-studio/specs/*` for the new project.
> Every decision and its status lives in `DECISIONS.md`; references like (D12) point there.

## Purpose of this document

This file gives an agent or a person enough context to work on work-os without the design conversations behind it.

It covers what work-os is, what it is not, its concepts, its boundaries, its security model and the decisions taken so far. It does **not** describe the architecture (that will live in `architecture.config.ts` and an architecture doc) or a committed implementation plan.

### Lineage

work-os merges two earlier projects and one new runtime:

| Source | When | Strongest on |
| --- | --- | --- |
| **Atelier** (`agent-studio`) | May 2026 | Product model, review flow, tenancy, UX. A top-down spec of a studio for designing, running, reviewing and improving AI work. Go scaffold only. |
| **Work** (`work`, `work-theodo`) | Aug–Sep 2026 | Safety model and package model. A TypeScript engine that injected standards into sandboxed Pi sessions, with a capability broker, grants and an attention queue. Terminal UI. |
| **Pi Durable** | Oct 2026 | Durable agent runtime: crash-safe conversations and tasks, hooks, documents, subagents, multi-client steering. Replaces the parts of Work that were hardest to build. |

---

# 1. What work-os is

> **work-os is an open, self-hostable system for running AI agents on real work — durably, safely, on any model and in any environment — that you shape into your own way of working with standards and packages.**

It occupies a similar place to `pi`: a small, malleable core that people build their own system on. It is not one person's product.

Its long-term ambition is to be the **AI backbone of an organisation**, the way Slack became its information backbone: by integrating with the systems people already use, not by replacing them.

Adoption is opt-in and bottom-up. One person starts with a personal workspace because it is useful to them. As colleagues join, they create an organisation and adopt shared standards gradually.

### Motivating belief

> Modern LLMs can do a large share of knowledge work if they are given the right intent, context, standards, capabilities and bounded autonomy. The scarce resource is human attention, not execution capacity.

### The primary loop

1. Define a **Standard**: what good looks like, how it is best produced, which agent does it, what it may touch, and the environment it runs in.
2. In a **Project**, pick a standard, give a short free-text starting prompt (often just a ticket id; the standard can supply a placeholder hint), and press **Play**. **Accepted (D45).**
3. The agent works inside an isolated **Environment** with no restrictions on what it does there.
4. Anything that crosses into the outside world goes through a **Capability**. Calls that need permission arrive in the **Inbox** for approval.
5. Many runs proceed in parallel. The human watches the Inbox, answers questions, approves actions and steers any run through its chat.
6. The run completes, its **Checks** pass, its output is **Reviewed**, and its container is torn down (the project folder stays as it is).
7. The run's record (spec, transcript, outcome, human corrections) feeds improvement of the standards and the system.

---

# 2. Principles

1. **Standards over prompts.** Repeatable work is defined once and run many times. The definition, not the prompt, is what improves.
2. **Free inside, governed at the boundary.** Inside its environment an agent may do anything. Crossing into external systems, credentials or the network is mediated.
3. **Human attention is scarce.** Agents resolve uncertainty from context, the repository and the standard before asking. Questions are batched. Interruption priority follows cost of waiting, not seniority.
4. **No LLM can widen a permission.** Agents may narrow within ceilings that humans set. Raising a ceiling is always a human decision.
5. **Credentials never enter an environment.** The server holds them and performs authenticated calls on the run's behalf (D43).
6. **Everything is inspectable and reproducible.** Every run records the spec it was composed from. Composition is never implied by a conversation.
7. **Record cheaply, propose selectively.** Observations are captured automatically on every run. Improvement analysis happens only when a person asks for it (D26), never from one bad afternoon.
8. **The engine owns the grammar; packages own the opinions.** No organisation's standards or methodology live in core.
9. **First-party modules use the public extension API.** If the chief of staff can be built as a package, anyone can build their own.
10. **Integrate systems of record; don't replace them.** Build natively only where agents create leverage no other tool has: runs, the inbox, standards and knowledge, plans built from every source.
11. **Tenant-shaped from day one, self-hosted in deployment.** The data model is multi-tenant; v1 is one server plus a runner on each of the user's machines (D28).
12. **Portable.** Any model (through a gateway), any environment runtime, any machine.
13. **Hide machinery, keep it inspectable.** Users see standards, runs, the inbox and run outputs. Specs, transcripts and configuration are one click away.
14. **Deterministic by default.** Play is deterministic. LLM composition (the assistant) is a convenience, not the front door.
15. **Useful before complete, never unsafe.** Build what the first user needs first, without shortcuts in the security boundary.

---

# 3. What work-os is not

- **Not a chat app or AI playground.** Every run has a chat, but the run and its outputs are the unit of value.
- **Not an IDE or a terminal UI.** Environments are devcontainers, so any editor can attach.
- **Not an agent harness or model router.** It builds on Pi Durable and pi-ai.
- **Not a model gateway.** Spend, rate limits and model policy belong to a gateway that work-os connects to.
- **Not a no-code automation builder.** The core problem is ambiguous knowledge work with standards and review.
- **Not a replacement for Slack, Linear, Notion, email or calendar.** It reads from and writes to them through adapters.
- **Not a wiki or an OKR/analytics suite.**
- **Not, in v1:** hosted multi-tenant SaaS, a package marketplace, a visual workflow editor, or evaluation suites.

---

# 4. Boundary

```
            Web app · CLI · (phone later)        clients use only the public API
 ──────────────────────────────────────────────────────────────────────────────
 Modules     Chief of staff · Signals · Team plans · Skills matrix & dojos
             opt-in; built as first-party packages on the public extension API
 ──────────────────────────────────────────────────────────────────────────────
 Core        Identity & workspaces · Projects · Standards · Runs · Environments
             Capabilities & grants · Inbox · Triggers · Packages · Records
 ──────────────────────────────────────────────────────────────────────────────
 Adapters    Linear · Notion · Calendar · Slack · Email · GitHub
             Environment runtimes · Model gateway · Memory stores
 ──────────────────────────────────────────────────────────────────────────────
 Outside     Model gateway (spend, policy) · Identity provider · Git hosting
```

- **Core** is the mechanism needed to run agents on work safely. It depends on nothing above it.
- **Modules** are optional. Each depends on core, never the reverse. Each puts its system of record behind a port with a native implementation and external alternatives (for example, chief-of-staff memory can be native or a Notion database).
- **Adapters** connect core and modules to the outside world. Every adapter sits behind an interface, so swapping one changes no core code.

---

# 5. Concepts

## 5.1 Principal

A **principal** is the identity that permissions and the audit trail attach to: "who did this, and were they allowed to?"

work-os has two kinds of principal:

- **User:** a person.
- **Service account:** a workspace-owned identity for unattended work, such as a scheduled or webhook-triggered run.

**Agents are never principals.** A run acts on behalf of the principal that started it. When the agent calls a capability, the audit log reads "run R, started by James, using standard S, called `github.pr.create` on repo X" — not "the coder agent did it". The agent's permissions come from the standard it is running and the approvals its principal gives. **Accepted (D04).**

## 5.2 Workspace

A **workspace** is the tenancy boundary. Everything that matters belongs to exactly one workspace: projects, standards, agents, skills, connections, credentials, runs, inbox items and grants.

- Every user gets a **personal workspace** on first use.
- **Starting an organisation** creates a shared workspace that others join.
- A user may belong to several workspaces, with one active at a time.
- A personal workspace is an organisation of one. There is no separate code path.
- Workspaces do not see each other's data.

Policy resolves from the outside in: workspace → project → standard → run. A ceiling set at an outer level cannot be raised at an inner one.

Standards belong to exactly one workspace. There is no feature for moving or sharing them between workspaces; a person who wants a personal standard in an organisation copies it by hand. **Accepted (D17).**

## 5.3 Project

A **project** is where runs happen. It is a persistent context, and it is **not necessarily a code repository**: much of the work is not software development.

In v1 a project is **a folder on the machine that runs it**. A project has:

- a **location**: the runner and the folder path. Recording the runner keeps the door open to other locations later (a Git clone on a remote runner, for example);
- an **environment definition** (`devcontainer.json`), always chosen and edited in the app from the workspace's library of environment definitions (**Accepted (D35)**);
- the **connections** it may use, chosen from those set up once at workspace level (**Accepted (D18)**);
- project-specific **standards**, in addition to the workspace's.

A "LinkedIn" project is a folder of markdown: a voice guide, past posts and an ideas inbox. A code project is a folder that happens to be a Git repository. **Accepted (D06).**

## 5.4 Standard

A **standard** is the runnable definition of one kind of work. It answers four questions and is written as **two markdown files**: `STANDARD.md` (frontmatter configuration plus the criteria) and `METHOD.md` (the best-known method). **Accepted (D01, D30).**

| Question | Part | Where |
| --- | --- | --- |
| What does good look like, and for whom? | Criteria | `STANDARD.md` body |
| What is the best-known way to produce it? | Method | `METHOD.md` |
| Who does it, with what? | Agent, skills, environment | `STANDARD.md` frontmatter |
| What may it touch outside the environment, and how is it checked? | Capabilities, checks, review policy | `STANDARD.md` frontmatter |

```
standards/
└── technical-plan/
    ├── STANDARD.md      frontmatter (config) + criteria
    ├── METHOD.md        best-known method (was "operating mode" / "brief")
    └── examples/        optional, loaded on demand
```

```markdown
---
id: technical-plan
describes: A plan another engineer can implement without inventing the important decisions.
consumer: implementing engineer
agent: planner
skills: [place-new-code]
capabilities: [github.issue.read, linear.issue.read]
egress: []          # domains added to the environment's allowlist (D19)
checks: []
review: required
input: Linear ticket id or URL
---

## Intent
## Key points
## Common defects
```

- **Frontmatter is configuration.** YAML has no compile-time types, so it is validated against a schema when packages load and by a `doctor` command, never first discovered at run time.
- **Selection reads only `id`, `describes` and `consumer`**, so a catalogue of every standard stays cheap as it grows.
- **Criteria and method are separate files** because they change at different rates (what counts as a good plan is stable; the best way to produce one changes with models and tools), and because a reviewing agent should judge the output against the criteria only. Producing agents load both; reviewing agents load only `STANDARD.md`. `METHOD.md` may be empty.
- **The method is guidance, not a state machine.** Deviation is recorded as an observation, not treated as failure.

Standards are one step of work. Chaining standards into workflows is deferred (§17). **Accepted (F06).**

## 5.5 Agent

An **agent** is a reusable preset describing *who* does the work: model requirements, base instructions, default skills and thinking level. Standards reference agents by name (and, later, so will subagent declarations). **Accepted (D02).**

An agent preset is an `AGENT.md` file: the YAML header holds model requirements, default skills and thinking level; the body holds the base instructions. **Accepted (D46).**

An agent preset carries no permissions. Permissions come from the standard (§5.7). This is why the same "coder" agent can run a planning standard with read-only capabilities and an implementation standard that may open pull requests.

Agents declare **model requirements**, not concrete models. The workspace resolves them to a model available through its gateway (§8).

## 5.6 Skill

A **skill** describes how to reliably perform a recurring activity or decision ("place new code", "write a slide narrative"). Skills use the open `SKILL.md` format and live in the workspace package. Agent presets list default skills and standards list extra ones; the agent sees their names and descriptions and loads a full skill only when it needs it. **Accepted (D38).**

Standard versus skill: a standard says what good looks like; a skill is a reusable procedure for part of the work.

## 5.7 Capability, connection, grant

- A **connection** is an authenticated link to an external system (a GitHub account, a Notion workspace, a Slack workspace, an email inbox). Connections are set up once per workspace; projects choose which they may use. Credentials are held by the server and never enter an environment.
- A **capability** is one specific operation on a connection: `github.pr.create`, `notion.page.append`, `slack.message.draft`. Capabilities are defined by adapters in packages. There is deliberately **no generic capability** that signs arbitrary requests; that would collapse every permission into "may act as you".
- A **standard declares which capabilities its runs may use.** Undeclared capabilities are not registered as tools, so the agent never sees them. If a run needs one it lacks, the agent says so and a **human can add it to the live run** from the run page. The addition is recorded in the spec and flags the standard as possibly incomplete. Only humans widen. **Accepted (D11).**
- A **grant** is permission to use a capability on a specific target for a specific duration. Grants are created by humans, either in advance (standing grants on a standard) or just in time (approving an Inbox request). Agents never create grants.

Default approval policy (**Accepted (D05, D09)**):

| Kind of call | Default |
| --- | --- |
| Read, within declared capabilities | Allowed |
| Reversible write (comment, draft, branch push) | Ask. Approver chooses: **once**, **for the rest of this run**, or **always for this standard on this target** (a standing grant, revocable in settings) |
| Irreversible or destructive (merge, send, delete, spend) | Ask every time; only "once" is offered |

An approval request shows the exact payload (the diff, the message, the page content). The approver may edit text payloads (messages, PR titles and bodies, page content) before approving, so "draft, then send" is the same mechanism as approval. Code diffs are not edited in the approval; the approver requests a revision instead. Every edit is recorded as a human correction, the highest-value signal for improvement. **Accepted (D10).**

Refused calls return a **structured refusal** stating what was refused and why, so the agent can stop, ask or reroute rather than retry blindly.

## 5.8 Environment

An **environment** is where a run's agent executes. It has three separable parts (**Accepted (F05)**):

1. **Definition:** `devcontainer.json` (plus Compose for services). It describes the toolchain and services, as close to production as is practical. The same file serves people, agents, CI and editors.
2. **Runtime:** a pluggable provider that creates the isolation boundary. Each runtime declares an isolation level: `container` < `microvm` < `remote`. Policy can require a minimum level (for example, an organisation could require `microvm` for unattended runs). v1 offers only `container`.
3. **Network and secrets policy:** owned by work-os, enforced by an egress proxy for container runtimes and translated into the provider's own policy where it has one.

Candidate runtimes: Docker via the devcontainer CLI (v1), Docker Sandboxes, Apple `container`, Gondolin, DevPod providers, Codespaces, Coder, Clean Room. Portable path: build an OCI image with the devcontainer CLI, then run it on any runtime that accepts OCI images.

The run works **directly in the project folder**, bind-mounted into the container. There is no copy. When the run ends the container is destroyed; the folder is the user's and is never deleted. **Accepted (D06, D07).**

v1 deliberately keeps this simple (**Accepted (D32–D34)**):

- **Concurrent runs may write to the same folder.** Where that matters (several tickets on one repository), the standard's method tells the agent to use Git worktrees itself.
- **No rollback.** The user's own version control and backups are the safety net.
- **Secrets in the folder are the user's responsibility.** If a mounted folder contains `.env` files or keys, the agent can read them; the egress allowlist limits where they can go.

**Door kept open:** how an environment gets its files is an **environment source**. v1 has one source, "mount a local folder". Later sources (fresh clone, copy, per-run worktree, snapshot-and-rollback, secret masking) slot in behind the same interface.

## 5.9 Run

A **run** is one execution of one standard in one project. It is the main unit users see. **Accepted (D03).**

A run has:

- a **spec**: the serialised record of exactly how it was composed (project, standard version, agent, model, skills, capabilities, grants, environment, starting prompt, package versions);
- a **principal** it acts on behalf of;
- one primary **conversation** (its chat), backed by Pi Durable;
- an **environment**: a container on a runner with the project folder mounted;
- **inbox items** it has raised;
- its **output**: changed files, external actions and a final summary;
- an **outcome** and **observations**.

Every run has a chat window. The user can message, steer or interrupt it at any time, from any client, and can reopen a finished run to continue interactively on the same folder. **Accepted (D14).**

### Subagents

**No subagents in v1.** One agent per run. **Accepted (D13).** Pi Durable already models subagents as conversations owned by a run, so adding them later does not change the run model. When they arrive, they must be configurable per standard rather than hidden inside the runtime.

## 5.10 Run output

There is no separate artifact store. **A run's output is what it changed** (**Accepted (D08)**):

- **files changed in the project folder** during the run, detected by comparing a manifest of file hashes taken at the start with one taken at the end (or `git status` when the folder is a Git repository);
- **external actions** it took through capabilities (the PR it opened, the page it edited), from the capability log;
- the agent's **final summary**.

The run page and review show these three things with suitable viewers (markdown, diff, code, image).

Consequence of concurrent writers (D32): if two runs change the same folder at the same time, each run's "changed files" list can include the other's changes. The list is a guide, not an exact attribution.

## 5.11 Checks and review

- **Checks** are automated commands declared by the standard (tests, lint, `architecture-rules check`) that must pass before a run may complete. A failing check sends the agent back to work, or escalates after a limit.
- **Review** is the human (or policy) decision on a completed run's output. Each standard declares `review: required | optional | none`.

Review outcomes are recorded against the standard and the reviewer. **Accepted (D12).** This is the raw material for improvement and, later, the skills matrix.

## 5.12 Inbox item

An **inbox item** is anything that needs a principal's attention. Items are generic over their source:

| Source | Examples |
| --- | --- |
| Agent run | question (`ask_user`), capability approval, review request, escalation |
| External (via Signals, later) | Slack mention, email, Linear assignment, PR review request |

Each item has a requester (human or agent), an ask (question, approval, review, FYI), whether it is **blocking** something, and a cost of waiting. Answers route back to the source: answering an agent resolves its pending hook; answering a Slack message produces a draft reply that a capability sends.

## 5.13 Trigger

A **trigger** starts a run or wakes a module without a human pressing Play: a schedule, a webhook, or an event from a connection. Triggered runs act on behalf of a service account or the user who created the trigger. v1 has **manual Play and schedules** on standards (for example, LinkedIn drafts every Monday and Thursday). Scheduled runs still stop at approvals. Event-triggered runs come with webhooks (D37). **Accepted (D23).**

## 5.14 Package

A **package** is a Git repository of work-os definitions: standards, agents, skills, environment definitions and, optionally, code that extends what work-os can do.

**Anything a user authors is Markdown or JSON and editable in the app. TypeScript is only for code that adds new capabilities.** **Accepted (D46).**

| Authored by users (no code) | Format |
| --- | --- |
| Package manifest (name, `extends`, optional code entry point) | `workos.yaml` |
| Standard: settings + criteria / method | `standards/<id>/STANDARD.md` (YAML header) / `METHOD.md` |
| Agent preset | `agents/<id>/AGENT.md` (YAML header) |
| Skill | `skills/<id>/SKILL.md` |
| Environment definition (with its egress allowlist under `customizations.workos`) | `environments/<id>/devcontainer.json` |
| Chief-of-staff memory | `memory/**/*.md` |

Connections, credentials, schedules and grants are workspace state held by the server, not files in a package.

| Written by developers extending work-os | Format |
| --- | --- |
| Adapters and their capabilities, Pi Durable extensions (tools, hooks, durable tasks), modules and their UI views, environment runtimes, memory stores, trigger sources | TypeScript, behind the code entry point named in `workos.yaml` |

- Packages may **extend** other packages.
- A **workspace's own configuration is itself a package**: a Git-backed folder of standards, methods, agents and environment definitions, editable in the app or in any editor. Improvement runs produce diffs against it. **Accepted (D16).**
- Packages contain executable code (adapters, extensions) and are trusted as code. There is no registry in v1; packages are Git URLs or local paths.

## 5.15 Observation

An **observation** is a cheap, factual record that something happened which the system might have prevented: a correction by the human, a refused capability call, a failed check, a question the standard should have answered, a deviation from the method, a rejected review. Observations carry no judgement and propose nothing.

## 5.16 Assistant and chief of staff

There are **two separate conversational agents** outside projects. **Accepted (D15).**

- The **assistant** is reached through ⌘K. It operates work-os in natural language: "create a standard with me", "run the technical-plan standard on ABC-145", "what's waiting on me?". It can only do what the user could do through the UI, and it can never widen a permission.
- The **chief of staff** is the first module: a separate chat with its own memory, read access to the user's sources, triggers and a generated dashboard (§11).

**The assistant acts; the chief of staff proposes.** **Accepted (D36).**

- The assistant acts on work-os within the active workspace: creates and edits standards, starts runs, answers inbox items, navigates.
- The chief of staff thinks across everything and proposes. Suggested runs and draft replies appear as one-click actions or inbox items. It never starts runs or edits configuration itself, which keeps it read-only by construction.

---

# 6. Run lifecycle

```
Play (standard + project + starting prompt)
  → compose spec (deterministic) and record it
  → build/start the environment with the project folder mounted
  → agent works freely inside the environment
      ↳ capability calls → allowed, or → Inbox approval → result or structured refusal
      ↳ questions → Inbox (blocking or not); agent continues other work where it can
      ↳ user steers at any time through the run's chat
  → agent writes its final summary and calls complete
  → checks run; on failure the agent resumes (up to a limit, then escalates)
  → review (if the standard requires it) → accepted / revision requested / rejected
  → container destroyed; the project folder stays as it is
  → observations recorded; transcript available for improvement
```

Runs are durable. A crash or reboot resumes from the last checkpoint (Pi Durable). Tool calls marked replay-safe rerun; others report the interruption to the agent.

---

# 7. Security model

### Risk classes

```
inside an isolated environment          → high autonomy, no tool restrictions
crossing into external systems           → declared capabilities + grants + approval
irreversible or destructive external act → always human approval
```

### Threat model (from Work, adapted)

**Trusted:** the user, their machine, installed packages and extensions (they are code).

**Defended against:**

- a run taking a destructive or irreversible action in an external system;
- a run taking a correct-looking action against the wrong target;
- instructions injected through content the agent reads (a ticket, a web page, an email) causing either of the above;
- a credential being readable by, or exfiltrated from, an environment.

**Not the current priority:** hardening the server or runners against a hostile local user, container or VM escapes, hostile multi-user deployments.

**Accepted v1 limitations (D32–D34):** a run can damage or delete files in the folder the user mounted, concurrent runs can collide in it, and secrets the user keeps in it are readable by the agent. The posture in v1 protects external systems and the rest of the machine, not the mounted folder.

### What contains the risk

- **Environment isolation** protects the host.
- **Credentials stay on the server.** Capabilities perform authenticated calls there, or on a runner's host for a single approved file-bound call (D43); containers never hold the secret.
- **Egress policy** limits where data can go from inside the environment. Each environment definition has a base allowlist (package registries, Git host, model gateway); a standard may add domains. Only humans edit allowlists. Every blocked request is logged and shown on the run page with a one-click "add to this standard". **Accepted (D05, D19).**
- **Capabilities bound scope; approvals bound intent.** A grant limits the blast radius; it does not stop misuse within that grant, which is why irreversible actions always ask.
- **Everything is logged** with run, principal, capability, target, arguments and outcome.

### v1 posture

v1 ships the **full posture from day one**: environments are containers, egress is allowlisted, credentials reach external systems only through capabilities, and every external write is approved unless a human has granted otherwise. **Accepted (D05).**

---

# 8. Models and the gateway

work-os does not own model traffic. Every model call goes through one **Model port** pointed at an OpenAI- or Anthropic-compatible endpoint: an organisation's gateway (for example Bedrock behind an API gateway), a local LiteLLM, a local LM Studio, or a provider directly for a solo user.

- Every call carries **attribution**: workspace, principal, run, standard and a trace id.
- The **gateway owns** tokens, spend, rate limits and model policy.
- **work-os owns** work data: runs, outcomes, review results, attention spent.
- The two join on trace id. A gateway adapter can read spend back to show cost per run or standard.
- External tools (Pi, Claude Code, Cursor) use the same gateway directly, so an organisation sees all AI use in one place.

v1 setup: pi-ai talks to providers directly (for example Anthropic) and to LM Studio for local models, sending attribution headers from day one. Agent presets declare model requirements; the workspace maps them to concrete models. Pointing at a gateway later is a configuration change. **Accepted (D24).**

---

# 9. Environments

See §5.8 for the model. Additional points:

- **Two kinds of environment are expected:** fast per-run sandboxes (inner loop) and longer-lived, full-stack per-ticket environments with real services (outer loop). The runtime port must allow both.
- **"Prod-like" has limits.** Devcontainers reproduce the toolchain and any containerisable services. Managed cloud services and IAM need remote environments.
- **Files:** runs mount the project folder directly (D06). Reopening a finished run as a chat starts a new container on the same folder (D07).
- **Git:** pushing is the `git.push` capability, approved like any other external write (D31).
- **Where capability calls execute (Accepted (D43)):** credentials live on the server. API capabilities (Notion, Slack, GitHub API) execute on the server. Capabilities that act on files in a runner's folder (for example `git.push`) are executed by the runner on its host, outside the container: the server sends the runner the command to run together with the credential it needs (for example a GitHub token) for that single approved call. The runner must not persist the credential or pass it into the container. Prefer short-lived, narrowly scoped tokens where the provider offers them.

---

# 10. Inbox and attention

The Inbox is the human's main working surface. Many runs proceed in parallel; the human handles what is waiting.

- Items are listed by **blocking first**, then approvals, then reviews, then FYI. The chief of staff may re-rank later.
- Each item shows what is waiting on it ("Blocking 2"), the payload or run output, and actions (approve, reject, request revision, answer, comment).
- Multiple clients can show the same inbox. Answers are compare-and-set, so two clients cannot both answer.
- **Notifications:** a phone or desktop notification (web push from the installed web app) only when a run is blocked on the user (an approval or a question). Everything else is a badge in the inbox. **Accepted (D25).**

---

# 11. Chief of staff (module)

The chief of staff helps the user see the whole picture across many initiatives and keeps daily work connected to longer-term goals.

- **Lives outside projects.** It is its own agent and chat, separate from the ⌘K assistant (D15).
- **Imposes no structure.** It does not require "initiatives" or "OKRs". It keeps its own state through a pluggable **memory** that the LLM can write and query. The default memory is **a folder of markdown notes** in the workspace package (`priorities.md`, `people/`, whatever it and the user converge on): schema-free, diffable and editable by the user. Alternatives (a Notion database, a vector store) plug in through the memory port. **Accepted (D20).**
- **Reads, never writes, by default.** It has read-only, on-demand access to the user's sources (email, Slack, GitHub, Linear, calendar, Notion) through connections. These are queried when needed, not stuffed into context.
- **Can be woken by events.** In v1, connections **poll** read-only APIs on a schedule and emit events (a new email's subject and first lines, a new PR); the chief of staff reads and ranks them. Webhooks arrive later through a relay or a hosted deployment, behind the same event interface. **Accepted (D37).**
- **Proposes, doesn't act (D36).** It can propose runs and draft replies as one-click actions or inbox items; anything external still goes through capability approvals.
- **Renders a dashboard.** The user describes their priorities; the chief of staff composes a **declarative JSON spec** from an approved component catalogue (lists, metrics, PR table, email triage, calendar strip, priorities tree), bound to read-only queries. The app renders it in its own theme and regenerates it on request. LLM-written HTML is a possible later escape hatch. **Accepted (D21).**
- **One chief of staff per workspace.** A personal chief of staff and an organisation one are separate, with separate memory and no cross-view. This keeps personal and employer data apart at the cost of a single whole-picture view across roles. **Accepted (D22).**

---

# 12. Improvement loop

```
run completes or is abandoned
  → observations recorded automatically (no human action)
  → later signals attach to the run (review rejections, PR comments)
  → recurrence is queryable
  → the user asks for an improvement (recurrence is visible, but nothing is proposed automatically)
  → an improvement run produces a branch/diff on the standard or package
  → reviewed in the Inbox like any other run output
  → merged; future runs inherit it
```

- Improvement is just another standard (`improve-standard`); creating a new standard with the user is `author-standard`. Both ship in a **base package** that every workspace extends, are started from the ⌘K assistant, and produce a diff on the workspace package for review. Nothing in core treats them specially, and a workspace can override them. **Accepted (D44).**
- Diagnosis separates **composition failures** (wrong standard, missing context or capability, visible in the spec) from **execution failures**.
- The root cause is often in the codebase, not the prose: a test, a type, a lint rule or a refactor beats another paragraph of guidance.
- **LLM analysis of runs happens only when the user asks** ("why did this go wrong?", "improve this standard"). Mechanical observations are still recorded on every run, because recording is cheap and the data cannot be recovered later. **Accepted (D26).**

---

# 13. Extensibility

Packages can contribute:

- standards, agents, skills;
- adapters (connections and their capabilities);
- Pi Durable extensions (tools, hooks, prompt sections, durable tasks, document types);
- environment definitions and runtime providers;
- triggers and memory stores;
- modules, including their UI views.

First-party modules use exactly this API. Hot-swapping extensions while runs are in flight is supported by Pi Durable: running calls finish on old code, new calls use new code.

---

# 14. Clients and UX

- **Web-first.** The server serves the web app (same origin) and a public HTTP + event-stream API with an OpenAPI contract. CLI and later mobile use the same API.
- **No TUI, no tmux.**
- **Look and feel:** dark, dense, Vercel-like. Reference mockup: workspace switcher (Personal) top-left; project selector; ⌘K search; pending count; notifications; Inbox as a three-pane list/detail with approve / request revision / reject, blocking chips, output preview and comments. (The mockup's branch selector is deferred, D27.)
- **Home is the chief-of-staff dashboard** for the active workspace; the Inbox is one click away (and is home when the module is off). **Accepted (D41).**
- **Navigation (proposed):** Home (chief of staff) · Inbox · Runs · Standards · Projects · Agents · Connections · Settings, with the assistant on ⌘K.
- **No branch chrome in v1.** Runs use Git branches inside their folders where relevant; improvement runs produce diffs on the workspace package. **Accepted (D27).**

---

# 15. Technical direction (summary; architecture to follow)

- **TypeScript throughout.** Pi Durable, pi-ai and architecture-rules are TypeScript. A portable single binary is achievable (`bun build --compile` or Node single-executable apps).
- **Runtime:** Pi Durable harness inside the server; execution environments implemented as Pi Durable execution envs backed by runners (D42) over the environment runtime port.
- **Storage:** SQLite locally; Postgres when hosted. Workspace id on every tenant-owned row.
- **Server and runners are separate processes from v1** (**Accepted (D28)**):
  - **Server** (on the always-on Mac mini): accounts, workspaces, standards packages, run records, inbox, connections and credentials, schedules, notifications, and the web app. Reached from every device over Tailscale. Single local account with a passkey or session; OIDC later.
  - **Runner** (on every machine with folders to work on, including the Mac mini): lets the user pick a local folder, runs containers with that folder mounted, and executes work there. Runners connect out to the server, so laptops never need to be reachable.
  - The user experience: open the app on any device, choose a machine and a folder, start a run, and get notified by the server when it needs you.
  - **The agent loop runs on the server** (**Accepted (D42)**). The Pi Durable harness, transcript and model calls live there; the runner is a remote execution environment that hosts the container and executes shell and file tool calls in the mounted folder. If a laptop sleeps, its runs pause at their next tool call and resume when the runner reconnects; the inbox shows "runner offline".
- **Environments:** devcontainer CLI + Docker first.
- **Repository shape:** thin apps, logic in packages, one package per external seam, feature folders in `core`, Atelier's web layout (D47).
- **Web:** React, TanStack Router (file-based, scope-shaped, loaders), vanilla-extract with a design-tokens package (D48, D49).
- **HTTP:** Hono with OpenAPI generated from zod schemas (D50).
- **Code quality:** a fresh repository with `architecture-rules` enforced from the first commit. Work's proven parts (broker, grants, adapters, package loader) are ported in one at a time, each passing the rules.

---

# 16. v1 scope (for the first user)

v1 is a web interface over Pi Durable that does real work for one user, with the full security posture (D05) and the doors below kept open.

### Doors kept open from day one

- workspaces and principals in the schema and API;
- model calls only through the Model port, with attribution;
- environments defined by devcontainer, runtimes behind a port;
- server and runners as separate processes (D28);
- modules built only on the public extension API;
- inbox items generic over source;
- review outcomes recorded against standard and person;
- an OpenAPI and event-stream contract.

### Build order (intent, not commitment)

1. Core: server and one runner, workspace, project (local folder), standard, run with chat, Docker devcontainer environment, inbox, capability approvals, web push, web app.
2. First standards in daily use: LinkedIn post, code change, technical plan.
3. Assistant (⌘K) with `author-standard`.
4. Chief of staff: memory, read-only connections, dashboard.
5. Signals: Slack and email into the inbox, ranked.
6. Organisation: invite colleagues, shared packages, workspace policy.

---

# 17. Deferred

| Deferred | Revisit when |
| --- | --- |
| Workflows (chaining standards; Atelier's request types and stations) | Several standards are routinely run in sequence by hand |
| Request (demand) as a first-class object | The chief of staff or workflows need it |
| User-visible branches and A/B process comparison | Improvement runs are routine and comparisons are wanted |
| Package registry and trust tiers | Packages are shared beyond known people |
| Hosted multi-tenant deployment | A second organisation wants to use it |
| Skills matrix and dojos | Review outcomes have accumulated |
| Team plans | A team uses the chief of staff |
| Native mobile app | Web push and a responsive web app stop being enough |
| microVM and remote runtimes | Unattended runs or client requirements demand them |
| Other environment sources (clone, copy, per-run worktree, snapshot/rollback, secret masking) | Mounted folders cause a collision, a lost change or a leaked secret, or a remote runner is added |
| Evaluation suites | Standards are stable enough to benchmark |

---

# 18. Vocabulary map

| work-os | Work | Atelier |
| --- | --- | --- |
| Standard (criteria + method + config) | Standard + Operating mode + Profile | Station's Standard (Agent + Brief + Checks) |
| Criteria (`STANDARD.md`) | Standard | Output rubric |
| Method (`METHOD.md`) | Operating mode | Brief |
| Agent | — (Pi config in Profile) | Agent |
| Run | Session | Request / station run |
| Run output (changed files, external actions, summary) | Piece | Artifact |
| Checks | — | Checks |
| Review | — | Review |
| Capability / Connection / Grant | Capability / adapter / Grant | Tool / integration / permission |
| Inbox item | Attention item | Inbox item |
| Package | Package | Package / catalog |
| Environment | Workspace + Environment | Execution Sandbox |
| Project | Project | Project (+ Filespace) |
| Workspace | — | Workspace |
| Assistant | Composer | REPL / ⌘K |
| Observation | Observation | Trace / evaluation |

Lean vocabulary (piece, station, value stream, kaizen) is deliberately absent from the product surface.

---

# 19. Heuristics for agents working on work-os

1. Keep mechanism in core and opinions in packages.
2. Do not add abstractions without a concrete requirement.
3. Treat human attention as scarce: resolve from context before asking.
4. External and irreversible actions are always safer than local ones.
5. No LLM may widen a permission ceiling.
6. Every adapter sits behind an interface; core never imports an adapter.
7. Keep composition explicit: anything that configures a run appears in its spec.
8. Record cheaply; propose selectively.
9. First-party modules use only the public extension API.
10. Prefer determinism where a person has to reason about the result.
