import type { CapabilityRegistry } from "@work-os/core/capabilities/CapabilityRegistry";
import type { WorkspacePackages } from "@work-os/core/catalogue/WorkspacePackages";
import type { SecretVault } from "@work-os/core/connections/SecretVault";
import type { EventBus } from "@work-os/core/events/EventBus";
import type { InboxWaiters } from "@work-os/core/inbox/InboxWaiters";
import type { PushSender } from "@work-os/core/notifications/PushSender";
import type { PairingCodes } from "@work-os/core/runners/PairingCodes";
import type { RunnerHub } from "@work-os/core/runners/RunnerHub";
import type { Logger } from "@work-os/core/system/Logger";
import type { RandomSource } from "@work-os/core/system/RandomSource";
import type { SystemClock } from "@work-os/core/system/SystemClock";

import type { Stores } from "./composeStores.ts";

export type ServerContext = {
  readonly stores: Stores;
  readonly clock: SystemClock;
  readonly randomSource: RandomSource;
  readonly logger: Logger;
  readonly eventBus: EventBus;
  readonly inboxWaiters: InboxWaiters;
  readonly runnerHub: RunnerHub;
  readonly pairingCodes: PairingCodes;
  readonly workspacePackages: WorkspacePackages;
  readonly capabilityRegistry: CapabilityRegistry;
  readonly secretVault: SecretVault;
  readonly pushSender: PushSender;
};
