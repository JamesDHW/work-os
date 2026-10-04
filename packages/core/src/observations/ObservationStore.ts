import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import type { Observation, ObservationKind } from "@work-os/domain/observations/Observation";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type ObservationStore = {
  readonly recordObservation: (observation: Observation) => Promise<Observation | WorkOsError>;
  readonly countObservations: (runId: RunId, kind: ObservationKind) => Promise<number | WorkOsError>;
};
