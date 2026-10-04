import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { Logger } from "../system/Logger.ts";
import type { AgentRuntime } from "./AgentRuntime.ts";
import type { PrepareRun } from "./prepareRun.ts";
import type { RunStore } from "./RunStore.ts";

type ResumeActiveRunsDependencies = {
  readonly runStore: Pick<RunStore, "listActiveRuns">;
  readonly agentRuntime: Pick<AgentRuntime, "watchConversation">;
  readonly prepareRun: PrepareRun;
  readonly logger: Logger;
};

export type ResumeActiveRuns = () => Promise<WorkOsError | undefined>;

export const createResumeActiveRuns = (dependencies: ResumeActiveRunsDependencies): ResumeActiveRuns => {
  return async () => {
    const activeRuns = await dependencies.runStore.listActiveRuns();
    if (activeRuns instanceof WorkOsError) return activeRuns;

    for (const run of activeRuns) {
      await resumeRun(dependencies, run);
    }
    dependencies.logger.info("Resumed active runs.", { count: activeRuns.length });
    return undefined;
  };
};

const resumeRun = async (dependencies: ResumeActiveRunsDependencies, run: Run): Promise<undefined> => {
  if (run.conversationId === null) {
    void dependencies.prepareRun(run, { text: run.spec.prompt, requestId: run.id });
    return undefined;
  }

  const watched = await dependencies.agentRuntime.watchConversation(run.id, run.conversationId);
  if (watched instanceof WorkOsError) {
    dependencies.logger.warn("Could not resume a run.", { runId: run.id, message: watched.message });
  }
  return undefined;
};
