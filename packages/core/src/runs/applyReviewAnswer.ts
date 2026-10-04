import type { InboxAnswer } from "@work-os/domain/inbox/InboxAnswer";
import type { InboxItem } from "@work-os/domain/inbox/InboxItem";
import type { Run } from "@work-os/domain/runs/Run";
import type { RunOutcome } from "@work-os/domain/runs/RunState";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RecordObservation } from "../observations/recordObservation.ts";
import type { AgentRuntime } from "./AgentRuntime.ts";
import type { RunStore } from "./RunStore.ts";
import type { StopRunEnvironment } from "./stopRunEnvironment.ts";
import type { TransitionRun } from "./transitionRun.ts";

type ApplyReviewAnswerDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly agentRuntime: Pick<AgentRuntime, "submitMessage">;
  readonly transitionRun: TransitionRun;
  readonly stopRunEnvironment: StopRunEnvironment;
  readonly recordObservation: RecordObservation;
};

export type ApplyReviewAnswer = (inboxItem: InboxItem, answer: InboxAnswer) => Promise<WorkOsError | undefined>;

export const createApplyReviewAnswer = (dependencies: ApplyReviewAnswerDependencies): ApplyReviewAnswer => {
  return async (inboxItem, answer) => {
    const isRunReview = inboxItem.runId !== null && inboxItem.payload.kind === "review";
    if (!isRunReview) return undefined;

    const run = await dependencies.runStore.findRun(inboxItem.runId);
    if (run instanceof WorkOsError) return run;

    switch (answer.kind) {
      case "accept":
        return decideReview(dependencies, run, "accepted");
      case "reject":
        await dependencies.recordObservation({ workspaceId: run.workspaceId, runId: run.id, kind: "reviewRejected", detail: { reason: answer.reason ?? "" } });
        return decideReview(dependencies, run, "rejected");
      case "requestRevision":
        return requestRevision(dependencies, run, answer.comment);
      case "reply":
      case "approve":
      case "acknowledge":
        return undefined;
      default:
        return answer satisfies never;
    }
  };
};

const decideReview = async (dependencies: ApplyReviewAnswerDependencies, run: Run, outcome: RunOutcome): Promise<WorkOsError | undefined> => {
  const decided = await dependencies.transitionRun({ run, event: { kind: "reviewDecided", outcome } });
  if (decided instanceof WorkOsError) return decided;

  await dependencies.stopRunEnvironment(decided);
  return undefined;
};

const requestRevision = async (dependencies: ApplyReviewAnswerDependencies, run: Run, comment: string): Promise<WorkOsError | undefined> => {
  if (run.conversationId === null) return undefined;

  const revising = await dependencies.transitionRun({ run, event: { kind: "revisionRequested" } });
  if (revising instanceof WorkOsError) return revising;

  await dependencies.recordObservation({ workspaceId: run.workspaceId, runId: run.id, kind: "revisionRequested", detail: { comment } });
  const text = `The reviewer asked for changes:\n\n${comment}\n\nMake the changes, then call complete again.`;
  return dependencies.agentRuntime.submitMessage({ conversationId: run.conversationId, text, mode: "followUp", requestId: `revision:${run.id}:${run.updatedAt}` });
};
