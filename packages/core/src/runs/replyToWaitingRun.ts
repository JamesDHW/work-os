import type { InboxAnswer } from "@work-os/domain/inbox/InboxAnswer";
import type { InboxItem } from "@work-os/domain/inbox/InboxItem";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { InboxStore } from "../inbox/InboxStore.ts";
import type { AgentRuntime } from "./AgentRuntime.ts";
import type { RunStore } from "./RunStore.ts";
import type { TransitionRun } from "./transitionRun.ts";

type ReplyToWaitingRunDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly inboxStore: Pick<InboxStore, "listOpenRunItems">;
  readonly agentRuntime: Pick<AgentRuntime, "submitMessage">;
  readonly transitionRun: TransitionRun;
};

export type ReplyToWaitingRun = (inboxItem: InboxItem, answer: InboxAnswer) => Promise<WorkOsError | undefined>;

export const createReplyToWaitingRun = (dependencies: ReplyToWaitingRunDependencies): ReplyToWaitingRun => {
  return async (inboxItem, answer) => {
    const isRunReply = inboxItem.runId !== null && answer.kind === "reply";
    if (!isRunReply) return undefined;

    const run = await dependencies.runStore.findRun(inboxItem.runId);
    if (run instanceof WorkOsError) return run;
    if (run.conversationId === null) return undefined;

    const resumed = await endWaitingWhenNothingOpen(dependencies, inboxItem);
    if (resumed instanceof WorkOsError) return resumed;

    return dependencies.agentRuntime.submitMessage({
      conversationId: run.conversationId,
      text: answer.text,
      mode: "followUp",
      requestId: inboxItem.id,
    });
  };
};

const endWaitingWhenNothingOpen = async (
  dependencies: ReplyToWaitingRunDependencies,
  inboxItem: InboxItem,
): Promise<WorkOsError | undefined> => {
  if (inboxItem.runId === null) return undefined;

  const [run, openItems] = await Promise.all([
    dependencies.runStore.findRun(inboxItem.runId),
    dependencies.inboxStore.listOpenRunItems(inboxItem.runId),
  ]);
  if (run instanceof WorkOsError) return run;
  if (openItems instanceof WorkOsError) return openItems;

  const shouldResume = run.state.status === "waiting" && openItems.length === 0;
  if (!shouldResume) return undefined;

  const resumed = await dependencies.transitionRun({ run, event: { kind: "waitingEnded" } });
  return resumed instanceof WorkOsError ? resumed : undefined;
};
