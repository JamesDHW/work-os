# work-os

A personal AI backbone: you start runs against your local projects, each run follows a standard (what good looks like, which agent, which checks, what it may do), works in a container on your machine, and comes back to your inbox for answers, approvals and review.

`CONTEXT.md` explains why, `DECISIONS.md` records the decisions, `ARCHITECTURE.md` describes the system, `STYLE.md` is the code style, and `BUILD-NOTES.md` is the log of the v1 build, including what still needs checking on a real machine.

## Run it

Everything goes through one command, `work-os`. Inside the checkout it is `pnpm work-os …`; `pnpm dev` is short for `pnpm work-os dev`. Each installation is a **profile** under `~/.work-os/<profile>/`: its two settings files (`server.env`, `runner.env`), its data and its logs. `default` is everyday use and `dev` is development, so the two never touch each other's accounts, runs or pairings.

Requires Node.js 24 or later, pnpm 11 and, for runs in containers, Docker Desktop.

### Develop on this machine

```sh
pnpm install
pnpm dev
```

One terminal runs the server (restarting on source changes), the web app with hot reload and a runner, all under the `dev` profile. It creates the account, signs the browser in automatically (`http://localhost:5173`), pairs the runner, builds the egress gateway image if Docker is running (otherwise runs use the `unsafeHost` driver, with a warning), and adds LM Studio as a model provider when one answers at `http://localhost:1234`. Put an `ANTHROPIC_API_KEY=…` line in `~/.work-os/dev/server.env` to use Anthropic instead, or add any provider in Settings > Models. `pnpm work-os reset --profile dev` throws the dev data away.

### Use it for real on one Mac

```sh
pnpm work-os setup --expose tailscale
```

`setup` builds the web app and the gateway image, writes the profile's settings, installs the server and runner as login services and starts them. With `--expose tailscale` it runs `tailscale serve` and uses the Mac's tailnet name over HTTPS as the address, which is what lets your phone sign in with a passkey. Use `--expose none` for localhost only, or `--origin https://…` for an address you manage yourself. It then prints the address and the setup code.

Open that address, enter the code and **create a passkey at that same address**: passkeys only work where they were created. Then, in Settings:

- **Models:** add a provider (LM Studio, an Anthropic key, or an OpenAI-compatible endpoint) and pick the default model.
- **Machines:** run `pnpm work-os pair` once (no arguments) on this Mac; it pairs the local runner through a one-time sign-in code. Re-running `setup` after the account exists does the same. Another machine is paired with a code from this screen, see below.

Day to day:

```sh
pnpm work-os status                 # what is installed, running and reachable
pnpm work-os logs server -f         # or runner
pnpm work-os restart                # after pulling changes (or: pnpm work-os update)
pnpm work-os doctor                 # Node, Docker, the gateway image, pairing, the server
pnpm work-os sign-in-code           # a one-time code when no passkey works (prints the address to open)
```

### Server on a Mac mini, runners on laptops

On the Mac mini:

```sh
pnpm work-os setup --role server --expose tailscale
```

On each laptop, from its own checkout, with a pairing code from Settings > Machines:

```sh
pnpm work-os setup --role runner --server https://<mini>.<tailnet>.ts.net --code <code>
```

A laptop that sleeps pauses its runs; they resume when its runner reconnects.

### The `work-os` binary

`pnpm cli:build` compiles the CLI into `dist/work-os` with Bun. The services still run on Node from a checkout, so on a machine without one `work-os update` clones the app into `~/.work-os/app` (or `WORK_OS_APP_DIR`), installs it and keeps it current; `setup` and the other commands then use that checkout.

### Where things are

| | `dev` profile | `default` profile |
| --- | --- | --- |
| Address | `http://localhost:5173` | `http://localhost:4310`, or the Tailscale address |
| Settings | `~/.work-os/dev/server.env`, `runner.env` | `~/.work-os/default/server.env`, `runner.env` |
| Data and logs | `~/.work-os/dev/` | `~/.work-os/default/` |
| Starts with | `pnpm dev` | login services (`work-os start`) |

The settings files hold only what a process needs before it can read its database: port, address, a master key on Linux (macOS uses the keychain), the runner driver. Model providers, the default model, projects and standards are all set in the app. The server listens on 127.0.0.1 only; reach it from other devices through Tailscale, not by opening the port.

## Check it

```sh
pnpm typecheck                            # both TypeScript programs
./node_modules/.bin/architecture-check    # architecture rules and lint
pnpm test                                 # unit tests
pnpm smoke                                # server + runner + scripted model through the API
pnpm e2e                                  # the same loop through the web app (Playwright)
```

`WORK_OS_RUNNER_DRIVER=docker pnpm smoke` runs the smoke test in a real container. `docs/lint-report.md` lists every suppression and configuration override.

Runs in `pnpm dev` use the same server code as the installed profile; only the profile, the auto sign-in flag and Vite differ.
