import type { InboxItem } from "@work-os/domain/inbox/InboxItem";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { Logger } from "../system/Logger.ts";
import type { WorkspaceStore } from "../workspaces/WorkspaceStore.ts";
import { ExpiredPushSubscriptionError, type PushSender } from "./PushSender.ts";
import type { PushSubscription } from "./PushSubscription.ts";
import type { PushSubscriptionStore } from "./PushSubscriptionStore.ts";

type NotifyBlockingItemDependencies = {
  readonly workspaceStore: Pick<WorkspaceStore, "listMemberIds">;
  readonly pushSubscriptionStore: Pick<PushSubscriptionStore, "listPushSubscriptions" | "deletePushSubscription">;
  readonly pushSender: Pick<PushSender, "sendPush">;
  readonly logger: Logger;
};

export type NotifyBlockingItem = (inboxItem: InboxItem) => Promise<undefined>;

export const createNotifyBlockingItem = (dependencies: NotifyBlockingItemDependencies): NotifyBlockingItem => {
  return async (inboxItem) => {
    const subscriptions = await listWorkspaceSubscriptions(dependencies, inboxItem);
    if (subscriptions instanceof WorkOsError) {
      dependencies.logger.warn("Could not list push subscriptions.", { message: subscriptions.message });
      return undefined;
    }

    const message = { title: "work-os needs you", body: inboxItem.title, url: `/w/${inboxItem.workspaceId}/inbox` };
    await Promise.all(subscriptions.map((subscription) => deliverPush(dependencies, subscription, message)));
    return undefined;
  };
};

const listWorkspaceSubscriptions = async (
  dependencies: NotifyBlockingItemDependencies,
  inboxItem: InboxItem,
): Promise<readonly PushSubscription[] | WorkOsError> => {
  const memberIds = await dependencies.workspaceStore.listMemberIds(inboxItem.workspaceId);
  if (memberIds instanceof WorkOsError) return memberIds;

  return dependencies.pushSubscriptionStore.listPushSubscriptions(memberIds);
};

const deliverPush = async (
  dependencies: NotifyBlockingItemDependencies,
  subscription: PushSubscription,
  message: Parameters<PushSender["sendPush"]>[1],
): Promise<undefined> => {
  const sent = await dependencies.pushSender.sendPush(subscription, message);
  if (sent instanceof ExpiredPushSubscriptionError) {
    await dependencies.pushSubscriptionStore.deletePushSubscription(subscription.endpoint);
    return undefined;
  }
  if (sent instanceof WorkOsError) {
    dependencies.logger.warn("Push delivery failed.", { message: sent.message });
  }
  return undefined;
};
