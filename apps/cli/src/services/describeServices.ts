import type { ProfilePaths } from "@work-os/config/ProfilePaths";
import { resolve } from "path";

import { SERVICE_DESCRIPTIONS } from "../cli.constants.ts";
import type { ServiceDefinition, ServiceName } from "./ServiceDefinition.ts";

export type DescribeServicesInput = {
  readonly nodePath: string;
  readonly appDirectory: string;
  readonly paths: ProfilePaths;
  readonly searchPath: string;
  readonly names: readonly ServiceName[];
};

// Each service runs Node on the app's entry point for one profile and loads that profile's settings file first.
// Services get the PATH of the shell that installed them: login services otherwise start with a bare PATH that misses
// docker, git and the node that the devcontainer CLI's launcher needs.
export const describeServices = (input: DescribeServicesInput): readonly ServiceDefinition[] =>
  input.names.map((name) => {
    const environmentFile = name === "server" ? input.paths.serverEnvironmentFile : input.paths.runnerEnvironmentFile;
    return {
      name,
      profile: input.paths.profile,
      description: `${SERVICE_DESCRIPTIONS[name]} (${input.paths.profile})`,
      programArguments: [input.nodePath, `--env-file-if-exists=${environmentFile}`, resolve(input.appDirectory, "apps", name, "src", "main.ts")],
      workingDirectory: input.appDirectory,
      environment: { PATH: input.searchPath, WORK_OS_PROFILE: input.paths.profile },
      logPath: name === "server" ? input.paths.serverLogFile : input.paths.runnerLogFile,
      environmentFile,
    };
  });
