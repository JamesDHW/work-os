import type { ProfilePaths } from "@work-os/config/ProfilePaths";

import type { CommandLine } from "./parseCommandLine.ts";
import type { ServiceManager } from "./services/ServiceManager.ts";

/** Everything a command needs about this machine, the chosen profile and the checkout the services run from. */
export type CliContext = {
  readonly commandLine: CommandLine;
  readonly paths: ProfilePaths;
  readonly appDirectory: string;
  readonly homeDirectory: string;
  readonly nodePath: string;
  readonly searchPath: string;
  readonly platform: string;
  readonly userId: number | undefined;
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly services: ServiceManager;
};
