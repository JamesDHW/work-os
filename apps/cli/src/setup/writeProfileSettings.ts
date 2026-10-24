import type { ProfilePaths } from "@work-os/config/ProfilePaths";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import { RUNNER_ENVIRONMENT_HEADER, SERVER_ENVIRONMENT_HEADER } from "../cli.constants.ts";
import type { Driver } from "../parseCommandLine.ts";
import { updateEnvironmentFile, type EnvironmentValues } from "../profile/environmentFile.ts";

export type ProfileSettingsInput = {
  readonly paths: ProfilePaths;
  readonly publicOrigin: string;
  readonly port: number | undefined;
  readonly driver: Driver | undefined;
};

// Only what a process needs before it can read its database goes in these files; everything else is set in the app.
export const writeProfileSettings = async (input: ProfileSettingsInput): Promise<WorkOsError | undefined> => {
  const serverSettings = {
    WORK_OS_PUBLIC_ORIGIN: input.publicOrigin,
    ...(input.port === undefined ? {} : { WORK_OS_PORT: String(input.port) }),
  };
  const serverWritten = await updateEnvironmentFile(input.paths.serverEnvironmentFile, serverSettings, SERVER_ENVIRONMENT_HEADER);
  if (serverWritten !== undefined) return serverWritten;

  const runnerSettings: EnvironmentValues = input.driver === undefined ? {} : { WORK_OS_RUNNER_DRIVER: input.driver };
  return updateEnvironmentFile(input.paths.runnerEnvironmentFile, runnerSettings, RUNNER_ENVIRONMENT_HEADER);
};
