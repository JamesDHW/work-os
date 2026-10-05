# work-os

A personal AI backbone: you start runs against your local projects, each run follows a standard (what good looks like, which agent, which checks, what it may do), works in a container on your machine, and comes back to your inbox for answers, approvals and review.

`CONTEXT.md` explains why, `DECISIONS.md` records the decisions, `ARCHITECTURE.md` describes the system, `STYLE.md` is the code style, and `BUILD-NOTES.md` is the log of the v1 build, including what still needs checking on a real machine.

## Run it in development

Requires Node.js 24 or later, pnpm 11 and Docker Desktop. Three terminals:

```sh
pnpm install
pnpm dev:server          # API on :4311, restarts on any source change, data in ~/.work-os/dev-server
pnpm dev:web             # the web app with hot reload on http://localhost:5173 (proxies /api to :4311)
```

Give `dev:server` a model first: `ANTHROPIC_API_KEY=… pnpm dev:server`, or `WORK_OS_LMSTUDIO_URL=http://localhost:1234/v1` for LM Studio. Open http://localhost:5173 and enter the setup code from the `dev:server` output. In Settings > Machines, pair a machine, then in the third terminal:

```sh
pnpm dev:runner pair http://localhost:4311 <code>     # credentials in ~/.work-os/dev-runner
pnpm dev:runner
```

The development setup uses its own port and data folders, so it runs beside an installed work-os. One limit: only one Docker-driver runner can run per machine (they share the egress gateway container). While the installed runner is running, either stop it (`launchctl bootout gui/$(id -u)/dev.work-os.runner`) or run `WORK_OS_RUNNER_DRIVER=unsafeHost pnpm dev:runner`, which runs commands directly in the project folder with no container; use that only on scratch folders.

## Run it for real

On the Mac that keeps your projects:

```sh
pnpm install && pnpm web:build && pnpm egress:image
node apps/cli/src/main.ts install
```

`install` writes two LaunchAgents (server and runner, started at login and restarted if they exit) and two settings files, `~/.work-os/server.env` and `~/.work-os/runner.env`, readable only by you. Put your model key in `server.env` (`ANTHROPIC_API_KEY=…` or `WORK_OS_LMSTUDIO_URL=…`), then load both services with the `launchctl bootstrap` commands it printed.

Open http://localhost:4310 and enter the setup code from `~/.work-os/server.log`. Pair the machine from Settings > Machines with `node apps/cli/src/main.ts pair http://localhost:4310 <code>`; the runner service keeps retrying until it is paired. `node apps/cli/src/main.ts doctor` checks the whole setup.

- **From your phone:** run `tailscale serve --bg 4310`, set `WORK_OS_PUBLIC_ORIGIN=https://<mac>.<tailnet>.ts.net` in `server.env`, restart the server, and add a passkey on the phone from Settings > Passkeys.
- **After pulling changes:** `pnpm install && pnpm web:build`, then `launchctl kickstart -k gui/$(id -u)/dev.work-os.server` (and `dev.work-os.runner`).
- **Logs:** `~/.work-os/server.log` and `~/.work-os/runner.log`.

The server listens on 127.0.0.1 only; reach it from other devices through Tailscale, not by opening the port.

## Check it

```sh
pnpm typecheck                            # both TypeScript programs
./node_modules/.bin/architecture-check    # architecture rules and lint
pnpm test                                 # unit tests
pnpm smoke                                # server + runner + scripted model through the API
pnpm e2e                                  # the same loop through the web app (Playwright)
```

`WORK_OS_RUNNER_DRIVER=docker pnpm smoke` runs the smoke test in a real container. `docs/lint-report.md` lists every suppression and configuration override.
