import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { EventBus } from "../events/EventBus.ts";
import type { RunStore } from "./RunStore.ts";

type ReportRunActivityDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly eventBus: Pick<EventBus, "publish">;
};

export type ReportRunActivity = (runId: RunId) => Promise<undefined>;

export const createReportRunActivity = (dependencies: ReportRunActivityDependencies): ReportRunActivity => {
  return async (runId) => {
    const run = await dependencies.runStore.findRun(runId);
    if (run instanceof WorkOsError) return undefined;

    dependencies.eventBus.publish({ kind: "runUpdated", workspaceId: run.workspaceId, runId: run.id });
    return undefined;
  };
};
