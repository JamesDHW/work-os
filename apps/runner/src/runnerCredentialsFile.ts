import { RunnerCredentialsSchema, type RunnerCredentials } from "@work-os/config/RunnerCredentials";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatch, tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { chmod, mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

import { CREDENTIALS_FILE, CREDENTIALS_FILE_MODE } from "./runner.constants.ts";

export const writeRunnerCredentials = async (dataDirectory: string, credentials: RunnerCredentials): Promise<WorkOsError | undefined> => {
  const path = join(dataDirectory, CREDENTIALS_FILE);
  const written = await tryCatchAsync(async () => {
    await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
    await writeFile(path, JSON.stringify(credentials, null, 2), { mode: CREDENTIALS_FILE_MODE });
    await chmod(path, CREDENTIALS_FILE_MODE);
  });
  return written instanceof WorkOsError ? written : undefined;
};

export const readRunnerCredentials = async (dataDirectory: string): Promise<RunnerCredentials | WorkOsError> => {
  const text = await tryCatchAsync(() => readFile(join(dataDirectory, CREDENTIALS_FILE), "utf8"));
  if (text instanceof WorkOsError) return new InvalidRequestError("This machine is not paired yet. Run: work-os-runner pair <server URL> <code>", { cause: text });

  const parsed = RunnerCredentialsSchema.safeParse(tryCatch((): unknown => JSON.parse(text)));
  if (!parsed.success) return new InvalidRequestError("The runner credentials file is damaged. Pair this machine again.");
  return parsed.data;
};
