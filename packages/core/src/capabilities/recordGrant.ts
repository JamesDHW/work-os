import type { CapabilityCall } from "@work-os/domain/capabilities/CapabilityCall";
import type { Grant, GrantDuration, GrantScope } from "@work-os/domain/capabilities/Grant";
import { toGrantId, type UserId } from "@work-os/domain/identifiers/Identifiers";
import type { Run } from "@work-os/domain/runs/Run";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { GrantStore } from "./GrantStore.ts";

export type RecordGrantInput = {
  readonly run: Run;
  readonly call: CapabilityCall;
  readonly duration: GrantDuration;
  readonly approvedBy: UserId;
};

type RecordGrantDependencies = {
  readonly grantStore: Pick<GrantStore, "createGrant">;
  readonly randomSource: Pick<RandomSource, "createId">;
  readonly clock: SystemClock;
};

export type RecordGrant = (input: RecordGrantInput) => Promise<Grant | null | WorkOsError>;

export const createRecordGrant = (dependencies: RecordGrantDependencies): RecordGrant => {
  return async (input) => {
    const scope = scopeForDuration(input);
    if (scope === null) return null;

    return dependencies.grantStore.createGrant({
      id: toGrantId(dependencies.randomSource.createId()),
      workspaceId: input.run.workspaceId,
      capabilityId: input.call.capabilityId,
      target: input.call.target,
      scope,
      createdBy: input.approvedBy,
      createdAt: dependencies.clock.now(),
    });
  };
};

const scopeForDuration = (input: RecordGrantInput): GrantScope | null => {
  switch (input.duration) {
    case "once":
      return null;
    case "run":
      return { kind: "run", runId: input.run.id };
    case "standard":
      return { kind: "standard", standardId: input.run.standardId };
    default:
      return input.duration satisfies never;
  }
};
