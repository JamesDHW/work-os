import { DEFAULT_SERVER_PORT, DEV_PROFILE, DEV_SERVER_PORT } from "@work-os/config/config.constants";
import type { ProfilePaths } from "@work-os/config/ProfilePaths";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { readEnvironmentFile, type EnvironmentValues } from "./environmentFile.ts";

export type ProfileSettings = {
  readonly server: EnvironmentValues;
  readonly runner: EnvironmentValues;
  readonly port: number;
  /** Where the server listens on this machine, whatever address people open it at. */
  readonly localUrl: string;
  readonly publicOrigin: string;
};

export const readProfileSettings = async (paths: ProfilePaths): Promise<ProfileSettings | WorkOsError> => {
  const server = await readEnvironmentFile(paths.serverEnvironmentFile);
  if (server instanceof WorkOsError) return server;

  const runner = await readEnvironmentFile(paths.runnerEnvironmentFile);
  if (runner instanceof WorkOsError) return runner;

  const port = Number(server["WORK_OS_PORT"] ?? defaultPort(paths.profile));
  const localUrl = `http://127.0.0.1:${port}`;
  return { server, runner, port, localUrl, publicOrigin: server["WORK_OS_PUBLIC_ORIGIN"] ?? `http://localhost:${port}` };
};

export const defaultPort = (profile: string): number => (profile === DEV_PROFILE ? DEV_SERVER_PORT : DEFAULT_SERVER_PORT);
