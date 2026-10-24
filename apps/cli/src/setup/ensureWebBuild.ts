import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { stat } from "fs/promises";
import { join } from "path";

import { runInTerminal } from "../runInTerminal.ts";
import { writeLine } from "../writeLine.ts";

export type WebBuildInput = {
  readonly appDirectory: string;
  readonly isSkipped: boolean;
};

// The server serves apps/web/dist; building it is the one slow step, so it runs in this terminal with its output shown.
export const ensureWebBuild = async (input: WebBuildInput): Promise<WorkOsError | undefined> => {
  const built = await tryCatchAsync(() => stat(join(input.appDirectory, "apps", "web", "dist", "index.html")));
  const isBuilt = !(built instanceof WorkOsError);
  const canSkip = input.isSkipped && isBuilt;
  if (canSkip) return undefined;
  if (input.isSkipped) return new WorkOsError("The web app has not been built yet, so --skip-build cannot be used.");

  writeLine("Building the web app…");
  const exitCode = await runInTerminal({ command: "pnpm", arguments: ["--filter", "@work-os/web", "build"], cwd: input.appDirectory });
  if (exitCode instanceof WorkOsError) return exitCode;
  if (exitCode !== 0) return new WorkOsError(`The web build failed (exit ${exitCode}).`);
  return undefined;
};
