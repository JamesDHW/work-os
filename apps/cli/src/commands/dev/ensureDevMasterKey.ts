import { randomBytes } from "crypto";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { CliContext } from "../../CliContext.ts";
import { SERVER_ENVIRONMENT_HEADER } from "../../cli.constants.ts";
import { updateEnvironmentFile, type EnvironmentValues } from "../../profile/environmentFile.ts";

export type DevMasterKeyInput = {
  readonly context: CliContext;
  readonly serverSettings: EnvironmentValues;
};

// macOS keeps the vault's master key in the keychain. Elsewhere there may be no secret service, so the dev profile
// keeps a generated key in its own settings file (readable only by you); dev data is throwaway, so that is enough.
export const ensureDevMasterKey = async (input: DevMasterKeyInput): Promise<WorkOsError | undefined> => {
  const hasKeychain = input.context.platform === "darwin";
  const isConfigured = input.serverSettings["WORK_OS_MASTER_KEY"] !== undefined || input.context.environment["WORK_OS_MASTER_KEY"] !== undefined;
  const isKeyAvailable = hasKeychain || isConfigured;
  if (isKeyAvailable) return undefined;

  const masterKey = randomBytes(32).toString("base64");
  return updateEnvironmentFile(input.context.paths.serverEnvironmentFile, { WORK_OS_MASTER_KEY: masterKey }, SERVER_ENVIRONMENT_HEADER);
};
