import { RunnerCredentialsSchema } from "@work-os/config/RunnerCredentials";
import { tryCatch, tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { readFile } from "fs/promises";
import { join } from "path";

import { RUNNER_CREDENTIALS_FILE } from "../cli.constants.ts";
import type { DoctorCheck } from "./DoctorCheck.ts";

export const checkRunnerPairing = async (runnerDataDirectory: string): Promise<DoctorCheck> => {
  const text = await tryCatchAsync(async () => readFile(join(runnerDataDirectory, RUNNER_CREDENTIALS_FILE), "utf8"));
  if (text instanceof WorkOsError) return { name: "Runner", status: "warn", detail: "this machine is not paired. Run: work-os pair <server URL> <code>" };

  const credentials = RunnerCredentialsSchema.safeParse(tryCatch((): unknown => JSON.parse(text)));
  if (!credentials.success) return { name: "Runner", status: "fail", detail: "the credentials file is damaged. Pair this machine again." };

  return { name: "Runner", status: "ok", detail: `paired with ${credentials.data.serverUrl}` };
};
