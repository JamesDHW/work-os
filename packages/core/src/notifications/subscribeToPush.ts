import type { UserId } from "@work-os/domain/identifiers/Identifiers";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { SystemClock } from "../system/SystemClock.ts";
import type { PushSubscription } from "./PushSubscription.ts";
import type { PushSubscriptionStore } from "./PushSubscriptionStore.ts";

export type SubscribeToPushInput = {
  readonly userId: UserId;
  readonly endpoint: string;
  readonly keys: PushSubscription["keys"];
};

type SubscribeToPushDependencies = {
  readonly pushSubscriptionStore: Pick<PushSubscriptionStore, "savePushSubscription">;
  readonly clock: SystemClock;
};

export type SubscribeToPush = (input: SubscribeToPushInput) => Promise<PushSubscription | WorkOsError>;

export const createSubscribeToPush = (dependencies: SubscribeToPushDependencies): SubscribeToPush => {
  return async (input) => {
    return dependencies.pushSubscriptionStore.savePushSubscription({ ...input, createdAt: dependencies.clock.now() });
  };
};
