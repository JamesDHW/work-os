import type { CapabilityCallRecord, CapabilityCallStore } from "@work-os/core/capabilities/CapabilityCallStore";
import { toCapabilityId, toRunId, toWorkspaceId, type RunId } from "@work-os/domain/identifiers/Identifiers";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { asc, eq } from "drizzle-orm";

import { capabilityCalls } from "../tables/capabilityCalls.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

type CapabilityCallRow = typeof capabilityCalls.$inferSelect;

export const createCapabilityCallStore = (database: WorkOsDatabase): CapabilityCallStore => {
  const saveCapabilityCall = async (record: CapabilityCallRecord): Promise<CapabilityCallRecord | WorkOsError> => {
    const saved = await tryCatchAsync(() =>
      database
        .insert(capabilityCalls)
        .values(record)
        .onConflictDoUpdate({ target: capabilityCalls.id, set: { arguments: record.arguments, status: record.status, result: record.result } }),
    );
    if (saved instanceof WorkOsError) return saved;

    return record;
  };

  const findCapabilityCall = async (id: string): Promise<CapabilityCallRecord | null | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(capabilityCalls).where(eq(capabilityCalls.id, id)));
    if (rows instanceof WorkOsError) return rows;

    const row = rows[0];
    return row === undefined ? null : toCapabilityCall(row);
  };

  const listCapabilityCalls = async (runId: RunId): Promise<readonly CapabilityCallRecord[] | WorkOsError> => {
    const rows = await tryCatchAsync(() =>
      database.select().from(capabilityCalls).where(eq(capabilityCalls.runId, runId)).orderBy(asc(capabilityCalls.createdAt)),
    );
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toCapabilityCall);
  };

  return { saveCapabilityCall, findCapabilityCall, listCapabilityCalls };
};

const toCapabilityCall = (row: CapabilityCallRow): CapabilityCallRecord => ({
  ...row,
  workspaceId: toWorkspaceId(row.workspaceId),
  runId: toRunId(row.runId),
  capabilityId: toCapabilityId(row.capabilityId),
});
