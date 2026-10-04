import type { RunnerId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Runner } from "@work-os/domain/runners/Runner";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type RunnerStore = {
  readonly createRunner: (runner: Runner, tokenHash: string) => Promise<Runner | WorkOsError>;
  readonly listRunners: (workspaceId: WorkspaceId) => Promise<readonly Runner[] | WorkOsError>;
  readonly findRunner: (workspaceId: WorkspaceId, runnerId: RunnerId) => Promise<Runner | NotFoundError | WorkOsError>;
  readonly findRunnerByTokenHash: (tokenHash: string) => Promise<Runner | NotFoundError | WorkOsError>;
  readonly markRunnerSeen: (runnerId: RunnerId, seenAt: string) => Promise<WorkOsError | undefined>;
};
