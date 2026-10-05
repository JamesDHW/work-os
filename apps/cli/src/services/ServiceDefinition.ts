export type ServiceName = "server" | "runner";

export type ServiceDefinition = {
  readonly name: ServiceName;
  readonly description: string;
  readonly programArguments: readonly string[];
  readonly workingDirectory: string;
  readonly logPath: string;
};
