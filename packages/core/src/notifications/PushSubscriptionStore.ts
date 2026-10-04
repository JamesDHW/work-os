import type { UserId } from "@work-os/domain/identifiers/Identifiers";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { PushSubscription } from "./PushSubscription.ts";

export type PushSubscriptionStore = {
  readonly savePushSubscription: (subscription: PushSubscription) => Promise<PushSubscription | WorkOsError>;
  readonly listPushSubscriptions: (userIds: readonly UserId[]) => Promise<readonly PushSubscription[] | WorkOsError>;
  readonly deletePushSubscription: (endpoint: string) => Promise<WorkOsError | undefined>;
};
