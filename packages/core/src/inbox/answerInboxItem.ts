import type { InboxItemId, UserId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { InboxAnswer } from "@work-os/domain/inbox/InboxAnswer";
import type { InboxItem } from "@work-os/domain/inbox/InboxItem";
import { validateInboxAnswer } from "@work-os/domain/inbox/validateInboxAnswer";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { EventBus } from "../events/EventBus.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { InboxStore } from "./InboxStore.ts";
import type { InboxWaiters } from "./InboxWaiters.ts";

export type AnswerInboxItemInput = {
  readonly workspaceId: WorkspaceId;
  readonly inboxItemId: InboxItemId;
  readonly userId: UserId;
  readonly answer: InboxAnswer;
};

export type RouteInboxAnswer = (inboxItem: InboxItem, answer: InboxAnswer) => Promise<WorkOsError | undefined>;

type AnswerInboxItemDependencies = {
  readonly inboxStore: Pick<InboxStore, "findInboxItem" | "closeInboxItem">;
  readonly inboxWaiters: Pick<InboxWaiters, "settle">;
  readonly eventBus: Pick<EventBus, "publish">;
  readonly clock: SystemClock;
  readonly routeInboxAnswer: RouteInboxAnswer;
};

export type AnswerInboxItem = (input: AnswerInboxItemInput) => Promise<InboxItem | WorkOsError>;

export const createAnswerInboxItem = (dependencies: AnswerInboxItemDependencies): AnswerInboxItem => {
  return async (input) => {
    const inboxItem = await dependencies.inboxStore.findInboxItem(input.workspaceId, input.inboxItemId);
    if (inboxItem instanceof WorkOsError) return inboxItem;

    const answer = validateInboxAnswer(inboxItem, input.answer);
    if (answer instanceof WorkOsError) return answer;

    const answeredState = { status: "answered", answer, answeredBy: input.userId, answeredAt: dependencies.clock.now() } as const;
    const answered = await dependencies.inboxStore.closeInboxItem(inboxItem.id, answeredState);
    if (answered instanceof WorkOsError) return answered;

    dependencies.inboxWaiters.settle(answered.id, answered.state);
    dependencies.eventBus.publish({ kind: "inboxUpdated", workspaceId: answered.workspaceId });
    const routed = await dependencies.routeInboxAnswer(answered, answer);
    if (routed instanceof WorkOsError) return routed;

    return answered;
  };
};
