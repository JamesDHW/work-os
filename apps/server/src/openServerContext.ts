import type { ServerConfig } from "@work-os/config/ServerConfig";
import { createEventBus } from "@work-os/core/events/createEventBus";
import { createInboxWaiters } from "@work-os/core/inbox/createInboxWaiters";
import { createEnsurePushKeys } from "@work-os/core/notifications/ensurePushKeys";
import { createPairingCodes } from "@work-os/core/runners/createPairingCodes";
import { createRunnerHub } from "@work-os/core/runners/createRunnerHub";
import type { Logger } from "@work-os/core/system/Logger";
import { openDatabase } from "@work-os/db/openDatabase";
import { createWorkspacePackages } from "@work-os/package-store/createWorkspacePackages";
import { createCapabilityRegistry } from "@work-os/package-store/extensions/createCapabilityRegistry";
import { createPushSender } from "@work-os/push/createPushSender";
import { generatePushKeys } from "@work-os/push/generatePushKeys";
import { createRandomSource } from "@work-os/secrets/createRandomSource";
import { createSecretVault } from "@work-os/secrets/createSecretVault";
import { readMasterKey } from "@work-os/secrets/readMasterKey";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { mkdir } from "fs/promises";

import { composeStores } from "./composeStores.ts";
import { parsePushKeys } from "./parsePushKeys.ts";
import type { ServerContext } from "./ServerContext.ts";
import { DEFAULT_EXTENDS, PUSH_SUBJECT_FALLBACK } from "./server.constants.ts";

export type OpenedServerContext = {
  readonly context: ServerContext;
  readonly close: () => WorkOsError | undefined;
};

export const openServerContext = async (config: ServerConfig, logger: Logger): Promise<OpenedServerContext | WorkOsError> => {
  const workspacesDirectory = `${config.dataDirectory}/workspaces`;
  const created = await tryCatchAsync(() => mkdir(workspacesDirectory, { recursive: true }));
  if (created instanceof WorkOsError) return created;

  const opened = await openDatabase(`${config.dataDirectory}/work-os.sqlite`);
  if (opened instanceof WorkOsError) return opened;

  const masterKey = readMasterKey(config.masterKey === null ? { kind: "keychain" } : { kind: "environment", encodedKey: config.masterKey });
  if (masterKey instanceof WorkOsError) return masterKey;

  const stores = composeStores(opened.database);
  const secretVault = createSecretVault(masterKey);
  const pushKeys = await createEnsurePushKeys({ settingsStore: stores.settingsStore, secretVault, generatePushKeys, parsePushKeys })();
  if (pushKeys instanceof WorkOsError) return pushKeys;

  const randomSource = createRandomSource();
  const clock = { now: () => new Date().toISOString() };
  const eventBus = createEventBus();
  const bundledDirectory = config.bundledPackagesDirectory;
  const context: ServerContext = {
    stores,
    clock,
    randomSource,
    logger,
    eventBus,
    inboxWaiters: createInboxWaiters(),
    runnerHub: createRunnerHub({ randomSource }),
    pairingCodes: createPairingCodes({ randomSource, clock }),
    workspacePackages: createWorkspacePackages({ workspacesDirectory, bundledDirectory, defaultModel: config.defaultModel, defaultExtends: DEFAULT_EXTENDS }),
    capabilityRegistry: createCapabilityRegistry({
      workspacesDirectory,
      bundledDirectory,
      onPackageChanged: (workspaceId) => eventBus.publish({ kind: "catalogueUpdated", workspaceId }),
    }),
    secretVault,
    pushSender: createPushSender({ keys: pushKeys, subject: pushSubject(config.publicOrigin) }),
  };
  return { context, close: opened.close };
};

const pushSubject = (publicOrigin: string): string => (publicOrigin.startsWith("https://") ? publicOrigin : PUSH_SUBJECT_FALLBACK);
