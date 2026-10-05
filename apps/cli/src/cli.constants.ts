export const MINIMUM_NODE_MAJOR = 24;

export const RUNNER_CREDENTIALS_FILE = "credentials.json";

export const EGRESS_GATEWAY_IMAGE = "work-os/egress-gateway:local";

export const LAUNCH_AGENT_PREFIX = "dev.work-os";

export const SYSTEMD_UNIT_PREFIX = "work-os";

export const SERVICE_DESCRIPTIONS = { server: "work-os server", runner: "work-os runner" } as const;

export const COMMAND_TIMEOUT_MILLISECONDS = 10_000;

export const DOCTOR_MARKS = { ok: "✓", warn: "!", fail: "✗" } as const;

export const USAGE = `Usage:
  work-os doctor [--server <url>]                  Check this machine, Docker, the runner and the server
  work-os pair <server URL> <code>                 Pair this machine as a runner (code from Settings > Machines)
  work-os install [--server-only | --runner-only]  Write login services that start the server and the runner`;
