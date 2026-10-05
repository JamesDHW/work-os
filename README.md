# work-os

A personal AI backbone: you start runs against your local projects, each run follows a standard (what good looks like, which agent, which checks, what it may do), works in a container on your machine, and comes back to your inbox for answers, approvals and review.

`CONTEXT.md` explains why, `DECISIONS.md` records the decisions, `ARCHITECTURE.md` describes the system, `STYLE.md` is the code style, and `BUILD-NOTES.md` is the log of the v1 build, including what still needs checking on a real machine.

## Run it

Requires Node.js 24 or later, pnpm 11 and Docker Desktop.

```sh
pnpm install
pnpm web:build
pnpm egress:image                         # once: the egress gateway container

WORK_OS_WEB_DIST=apps/web/dist ANTHROPIC_API_KEY=… node apps/server/src/main.ts
```

Open http://localhost:4310 and enter the setup code from the server log. Then, in Settings > Machines, pair this machine and start the runner in a second terminal:

```sh
node apps/cli/src/main.ts pair http://localhost:4310 <code>
node apps/runner/src/main.ts
```

Add a folder as a project, start a run, and answer it from the inbox. `node apps/cli/src/main.ts doctor` checks the setup; `node apps/cli/src/main.ts install` writes login services for the server and the runner.

For a local model, start LM Studio's server and set `WORK_OS_LMSTUDIO_URL=http://localhost:1234/v1`, then set `models.default: lmstudio/<model id>` in `~/.work-os/server/workspaces/<id>/workos.yaml`.

## Check it

```sh
pnpm typecheck                            # both TypeScript programs
./node_modules/.bin/architecture-check    # architecture rules and lint
pnpm test                                 # unit tests
pnpm smoke                                # server + runner + scripted model through the API
pnpm e2e                                  # the same loop through the web app (Playwright)
```

`WORK_OS_RUNNER_DRIVER=docker pnpm smoke` runs the smoke test in a real container. `docs/lint-report.md` lists every suppression and configuration override.
