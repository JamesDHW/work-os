import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { spawn } from "child_process";
import { resolve } from "path";

import { CommandStartError } from "./runCommand.ts";

export type PairRunnerInput = {
  readonly nodePath: string;
  readonly repositoryRoot: string;
  readonly serverUrl: string;
  readonly code: string;
};

// Pairing belongs to the runner, which owns its credentials file; the CLI starts its pair command in this terminal.
export const pairRunner = async (input: PairRunnerInput): Promise<number | WorkOsError> => {
  const runnerMain = resolve(input.repositoryRoot, "apps", "runner", "src", "main.ts");
  const child = tryCatch(() => spawn(input.nodePath, [runnerMain, "pair", input.serverUrl, input.code], { stdio: "inherit" }));
  if (child instanceof WorkOsError) return new CommandStartError("Could not start the runner.", { cause: child });

  const completion = Promise.withResolvers<number | WorkOsError>();
  child.on("error", (error) => completion.resolve(new CommandStartError(`The runner failed to start: ${error.message}`, { cause: error })));
  child.on("close", (exitCode) => completion.resolve(exitCode ?? -1));
  return completion.promise;
};
