import type { RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { WithdrawRunItems } from "../inbox/withdrawRunItems.ts";
import type { AgentRuntime } from "./AgentRuntime.ts";
import { findWorkspaceRun } from "./findWorkspaceRun.ts";
import type { RunStore } from "./RunStore.ts";
import type { StopRunEnvironment } from "./stopRunEnvironment.ts";
import type { TransitionRun } from "./transitionRun.ts";

export type StopRunInput = {
  readonly workspaceId: WorkspaceId;
  readonly runId: RunId;
};

type StopRunDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly agentRuntime: Pick<AgentRuntime, "stopConversation">;
  readonly withdrawRunItems: WithdrawRunItems;
  readonly transitionRun: TransitionRun;
  readonly stopRunEnvironment: StopRunEnvironment;
};

export type StopRun = (input: StopRunInput) => Promise<Run | WorkOsError>;

export const createStopRun = (dependencies: StopRunDependencies): StopRun => {
  return async (input) => {
    const run = await findWorkspaceRun(dependencies.runStore, input.workspaceId, input.runId);
    if (run instanceof WorkOsError) return run;

    const stopped = await dependencies.transitionRun({ run, event: { kind: "stopped" } });
    if (stopped instanceof WorkOsError) return stopped;

    const conversationStopped = await stopConversationIfStarted(dependencies, run);
    if (conversationStopped instanceof WorkOsError) return conversationStopped;

    const withdrawn = await dependencies.withdrawRunItems({ workspaceId: run.workspaceId, runId: run.id });
    if (withdrawn instanceof WorkOsError) return withdrawn;

    await dependencies.stopRunEnvironment(stopped);
    return stopped;
  };
};

const stopConversationIfStarted = async (dependencies: StopRunDependencies, run: Run): Promise<WorkOsError | undefined> => {
  if (run.conversationId === null) return undefined;

  return dependencies.agentRuntime.stopConversation(run.conversationId);
};
