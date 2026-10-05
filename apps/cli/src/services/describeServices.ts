import { join, resolve } from "path";

import { SERVICE_DESCRIPTIONS } from "../cli.constants.ts";
import type { ServiceDefinition, ServiceName } from "./ServiceDefinition.ts";

export type DescribeServicesInput = {
  readonly nodePath: string;
  readonly repositoryRoot: string;
  readonly homeDirectory: string;
  readonly names: readonly ServiceName[];
};

export const describeServices = (input: DescribeServicesInput): readonly ServiceDefinition[] =>
  input.names.map((name) => ({
    name,
    description: SERVICE_DESCRIPTIONS[name],
    programArguments: [input.nodePath, resolve(input.repositoryRoot, "apps", name, "src", "main.ts")],
    workingDirectory: input.repositoryRoot,
    logPath: join(input.homeDirectory, ".work-os", `${name}.log`),
  }));
