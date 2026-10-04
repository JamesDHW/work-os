import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { PushSubscription } from "./PushSubscription.ts";

export class ExpiredPushSubscriptionError extends WorkOsError {}

export type PushMessage = {
  readonly title: string;
  readonly body: string;
  readonly url: string;
};

export type PushSender = {
  readonly publicKey: string;
  readonly sendPush: (subscription: PushSubscription, message: PushMessage) => Promise<WorkOsError | undefined>;
};
