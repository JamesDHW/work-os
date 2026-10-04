export type ConfigSource = {
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly homeDirectory: string;
};
