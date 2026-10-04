import type { RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { toInboxItemId } from "@work-os/domain/identifiers/Identifiers";
import type { InboxItem, InboxOrigin, InboxPayload } from "@work-os/domain/inbox/InboxItem";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { EventBus } from "../events/EventBus.ts";
import type { NotifyBlockingItem } from "../notifications/notifyBlockingItem.ts";
import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { InboxStore } from "./InboxStore.ts";

export type OpenInboxItemInput = {
  readonly workspaceId: WorkspaceId;
  readonly runId: RunId | null;
  readonly origin: InboxOrigin;
  readonly title: string;
  readonly isBlocking: boolean;
  readonly payload: InboxPayload;
};

type OpenInboxItemDependencies = {
  readonly inboxStore: Pick<InboxStore, "createInboxItem">;
  readonly eventBus: Pick<EventBus, "publish">;
  readonly notifyBlockingItem: NotifyBlockingItem;
  readonly randomSource: Pick<RandomSource, "createId">;
  readonly clock: SystemClock;
};

export type OpenInboxItem = (input: OpenInboxItemInput) => Promise<InboxItem | WorkOsError>;

export const createOpenInboxItem = (dependencies: OpenInboxItemDependencies): OpenInboxItem => {
  return async (input) => {
    const inboxItem: InboxItem = {
      ...input,
      id: toInboxItemId(dependencies.randomSource.createId()),
      state: { status: "open" },
      createdAt: dependencies.clock.now(),
    };
    const created = await dependencies.inboxStore.createInboxItem(inboxItem);
    if (created instanceof WorkOsError) return created;

    dependencies.eventBus.publish({ kind: "inboxUpdated", workspaceId: created.workspaceId });
    if (created.isBlocking) {
      await dependencies.notifyBlockingItem(created);
    }
    return created;
  };
};
