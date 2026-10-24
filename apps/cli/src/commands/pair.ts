import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { CliContext } from "../CliContext.ts";
import { pairLocalRunner } from "./pairLocalRunner.ts";
import { runRunnerPair } from "./runRunnerPair.ts";

export const runPair = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const [serverUrl, code] = context.commandLine.positionals;
  const hasArguments = serverUrl !== undefined && code !== undefined;
  if (hasArguments) return runRunnerPair(context, serverUrl, code);

  const isLocal = serverUrl === undefined && code === undefined;
  if (!isLocal) return new WorkOsError("Usage: work-os pair <server URL> <code>, or work-os pair on the server's own machine");
  return pairLocalRunner(context);
};
