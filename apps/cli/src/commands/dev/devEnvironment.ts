import { randomBytes } from "crypto";
import { DEV_SERVER_PORT, DEV_WEB_PORT } from "@work-os/config/config.constants";

import type { CliContext } from "../../CliContext.ts";
import type { Driver } from "../../parseCommandLine.ts";
import type { ProfileSettings } from "../../profile/readProfileSettings.ts";

export type DevEnvironment = {
  readonly port: number;
  readonly webPort: number;
  readonly serverUrl: string;
  readonly webUrl: string;
  readonly setupCode: string;
  readonly server: Readonly<Record<string, string>>;
  readonly runner: Readonly<Record<string, string>>;
};

export type DevEnvironmentInput = {
  readonly context: CliContext;
  readonly settings: ProfileSettings;
  readonly driver: Driver;
};

// The dev profile's settings files are honoured, then the values the dev loop depends on are set on top of them.
export const composeDevEnvironment = (input: DevEnvironmentInput): DevEnvironment => {
  const { commandLine, paths } = input.context;
  const port = commandLine.port ?? Number(input.settings.server["WORK_OS_PORT"] ?? DEV_SERVER_PORT);
  const webPort = commandLine.webPort ?? DEV_WEB_PORT;
  const setupCode = input.settings.server["WORK_OS_SETUP_CODE"] ?? `DEV-${randomBytes(3).toString("hex").toUpperCase()}`;
  return {
    port,
    webPort,
    serverUrl: `http://127.0.0.1:${port}`,
    webUrl: `http://localhost:${webPort}`,
    setupCode,
    server: {
      ...input.settings.server,
      WORK_OS_PROFILE: paths.profile,
      WORK_OS_PORT: String(port),
      WORK_OS_PUBLIC_ORIGIN: `http://localhost:${webPort}`,
      WORK_OS_SETUP_CODE: setupCode,
      WORK_OS_DEV_AUTO_SIGN_IN: "1",
    },
    runner: { ...input.settings.runner, WORK_OS_PROFILE: paths.profile, WORK_OS_RUNNER_DRIVER: input.driver },
  };
};
