import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { parseArgs } from "util";

export type CommandLine = {
  readonly command: string | undefined;
  readonly positionals: readonly string[];
  readonly serverUrl: string | undefined;
  readonly isServerOnly: boolean;
  readonly isRunnerOnly: boolean;
};

export const parseCommandLine = (commandLineArguments: readonly string[]): CommandLine | WorkOsError => {
  const parsed = tryCatch(() =>
    parseArgs({
      args: [...commandLineArguments],
      allowPositionals: true,
      strict: true,
      options: { server: { type: "string" }, "server-only": { type: "boolean" }, "runner-only": { type: "boolean" } },
    }),
  );
  if (parsed instanceof WorkOsError) return new InvalidRequestError(parsed.message, { cause: parsed });

  const [command, ...positionals] = parsed.positionals;
  return {
    command,
    positionals,
    serverUrl: parsed.values.server,
    isServerOnly: parsed.values["server-only"] === true,
    isRunnerOnly: parsed.values["runner-only"] === true,
  };
};
