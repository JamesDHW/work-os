import type { ServerConfig } from "@work-os/config/ServerConfig";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ServerContext } from "./ServerContext.ts";

export type SetupAnnouncement = {
  readonly config: ServerConfig;
  readonly context: ServerContext;
};

export const announceSetupCode = async (announcement: SetupAnnouncement): Promise<string> => {
  const { config, context } = announcement;
  const setupCode = config.setupCode ?? context.randomSource.createPairingCode();
  const userCount = await context.stores.userStore.countUsers();
  const needsSetup = !(userCount instanceof WorkOsError) && userCount === 0;
  if (needsSetup) {
    context.logger.info("No account yet. Open work-os and enter this setup code.", { setupCode, url: config.publicOrigin });
  }
  return setupCode;
};
