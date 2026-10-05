import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { spawn } from "child_process";

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

  const chunks: string[] = [];
  const completion = Promise.withResolvers<CommandResult | WorkOsError>();
  child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk.toString("utf8")));
  child.stderr.on("data", (chunk: Buffer) => chunks.push(chunk.toString("utf8")));
  child.on("error", (error) => completion.resolve(new CommandStartError(`${command} failed: ${error.message}`, { cause: error })));
  child.on("close", (exitCode) => completion.resolve({ exitCode: exitCode ?? -1, output: chunks.join("").trim() }));
  return completion.promise;
};
