import type { InboxItemState } from "@work-os/domain/inbox/InboxItem";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RecordObservation } from "../observations/recordObservation.ts";
import type { AwaitRunDecision } from "./awaitRunDecision.ts";
import type { RunStore } from "./RunStore.ts";
import type { AskUserInput } from "./RunToolHandlers.ts";

type AskUserDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly awaitRunDecision: AwaitRunDecision;
  readonly recordObservation: RecordObservation;
};

export type AskUser = (input: AskUserInput) => Promise<string | WorkOsError>;

export const createAskUser = (dependencies: AskUserDependencies): AskUser => {
  return async (input) => {
    const run = await dependencies.runStore.findRun(input.runId);
    if (run instanceof WorkOsError) return run;

    await dependencies.recordObservation({ workspaceId: run.workspaceId, runId: run.id, kind: "questionAsked", detail: { question: input.question } });
    const closedState = await dependencies.awaitRunDecision({
      run,
      taskId: input.taskId,
      origin: { kind: "agentQuestion", taskId: input.taskId },
      title: input.question,
      payload: { kind: "question", question: input.question, options: input.options },
      waitingReason: "question",
    });
    if (closedState instanceof WorkOsError) return closedState;

    return describeReply(closedState);
  };
};

const describeReply = (state: InboxItemState): string => {
  if (state.status !== "answered") return "The question was withdrawn without an answer. Continue with your best judgement.";
  if (state.answer.kind !== "reply") return `The user answered with "${state.answer.kind}".`;

  return state.answer.text;
};
