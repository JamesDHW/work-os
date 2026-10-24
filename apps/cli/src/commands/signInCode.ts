import { randomBytes } from "crypto";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { stat, writeFile } from "fs/promises";

import type { ProfilePaths } from "@work-os/config/ProfilePaths";

import type { CliContext } from "../CliContext.ts";
import { ENVIRONMENT_FILE_MODE, SIGN_IN_CODE_LIFETIME_MINUTES } from "../cli.constants.ts";
import { readProfileSettings } from "../profile/readProfileSettings.ts";
import { writeLine } from "../writeLine.ts";

// Whoever can run commands as this user on the server's machine can already read its database, so a file the
// server reads back is the same level of trust as the setup code. The code works once and expires.
export const issueSignInCode = async (paths: ProfilePaths): Promise<string | WorkOsError> => {
  const dataDirectory = await tryCatchAsync(() => stat(paths.serverDataDirectory));
  if (dataDirectory instanceof WorkOsError) return new WorkOsError(`The server of profile "${paths.profile}" has not run yet (${paths.serverDataDirectory} is missing).`);

  const code = `${randomBytes(2).toString("hex").toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
  const expiresAt = new Date(Date.now() + SIGN_IN_CODE_LIFETIME_MINUTES * 60_000).toISOString();
  const written = await tryCatchAsync(() => writeFile(paths.signInCodeFile, JSON.stringify({ code, expiresAt }), { mode: ENVIRONMENT_FILE_MODE }));
  return written instanceof WorkOsError ? written : code;
};

export const runSignInCode = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const settings = await readProfileSettings(context.paths);
  if (settings instanceof WorkOsError) return settings;

  const code = await issueSignInCode(context.paths);
  if (code instanceof WorkOsError) return code;

  writeLine(`Open ${settings.publicOrigin}, choose "Use a sign-in code" and enter: ${code}`);
  writeLine(`It works once and expires in ${SIGN_IN_CODE_LIFETIME_MINUTES} minutes. Create a passkey straight after signing in.`);
  return undefined;
};
