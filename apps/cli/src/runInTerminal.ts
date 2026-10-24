import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { spawn } from "child_process";

import { BUILD_TIMEOUT_MILLISECONDS } from "./cli.constants.ts";
import { CommandStartError } from "./runCommand.ts";

export type TerminalCommand = {
  readonly command: string;
  readonly arguments: readonly string[];
  readonly cwd?: string;
  readonly environment?: Readonly<Record<string, string | undefined>>;
};

// Runs a long command in this terminal, showing its output as it happens, and reports its exit code.
export const runInTerminal = async (terminalCommand: TerminalCommand): Promise<number | WorkOsError> => {
  const child = tryCatch(() =>
    spawn(terminalCommand.command, [...terminalCommand.arguments], {
      stdio: "inherit",
      timeout: BUILD_TIMEOUT_MILLISECONDS,
      ...(terminalCommand.cwd === undefined ? {} : { cwd: terminalCommand.cwd }),
      ...(terminalCommand.environment === undefined ? {} : { env: { ...process.env, ...terminalCommand.environment } }),
    }),
  );
  if (child instanceof WorkOsError) return new CommandStartError(`Could not start ${terminalCommand.command}.`, { cause: child });

  const completion = Promise.withResolvers<number | WorkOsError>();
  child.on("error", (error) => completion.resolve(new CommandStartError(`${terminalCommand.command} failed: ${error.message}`, { cause: error })));
  child.on("close", (exitCode) => completion.resolve(exitCode ?? -1));
  return completion.promise;
};
