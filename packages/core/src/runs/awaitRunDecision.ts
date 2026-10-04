import type { InboxItem, InboxItemState, InboxOrigin, InboxPayload } from "@work-os/domain/inbox/InboxItem";
import type { Run } from "@work-os/domain/runs/Run";
import type { WaitingReason } from "@work-os/domain/runs/RunState";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { InboxStore } from "../inbox/InboxStore.ts";
import type { InboxWaiters } from "../inbox/InboxWaiters.ts";
import type { OpenInboxItem } from "../inbox/openInboxItem.ts";
import type { RunStore } from "./RunStore.ts";
import type { TransitionRun } from "./transitionRun.ts";

export type RunDecisionRequest = {
  readonly run: Run;
  readonly taskId: string;
  readonly origin: Extract<InboxOrigin, { readonly taskId: string }>;
  readonly title: string;
  readonly payload: InboxPayload;
  readonly waitingReason: WaitingReason;
};

type AwaitRunDecisionDependencies = {
  readonly inboxStore: Pick<InboxStore, "findInboxItemByTask" | "listOpenRunItems">;
  readonly inboxWaiters: Pick<InboxWaiters, "waitForClose">;
  readonly openInboxItem: OpenInboxItem;
  readonly runStore: Pick<RunStore, "findRun">;
  readonly transitionRun: TransitionRun;
};

export type AwaitRunDecision = (request: RunDecisionRequest) => Promise<InboxItemState | WorkOsError>;

export const createAwaitRunDecision = (dependencies: AwaitRunDecisionDependencies): AwaitRunDecision => {
  return async (request) => {
    const existing = await dependencies.inboxStore.findInboxItemByTask(request.taskId);
    if (existing instanceof WorkOsError) return existing;
    const isAlreadyClosed = existing !== null && existing.state.status !== "open";
    if (isAlreadyClosed) return existing.state;

    const inboxItem = await findOrOpenDecisionItem(dependencies, request, existing);
    if (inboxItem instanceof WorkOsError) return inboxItem;

    const closedState = await dependencies.inboxWaiters.waitForClose(inboxItem.id);
    const resumed = await resumeWhenNothingOpen(dependencies, request.run);
    if (resumed instanceof WorkOsError) return resumed;

    return closedState;
  };
};

const findOrOpenDecisionItem = async (
  dependencies: AwaitRunDecisionDependencies,
  request: RunDecisionRequest,
  existing: InboxItem | null,
): Promise<InboxItem | WorkOsError> => {
  if (existing !== null) return existing;

  return openDecisionItem(dependencies, request);
};

const openDecisionItem = async (dependencies: AwaitRunDecisionDependencies, request: RunDecisionRequest) => {
  const waiting = await dependencies.transitionRun({ run: request.run, event: { kind: "waitingStarted", reason: request.waitingReason } });
  if (waiting instanceof WorkOsError) return waiting;

  return dependencies.openInboxItem({
    workspaceId: request.run.workspaceId,
    runId: request.run.id,
    origin: request.origin,
    title: request.title,
    isBlocking: true,
    payload: request.payload,
  });
};

const resumeWhenNothingOpen = async (dependencies: AwaitRunDecisionDependencies, run: Run): Promise<WorkOsError | undefined> => {
  const openItems = await dependencies.inboxStore.listOpenRunItems(run.id);
  if (openItems instanceof WorkOsError) return openItems;

  const current = await dependencies.runStore.findRun(run.id);
  if (current instanceof WorkOsError) return current;

  const isStillWaiting = current.state.status === "waiting" && openItems.length === 0;
  if (!isStillWaiting) return undefined;

  const resumed = await dependencies.transitionRun({ run: current, event: { kind: "waitingEnded" } });
  return resumed instanceof WorkOsError ? resumed : undefined;
};
