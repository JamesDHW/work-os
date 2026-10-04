import type { RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { AgentRuntime } from "./AgentRuntime.ts";
import { findWorkspaceRun } from "./findWorkspaceRun.ts";
import type { PrepareRun } from "./prepareRun.ts";
import type { ResumeWaitingRun } from "./resumeWaitingRun.ts";
import type { RunStore } from "./RunStore.ts";
import type { TransitionRun } from "./transitionRun.ts";

export type SendRunMessageInput = {
  readonly workspaceId: WorkspaceId;
  readonly runId: RunId;
  readonly text: string;
  readonly mode: "steer" | "followUp";
};

type SendRunMessageDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly agentRuntime: Pick<AgentRuntime, "submitMessage">;
  readonly resumeWaitingRun: ResumeWaitingRun;
  readonly transitionRun: TransitionRun;
  readonly prepareRun: PrepareRun;
  readonly randomSource: Pick<RandomSource, "createId">;
};

export type SendRunMessage = (input: SendRunMessageInput) => Promise<Run | WorkOsError>;

export const createSendRunMessage = (dependencies: SendRunMessageDependencies): SendRunMessage => {
  return async (input) => {
    const run = await findWorkspaceRun(dependencies.runStore, input.workspaceId, input.runId);
    if (run instanceof WorkOsError) return run;

    const requestId = dependencies.randomSource.createId();
    const isFinished = run.state.status === "completed" || run.state.status === "stopped" || run.state.status === "failed";
    const shouldReopen = isFinished || run.conversationId === null;
    if (shouldReopen) return reopenRun(dependencies, run, { text: input.text, requestId });

    const resumed = await dependencies.resumeWaitingRun(run);
    if (resumed instanceof WorkOsError) return resumed;

    const submitted = await dependencies.agentRuntime.submitMessage({ conversationId: run.conversationId, text: input.text, mode: input.mode, requestId });
    if (submitted instanceof WorkOsError) return submitted;

    return resumed;
  };
};

const reopenRun = async (
  dependencies: SendRunMessageDependencies,
  run: Run,
  message: { readonly text: string; readonly requestId: string },
): Promise<Run | WorkOsError> => {
  const reopened = await dependencies.transitionRun({ run, event: { kind: "reopened" } });
  if (reopened instanceof WorkOsError) return reopened;

  void dependencies.prepareRun(reopened, message);
  return reopened;
};
