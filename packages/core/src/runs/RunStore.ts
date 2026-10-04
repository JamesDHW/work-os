import type { CapabilityId, ProjectId, RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Run, RunOutputs } from "@work-os/domain/runs/Run";
import type { RunState } from "@work-os/domain/runs/RunState";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type RunChange = {
  readonly state?: RunState;
  readonly summary?: string;
  readonly outputs?: RunOutputs;
  readonly conversationId?: string;
  readonly addedCapabilities?: readonly CapabilityId[];
  readonly updatedAt: string;
};

export type RunListFilter = {
  readonly projectId?: ProjectId;
};

export type RunStore = {
  readonly createRun: (run: Run) => Promise<Run | WorkOsError>;
  readonly findRun: (runId: RunId) => Promise<Run | NotFoundError | WorkOsError>;
  readonly listRuns: (workspaceId: WorkspaceId, filter: RunListFilter) => Promise<readonly Run[] | WorkOsError>;
  readonly listActiveRuns: () => Promise<readonly Run[] | WorkOsError>;
  readonly updateRun: (runId: RunId, change: RunChange) => Promise<Run | WorkOsError>;
};
