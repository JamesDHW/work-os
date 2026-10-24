import { WorkOsError } from "@work-os/shared/WorkOsError";
import { resolve } from "path";

import type { CliContext } from "../CliContext.ts";
import { runInTerminal } from "../runInTerminal.ts";
import { writeLine } from "../writeLine.ts";

// Pairing belongs to the runner, which owns its credentials file; the CLI starts its pair command for this profile.
export const runRunnerPair = async (context: CliContext, serverUrl: string, code: string): Promise<WorkOsError | undefined> => {
  const runnerMain = resolve(context.appDirectory, "apps", "runner", "src", "main.ts");
  const exitCode = await runInTerminal({
    command: context.nodePath,
    arguments: [runnerMain, "pair", serverUrl, code],
    cwd: context.appDirectory,
    environment: { WORK_OS_PROFILE: context.paths.profile },
  });
  if (exitCode instanceof WorkOsError) return exitCode;
  if (exitCode !== 0) return new WorkOsError("Pairing failed.");

  writeLine(`Paired this machine's runner for profile "${context.paths.profile}".`);
  return restartIfRunning(context);
};

const restartIfRunning = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const runner = await context.services.status({ profile: context.paths.profile, name: "runner" });
  const isRunning = !(runner instanceof WorkOsError) && runner.state === "running";
  if (!isRunning) return undefined;
  return context.services.start({ profile: context.paths.profile, name: "runner" });
};
