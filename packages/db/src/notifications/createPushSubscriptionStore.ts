import type { PushSubscription } from "@work-os/core/notifications/PushSubscription";
import type { PushSubscriptionStore } from "@work-os/core/notifications/PushSubscriptionStore";
import { toUserId, type UserId } from "@work-os/domain/identifiers/Identifiers";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { eq, inArray } from "drizzle-orm";

import { pushSubscriptions } from "../tables/pushSubscriptions.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;

export const createPushSubscriptionStore = (database: WorkOsDatabase): PushSubscriptionStore => {
  const savePushSubscription = async (subscription: PushSubscription): Promise<PushSubscription | WorkOsError> => {
    const row = { endpoint: subscription.endpoint, userId: subscription.userId, ...subscription.keys, createdAt: subscription.createdAt };
    const saved = await tryCatchAsync(() =>
      database.insert(pushSubscriptions).values(row).onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: row }),
    );
    if (saved instanceof WorkOsError) return saved;

    return subscription;
  };

  const listPushSubscriptions = async (userIds: readonly UserId[]): Promise<readonly PushSubscription[] | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(pushSubscriptions).where(inArray(pushSubscriptions.userId, [...userIds])));
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toPushSubscription);
  };

  const deletePushSubscription = async (endpoint: string): Promise<WorkOsError | undefined> => {
    const deleted = await tryCatchAsync(() => database.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)));
    return deleted instanceof WorkOsError ? deleted : undefined;
  };

  return { savePushSubscription, listPushSubscriptions, deletePushSubscription };
};

const toPushSubscription = (row: PushSubscriptionRow): PushSubscription => ({
  userId: toUserId(row.userId),
  endpoint: row.endpoint,
  keys: { p256dh: row.p256dh, auth: row.auth },
  createdAt: row.createdAt,
});
