import { join, resolve } from "path";

import { SERVICE_DESCRIPTIONS } from "../cli.constants.ts";
import { renderEnvironmentTemplate } from "./renderEnvironmentTemplate.ts";
import type { ServiceDefinition, ServiceName } from "./ServiceDefinition.ts";

export type DescribeServicesInput = {
  readonly nodePath: string;
  readonly repositoryRoot: string;
  readonly homeDirectory: string;
  readonly searchPath: string;
  readonly names: readonly ServiceName[];
};

// Each service runs Node on the app's entry point and loads ~/.work-os/<name>.env first when it exists.
// Services get the PATH of the shell that installed them: login services otherwise start with a bare PATH that misses
// docker, git and the node that the devcontainer CLI's launcher needs.
export const describeServices = (input: DescribeServicesInput): readonly ServiceDefinition[] =>
  input.names.map((name) => {
    const environmentFile = join(input.homeDirectory, ".work-os", `${name}.env`);
    return {
      name,
      description: SERVICE_DESCRIPTIONS[name],
      programArguments: [input.nodePath, `--env-file-if-exists=${environmentFile}`, resolve(input.repositoryRoot, "apps", name, "src", "main.ts")],
      workingDirectory: input.repositoryRoot,
      searchPath: input.searchPath,
      logPath: join(input.homeDirectory, ".work-os", `${name}.log`),
      environmentFile,
      environmentTemplate: renderEnvironmentTemplate(name, input.repositoryRoot),
    };
  });
