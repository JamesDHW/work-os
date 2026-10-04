import type { ProjectId, StandardId, UserId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { toRunId } from "@work-os/domain/identifiers/Identifiers";
import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { EventBus } from "../events/EventBus.ts";
import type { ComposeRunSpecForProject } from "./composeRunSpecForProject.ts";
import type { PrepareRun } from "./prepareRun.ts";
import type { RunStore } from "./RunStore.ts";

export type StartRunInput = {
  readonly workspaceId: WorkspaceId;
  readonly userId: UserId;
  readonly projectId: ProjectId;
  readonly standardId: StandardId;
  readonly prompt: string;
};

type StartRunDependencies = {
  readonly composeRunSpecForProject: ComposeRunSpecForProject;
  readonly runStore: Pick<RunStore, "createRun">;
  readonly prepareRun: PrepareRun;
  readonly eventBus: Pick<EventBus, "publish">;
  readonly randomSource: Pick<RandomSource, "createId">;
  readonly clock: SystemClock;
};

export type StartRun = (input: StartRunInput) => Promise<Run | WorkOsError>;

export const createStartRun = (dependencies: StartRunDependencies): StartRun => {
  return async (input) => {
    const runId = toRunId(dependencies.randomSource.createId());
    const spec = await dependencies.composeRunSpecForProject({ ...input, runId });
    if (spec instanceof WorkOsError) return spec;

    const createdAt = dependencies.clock.now();
    const run = await dependencies.runStore.createRun({
      id: runId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      standardId: input.standardId,
      principal: { kind: "user", userId: input.userId },
      spec,
      addedCapabilities: [],
      state: { status: "preparing" },
      summary: null,
      outputs: null,
      conversationId: null,
      createdAt,
      updatedAt: createdAt,
    });
    if (run instanceof WorkOsError) return run;

    dependencies.eventBus.publish({ kind: "runUpdated", workspaceId: run.workspaceId, runId: run.id });
    void dependencies.prepareRun(run, { text: input.prompt, requestId: run.id });
    return run;
  };
};
