import type { PushKeys } from "@work-os/core/notifications/PushKeys";
import { ExpiredPushSubscriptionError, type PushSender } from "@work-os/core/notifications/PushSender";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import webPush from "web-push";

import { EXPIRED_SUBSCRIPTION_STATUS_CODES } from "./push.constants.ts";

export type PushSenderOptions = {
  readonly keys: PushKeys;
  readonly subject: string;
};

export const createPushSender = (options: PushSenderOptions): PushSender => ({
  publicKey: options.keys.publicKey,
  sendPush: async (subscription, message) => {
    const vapidDetails = { subject: options.subject, ...options.keys };
    const target = { endpoint: subscription.endpoint, keys: subscription.keys };
    const sent = await tryCatchAsync(() => webPush.sendNotification(target, JSON.stringify(message), { vapidDetails }));
    if (!(sent instanceof WorkOsError)) return undefined;
    if (isExpiredSubscription(sent.cause)) return new ExpiredPushSubscriptionError("The push subscription has expired.", { cause: sent });

    return sent;
  },
});

const isExpiredSubscription = (failure: unknown): boolean => {
  return failure instanceof webPush.WebPushError && EXPIRED_SUBSCRIPTION_STATUS_CODES.includes(failure.statusCode);
};
