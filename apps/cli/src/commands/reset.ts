import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { rm } from "fs/promises";

import type { CliContext } from "../CliContext.ts";
import { SERVICE_NAMES } from "../cli.constants.ts";
import { confirm } from "../confirm.ts";
import { writeLine } from "../writeLine.ts";

// Stops the profile and deletes everything it stored: account, passkeys, runs, pairing. Settings files are kept.
export const runReset = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const { paths } = context;
  const question = `Delete all data of profile "${paths.profile}" (${paths.serverDataDirectory}, ${paths.runnerDataDirectory})? This removes the account, passkeys, runs and pairing.`;
  const confirmed = await ensureConfirmed(context, question, "Reset cancelled.");
  if (confirmed instanceof WorkOsError) return confirmed;

  const stopped = await stopAll(context);
  if (stopped instanceof WorkOsError) return stopped;

  for (const path of [paths.serverDataDirectory, paths.runnerDataDirectory, paths.serverLogFile, paths.runnerLogFile]) {
    const removed = await tryCatchAsync(() => rm(path, { recursive: true, force: true }));
    if (removed instanceof WorkOsError) return removed;
  }
  writeLine(`Deleted the data of profile "${paths.profile}". Start again with: work-os setup --profile ${paths.profile} (or work-os dev).`);
  return undefined;
};

export const runUninstall = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const { paths } = context;
  const confirmed = await ensureConfirmed(context, `Remove the login services of profile "${paths.profile}"? Its data stays in ${paths.root}.`, "Uninstall cancelled.");
  if (confirmed instanceof WorkOsError) return confirmed;

  for (const name of SERVICE_NAMES) {
    const removed = await context.services.uninstall({ profile: paths.profile, name });
    if (removed instanceof WorkOsError) return removed;
  }
  writeLine(`Removed the services of profile "${paths.profile}".`);
  return undefined;
};

const ensureConfirmed = async (context: CliContext, question: string, cancelled: string): Promise<WorkOsError | undefined> => {
  if (context.commandLine.isConfirmed) return undefined;

  const isConfirmed = await confirm(question);
  if (!isConfirmed) return new WorkOsError(cancelled);
  return undefined;
};

const stopAll = async (context: CliContext): Promise<WorkOsError | undefined> => {
  for (const name of SERVICE_NAMES) {
    const stopped = await context.services.stop({ profile: context.paths.profile, name });
    if (stopped instanceof WorkOsError) return stopped;
  }
  return undefined;
};
