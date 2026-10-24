export type ServiceName = "server" | "runner";

export type ServiceDefinition = {
  readonly name: ServiceName;
  readonly profile: string;
  readonly description: string;
  readonly programArguments: readonly string[];
  readonly workingDirectory: string;
  /** Variables the service starts with; its settings file is loaded by Node on top of them. */
  readonly environment: Readonly<Record<string, string>>;
  readonly logPath: string;
  readonly environmentFile: string;
};
