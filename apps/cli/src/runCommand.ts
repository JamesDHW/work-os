import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { spawn } from "child_process";
import { text } from "stream/consumers";

import { COMMAND_TIMEOUT_MILLISECONDS } from "./cli.constants.ts";

export type CommandResult = {
  readonly exitCode: number;
  readonly output: string;
};

export class CommandStartError extends WorkOsError {}

// Runs a short command and collects its output. A missing executable is a CommandStartError, not an exit code.
export const runCommand = async (command: string, commandArguments: readonly string[]): Promise<CommandResult | WorkOsError> => {
  const child = tryCatch(() => spawn(command, [...commandArguments], { stdio: ["ignore", "pipe", "pipe"], timeout: COMMAND_TIMEOUT_MILLISECONDS }));
  if (child instanceof WorkOsError) return new CommandStartError(`Could not start ${command}.`, { cause: child });

  const exit = Promise.withResolvers<number | WorkOsError>();
  child.on("error", (error) => exit.resolve(new CommandStartError(`${command} failed: ${error.message}`, { cause: error })));
  child.on("close", (exitCode) => exit.resolve(exitCode ?? -1));
  const [exitCode, standardOutput, standardError] = await Promise.all([exit.promise, text(child.stdout), text(child.stderr)]);
  if (exitCode instanceof WorkOsError) return exitCode;

  return { exitCode, output: `${standardOutput}${standardError}`.trim() };
};
