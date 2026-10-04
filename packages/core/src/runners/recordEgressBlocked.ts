import type { RunId, RunnerId } from "@work-os/domain/identifiers/Identifiers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RecordObservation } from "../observations/recordObservation.ts";
import type { RunStore } from "../runs/RunStore.ts";

export type EgressBlockedReport = {
  readonly runnerId: RunnerId;
  readonly runId: RunId;
  readonly host: string;
};

type RecordEgressBlockedDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly recordObservation: RecordObservation;
};

export type RecordEgressBlocked = (report: EgressBlockedReport) => Promise<undefined>;

export const createRecordEgressBlocked = (dependencies: RecordEgressBlockedDependencies): RecordEgressBlocked => {
  return async (report) => {
    const run = await dependencies.runStore.findRun(report.runId);
    const isRunOnRunner = !(run instanceof WorkOsError) && run.spec.project.runnerId === report.runnerId;
    if (!isRunOnRunner) return undefined;

    return dependencies.recordObservation({ workspaceId: run.workspaceId, runId: run.id, kind: "egressBlocked", detail: { host: report.host } });
  };
};
