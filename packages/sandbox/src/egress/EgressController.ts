import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type EgressGrant = {
  readonly runId: RunId;
  readonly containerId: string;
  readonly hosts: readonly string[];
};

export type BlockedEgress = {
  readonly runId: RunId;
  readonly host: string;
};

export type EgressController = {
  readonly ensureReady: () => Promise<WorkOsError | undefined>;
  readonly allow: (grant: EgressGrant) => Promise<WorkOsError | undefined>;
  readonly revoke: (containerId: string) => Promise<WorkOsError | undefined>;
  readonly drainBlocked: () => Promise<readonly BlockedEgress[] | WorkOsError>;
};
