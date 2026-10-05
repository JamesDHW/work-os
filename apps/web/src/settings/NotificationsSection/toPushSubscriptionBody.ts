import type { PushSubscriptionBody } from "../../api/apiTypes.ts";

export const toPushSubscriptionBody = (subscription: PushSubscriptionJSON): PushSubscriptionBody | null => {
  const { endpoint, keys } = subscription;
  const p256dh = keys?.["p256dh"];
  const auth = keys?.["auth"];
  const isComplete = endpoint !== undefined && p256dh !== undefined && auth !== undefined;
  if (!isComplete) return null;

  return { endpoint, keys: { p256dh, auth } };
};
