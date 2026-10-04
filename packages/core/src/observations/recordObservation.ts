import type { RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { toObservationId } from "@work-os/domain/identifiers/Identifiers";
import type { JsonObject } from "@work-os/domain/json/Json";
import type { ObservationKind } from "@work-os/domain/observations/Observation";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { Logger } from "../system/Logger.ts";
import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { ObservationStore } from "./ObservationStore.ts";

export type RecordObservationInput = {
  readonly workspaceId: WorkspaceId;
  readonly runId: RunId;
  readonly kind: ObservationKind;
  readonly detail: JsonObject;
};

type RecordObservationDependencies = {
  readonly observationStore: Pick<ObservationStore, "recordObservation">;
  readonly randomSource: Pick<RandomSource, "createId">;
  readonly clock: SystemClock;
  readonly logger: Logger;
};

export type RecordObservation = (input: RecordObservationInput) => Promise<undefined>;

export const createRecordObservation = (dependencies: RecordObservationDependencies): RecordObservation => {
  return async (input) => {
    const recorded = await dependencies.observationStore.recordObservation({
      ...input,
      id: toObservationId(dependencies.randomSource.createId()),
      createdAt: dependencies.clock.now(),
    });
    if (recorded instanceof WorkOsError) {
      dependencies.logger.warn("Could not record an observation.", { message: recorded.message });
    }
    return undefined;
  };
};
