import type { RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { EventBus } from "../events/EventBus.ts";
import type { InboxStore } from "./InboxStore.ts";
import type { InboxWaiters } from "./InboxWaiters.ts";

export type WithdrawRunItemsInput = {
  readonly workspaceId: WorkspaceId;
  readonly runId: RunId;
};

type WithdrawRunItemsDependencies = {
  readonly inboxStore: Pick<InboxStore, "listOpenRunItems" | "closeInboxItem">;
  readonly inboxWaiters: Pick<InboxWaiters, "settle">;
  readonly eventBus: Pick<EventBus, "publish">;
};

export type WithdrawRunItems = (input: WithdrawRunItemsInput) => Promise<WorkOsError | undefined>;

export const createWithdrawRunItems = (dependencies: WithdrawRunItemsDependencies): WithdrawRunItems => {
  return async (input) => {
    const openItems = await dependencies.inboxStore.listOpenRunItems(input.runId);
    if (openItems instanceof WorkOsError) return openItems;

    const withdrawn = await Promise.all(
      openItems.map((inboxItem) => dependencies.inboxStore.closeInboxItem(inboxItem.id, { status: "withdrawn" })),
    );
    for (const inboxItem of withdrawn) {
      settleWithdrawn(dependencies.inboxWaiters, inboxItem);
    }
    dependencies.eventBus.publish({ kind: "inboxUpdated", workspaceId: input.workspaceId });
    return withdrawn.find((inboxItem): inboxItem is WorkOsError => inboxItem instanceof WorkOsError);
  };
};

const settleWithdrawn = (inboxWaiters: Pick<InboxWaiters, "settle">, inboxItem: Awaited<ReturnType<InboxStore["closeInboxItem"]>>): void => {
  if (inboxItem instanceof WorkOsError) return;
  inboxWaiters.settle(inboxItem.id, inboxItem.state);
};
