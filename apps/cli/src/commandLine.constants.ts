export const ROLES = ["all", "server", "runner"] as const;

export const EXPOSURES = ["tailscale", "none"] as const;

export const DRIVERS = ["docker", "unsafeHost"] as const;

export const COMMAND_LINE_OPTIONS = {
  profile: { type: "string" },
  server: { type: "string" },
  role: { type: "string" },
  expose: { type: "string" },
  origin: { type: "string" },
  driver: { type: "string" },
  port: { type: "string" },
  "web-port": { type: "string" },
  repo: { type: "string" },
  "app-dir": { type: "string" },
  code: { type: "string" },
  "no-runner": { type: "boolean" },
  "no-start": { type: "boolean" },
  "skip-build": { type: "boolean" },
  follow: { type: "boolean", short: "f" },
  yes: { type: "boolean", short: "y" },
} as const;
