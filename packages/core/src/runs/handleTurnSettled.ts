import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { OpenInboxItem } from "../inbox/openInboxItem.ts";
import { QUESTION_PREVIEW_LIMIT } from "./runs.constants.ts";
import type { RunStore } from "./RunStore.ts";
import type { TurnSettledInput } from "./RunToolHandlers.ts";
import type { TransitionRun } from "./transitionRun.ts";

type HandleTurnSettledDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly transitionRun: TransitionRun;
  readonly openInboxItem: OpenInboxItem;
};

export type HandleTurnSettled = (input: TurnSettledInput) => Promise<WorkOsError | undefined>;

export const createHandleTurnSettled = (dependencies: HandleTurnSettledDependencies): HandleTurnSettled => {
  return async (input) => {
    const run = await dependencies.runStore.findRun(input.runId);
    if (run instanceof WorkOsError) return run;
    if (run.state.status !== "running") return undefined;

    const waiting = await dependencies.transitionRun({ run, event: { kind: "waitingStarted", reason: "input" } });
    if (waiting instanceof WorkOsError) return waiting;

    const question = input.answerText.slice(0, QUESTION_PREVIEW_LIMIT);
    const opened = await dependencies.openInboxItem({
      workspaceId: run.workspaceId,
      runId: run.id,
      origin: { kind: "runInput" },
      title: `Reply to the agent on "${run.spec.prompt.slice(0, 80)}"`,
      isBlocking: true,
      payload: { kind: "question", question, options: [] },
    });
    return opened instanceof WorkOsError ? opened : undefined;
  };
};
