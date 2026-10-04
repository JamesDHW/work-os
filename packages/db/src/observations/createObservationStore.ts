import type { ObservationStore } from "@work-os/core/observations/ObservationStore";
import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import type { Observation, ObservationKind } from "@work-os/domain/observations/Observation";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { and, count, eq } from "drizzle-orm";

import { observations } from "../tables/observations.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

export const createObservationStore = (database: WorkOsDatabase): ObservationStore => {
  const recordObservation = async (observation: Observation): Promise<Observation | WorkOsError> => {
    const inserted = await tryCatchAsync(() => database.insert(observations).values(observation));
    if (inserted instanceof WorkOsError) return inserted;

    return observation;
  };

  const countObservations = async (runId: RunId, kind: ObservationKind): Promise<number | WorkOsError> => {
    const condition = and(eq(observations.runId, runId), eq(observations.kind, kind));
    const rows = await tryCatchAsync(() => database.select({ total: count() }).from(observations).where(condition));
    if (rows instanceof WorkOsError) return rows;

    return rows[0]?.total ?? 0;
  };

  return { recordObservation, countObservations };
};
