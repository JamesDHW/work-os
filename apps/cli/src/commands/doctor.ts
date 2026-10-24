import { WorkOsError } from "@work-os/shared/WorkOsError";
import process from "process";

import type { CliContext } from "../CliContext.ts";
import { runDoctor } from "../doctor/runDoctor.ts";
import { readProfileSettings } from "../profile/readProfileSettings.ts";

export const runDoctorCommand = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const settings = await readProfileSettings(context.paths);
  if (settings instanceof WorkOsError) return settings;

  const serverUrl = context.commandLine.serverUrl ?? settings.localUrl;
  const isHealthy = await runDoctor({ nodeVersion: process.versions.node, serverUrl, runnerDataDirectory: context.paths.runnerDataDirectory, profile: context.paths.profile });
  if (!isHealthy) return new WorkOsError("Some checks failed.");
  return undefined;
};
