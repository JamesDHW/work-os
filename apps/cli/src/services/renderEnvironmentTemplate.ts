import type { ServiceName } from "./ServiceDefinition.ts";

// The starting settings file for a login service. Node loads it with --env-file-if-exists, so nothing else parses it.
export const renderEnvironmentTemplate = (name: ServiceName, repositoryRoot: string): string => {
  switch (name) {
    case "server":
      return [
        "# work-os server settings. The login service loads this file when it starts.",
        "# It can hold API keys, so it is created readable only by you (mode 600).",
        "",
        "# The built web app (pnpm web:build).",
        `WORK_OS_WEB_DIST=${repositoryRoot}/apps/web/dist`,
        "",
        "# The address you open work-os at. Passkeys need it to match anywhere but http://localhost:4310.",
        "# WORK_OS_PUBLIC_ORIGIN=https://<machine>.<tailnet>.ts.net",
        "",
        "# Model access: a provider key, a local LM Studio server, or both.",
        "# ANTHROPIC_API_KEY=",
        "# WORK_OS_LMSTUDIO_URL=http://localhost:1234/v1",
        "",
      ].join("\n");
    case "runner":
      return [
        "# work-os runner settings. The login service loads this file when it starts.",
        "",
        "# docker (the default) runs each run in a dev container; unsafeHost runs commands directly on this machine.",
        "# WORK_OS_RUNNER_DRIVER=docker",
        "",
      ].join("\n");
    default:
      return name satisfies never;
  }
};
