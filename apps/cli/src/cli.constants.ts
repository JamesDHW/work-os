export const MINIMUM_NODE_MAJOR = 24;

export const RUNNER_CREDENTIALS_FILE = "credentials.json";

export const EGRESS_GATEWAY_IMAGE = "work-os/egress-gateway:local";

export const LAUNCH_AGENT_PREFIX = "com.work-os";

export const SYSTEMD_UNIT_PREFIX = "work-os";

export const LEGACY_LAUNCH_AGENT_LABELS = ["dev.work-os.server", "dev.work-os.runner"] as const;

export const LEGACY_SYSTEMD_UNITS = ["work-os-server.service", "work-os-runner.service"] as const;

export const SERVICE_NAMES = ["server", "runner"] as const;

export const SERVICE_DESCRIPTIONS = { server: "work-os server", runner: "work-os runner" } as const;

export const ACTION_PAST_TENSE = { start: "Started", stop: "Stopped", restart: "Restarted" } as const;

export const COMMAND_TIMEOUT_MILLISECONDS = 10_000;

export const BUILD_TIMEOUT_MILLISECONDS = 600_000;

export const ENVIRONMENT_FILE_MODE = 0o600;

export const PROFILE_FOLDER_MODE = 0o700;

export const SERVER_READY_TIMEOUT_MILLISECONDS = 30_000;

export const SERVER_POLL_INTERVAL_MILLISECONDS = 250;

export const LOG_TAIL_LINES = 50;

export const SIGN_IN_CODE_LIFETIME_MINUTES = 10;

export const DEFAULT_REPOSITORY = "https://github.com/JamesDHW/work-os.git";

export const LM_STUDIO_DEFAULT_URL = "http://localhost:1234/v1";

export const DOCTOR_MARKS = { ok: "✓", warn: "!", fail: "✗" } as const;

export const SERVER_ENVIRONMENT_HEADER = `# work-os server settings for one profile. The server loads this file when it starts.
# It can hold API keys, so it is created readable only by you (mode 600).
# Model providers and the default model are set in the app (Settings > Models), not here.
`;

export const RUNNER_ENVIRONMENT_HEADER = `# work-os runner settings for one profile. The runner loads this file when it starts.
`;

export const USAGE = `Usage: work-os <command> [--profile <name>]

Everyday
  dev [--driver docker|unsafeHost] [--no-runner]   Run the server, web app and runner for development, signed in
  setup [--role all|server|runner] [--expose tailscale|none] [--origin <url>] [--server <url> --code <code>]
                                                   Install this profile as login services and start them
  start | stop | restart [server|runner]           Control the profile's services
  status                                           What is installed, running and reachable
  logs [server|runner] [-f]                        Show a service's log
  doctor [--server <url>]                          Check Node, Docker, the gateway image, pairing and the server

Occasionally
  pair <server URL> <code>                         Pair this machine as a runner (code from Settings > Machines)
  sign-in-code                                     A one-time code to sign in when no passkey works
  update [--repo <url>] [--skip-build]             Pull the app, install dependencies, rebuild and restart
  reset [-y]                                       Stop the profile's services and delete its data
  uninstall [-y]                                   Remove the profile's services (data is kept)

Profiles live in ~/.work-os/<name>/. "default" is used unless --profile or WORK_OS_PROFILE says otherwise; dev uses "dev".`;
