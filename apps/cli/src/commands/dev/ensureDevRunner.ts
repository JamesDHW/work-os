import { RunnerCredentialsSchema } from "@work-os/config/RunnerCredentials";
import { tryCatch, tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { readFile } from "fs/promises";
import { join, resolve } from "path";

import type { CliContext } from "../../CliContext.ts";
import { RUNNER_CREDENTIALS_FILE } from "../../cli.constants.ts";
import { runInTerminal } from "../../runInTerminal.ts";
import { writeLine } from "../../writeLine.ts";
import { DEV_RUNNER_NAME } from "./dev.constants.ts";
import { devClient, type DevSession } from "./devSession.ts";

export type DevRunnerInput = {
  readonly context: CliContext;
  readonly session: DevSession;
  readonly workspaceId: string;
};

// The dev runner pairs itself: the dev loop asks the server for a pairing code and hands it to the runner's pair command.
export const ensureDevRunnerPairing = async (input: DevRunnerInput): Promise<WorkOsError | undefined> => {
  const isPaired = await isPairedWith(input.context.paths.runnerDataDirectory, input.session.serverUrl);
  if (isPaired) return undefined;

  const client = devClient(input.session);
  const issued = await tryCatchAsync(async () => client.POST("/api/w/{workspaceId}/runners/pairing-codes", { params: { path: { workspaceId: input.workspaceId } } }));
  if (issued instanceof WorkOsError) return issued;
  if (issued.data === undefined) return new WorkOsError(`Could not create a pairing code (${issued.response.status}).`);

  writeLine("Pairing this machine's dev runner…");
  const runnerMain = resolve(input.context.appDirectory, "apps", "runner", "src", "main.ts");
  const exitCode = await runInTerminal({
    command: input.context.nodePath,
    arguments: [runnerMain, "pair", input.session.serverUrl, issued.data.code],
    cwd: input.context.appDirectory,
    environment: { WORK_OS_PROFILE: input.context.paths.profile, WORK_OS_RUNNER_NAME: DEV_RUNNER_NAME },
  });
  if (exitCode instanceof WorkOsError) return exitCode;
  if (exitCode !== 0) return new WorkOsError("Pairing the dev runner failed.");
  return undefined;
};

const isPairedWith = async (runnerDataDirectory: string, serverUrl: string): Promise<boolean> => {
  const text = await tryCatchAsync(() => readFile(join(runnerDataDirectory, RUNNER_CREDENTIALS_FILE), "utf8"));
  if (text instanceof WorkOsError) return false;

  const credentials = RunnerCredentialsSchema.safeParse(tryCatch((): unknown => JSON.parse(text)));
  return credentials.success && credentials.data.serverUrl === serverUrl;
};
