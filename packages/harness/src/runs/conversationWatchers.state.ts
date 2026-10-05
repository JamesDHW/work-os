import { BACKGROUND_CONTEXT } from "@earendil-works/chord/context";
import type { Conversation } from "@earendil-works/pi-durable";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import type { RunId } from "@work-os/domain/identifiers/Identifiers";

import { ACTIVITY_REPORT_INTERVAL_MILLISECONDS } from "../harness.constants.ts";

export type ConversationWatchers = {
  readonly watch: (runId: RunId, conversation: Conversation) => Promise<undefined>;
  readonly stopAll: () => undefined;
};

export const createConversationWatchers = (reportRunActivity: RunToolHandlers["reportRunActivity"]): ConversationWatchers => {
  const unsubscribers = new Map<RunId, () => void>();
  const pendingReports = new Set<RunId>();

  const scheduleReport = (runId: RunId): void => {
    if (pendingReports.has(runId)) return;

    pendingReports.add(runId);
    setTimeout(() => {
      pendingReports.delete(runId);
      void reportRunActivity(runId);
    }, ACTIVITY_REPORT_INTERVAL_MILLISECONDS);
  };

  const watch = async (runId: RunId, conversation: Conversation): Promise<undefined> => {
    if (unsubscribers.has(runId)) return undefined;

    const view = await conversation.viewState(BACKGROUND_CONTEXT);
    const unsubscribe = view.subscribe(() => scheduleReport(runId));
    unsubscribers.set(runId, unsubscribe);
    return undefined;
  };

  const stopAll = (): undefined => {
    for (const unsubscribe of unsubscribers.values()) {
      unsubscribe();
    }
    unsubscribers.clear();
    return undefined;
  };

  return { watch, stopAll };
};
