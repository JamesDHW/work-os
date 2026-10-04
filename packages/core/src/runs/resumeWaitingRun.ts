import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { InboxStore } from "../inbox/InboxStore.ts";
import type { InboxWaiters } from "../inbox/InboxWaiters.ts";
import type { EventBus } from "../events/EventBus.ts";
import type { TransitionRun } from "./transitionRun.ts";

type ResumeWaitingRunDependencies = {
  readonly inboxStore: Pick<InboxStore, "listOpenRunItems" | "closeInboxItem">;
  readonly inboxWaiters: Pick<InboxWaiters, "settle">;
  readonly eventBus: Pick<EventBus, "publish">;
  readonly transitionRun: TransitionRun;
};

export type ResumeWaitingRun = (run: Run) => Promise<Run | WorkOsError>;

export const createResumeWaitingRun = (dependencies: ResumeWaitingRunDependencies): ResumeWaitingRun => {
  return async (run) => {
    const isWaitingForInput = run.state.status === "waiting" && run.state.reason === "input";
    if (!isWaitingForInput) return run;

    const openItems = await dependencies.inboxStore.listOpenRunItems(run.id);
    if (openItems instanceof WorkOsError) return openItems;

    const inputItems = openItems.filter((inboxItem) => inboxItem.origin.kind === "runInput");
    for (const inboxItem of inputItems) {
      const withdrawn = await dependencies.inboxStore.closeInboxItem(inboxItem.id, { status: "withdrawn" });
      if (!(withdrawn instanceof WorkOsError)) {
        dependencies.inboxWaiters.settle(withdrawn.id, withdrawn.state);
      }
    }
    dependencies.eventBus.publish({ kind: "inboxUpdated", workspaceId: run.workspaceId });

    const hasOtherOpenItems = openItems.length > inputItems.length;
    if (hasOtherOpenItems) return run;

    return dependencies.transitionRun({ run, event: { kind: "waitingEnded" } });
  };
};
