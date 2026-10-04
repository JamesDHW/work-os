import type { GrantStore } from "@work-os/core/capabilities/GrantStore";
import type { Grant } from "@work-os/domain/capabilities/Grant";
import { toCapabilityId, toGrantId, toUserId, toWorkspaceId, type GrantId, type WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { and, desc, eq } from "drizzle-orm";

import { grants } from "../tables/grants.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

type GrantRow = typeof grants.$inferSelect;

export const createGrantStore = (database: WorkOsDatabase): GrantStore => {
  const createGrant = async (grant: Grant): Promise<Grant | WorkOsError> => {
    const inserted = await tryCatchAsync(() => database.insert(grants).values(grant));
    if (inserted instanceof WorkOsError) return inserted;

    return grant;
  };

  const listGrants = async (workspaceId: WorkspaceId): Promise<readonly Grant[] | WorkOsError> => {
    const rows = await tryCatchAsync(() =>
      database.select().from(grants).where(eq(grants.workspaceId, workspaceId)).orderBy(desc(grants.createdAt)),
    );
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toGrant);
  };

  const revokeGrant = async (workspaceId: WorkspaceId, grantId: GrantId): Promise<WorkOsError | undefined> => {
    const condition = and(eq(grants.workspaceId, workspaceId), eq(grants.id, grantId));
    const deleted = await tryCatchAsync(() => database.delete(grants).where(condition).returning());
    if (deleted instanceof WorkOsError) return deleted;
    if (deleted.length === 0) return new NotFoundError(`Grant ${grantId} does not exist.`);

    return undefined;
  };

  return { createGrant, listGrants, revokeGrant };
};

const toGrant = (row: GrantRow): Grant => ({
  id: toGrantId(row.id),
  workspaceId: toWorkspaceId(row.workspaceId),
  capabilityId: toCapabilityId(row.capabilityId),
  target: row.target,
  scope: row.scope,
  createdBy: toUserId(row.createdBy),
  createdAt: row.createdAt,
});
