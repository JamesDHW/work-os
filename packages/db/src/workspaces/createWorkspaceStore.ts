import type { WorkspaceStore } from "@work-os/core/workspaces/WorkspaceStore";
import { toUserId, toWorkspaceId, type UserId, type WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Workspace } from "@work-os/domain/workspaces/Workspace";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { and, eq } from "drizzle-orm";

import { memberships } from "../tables/memberships.ts";
import { workspaces } from "../tables/workspaces.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

type WorkspaceRow = typeof workspaces.$inferSelect;

export const createWorkspaceStore = (database: WorkOsDatabase): WorkspaceStore => {
  const createWorkspace = async (workspace: Workspace, ownerId: UserId): Promise<Workspace | WorkOsError> => {
    const membership = { workspaceId: workspace.id, userId: ownerId, role: "owner", createdAt: workspace.createdAt } as const;
    const inserted = await tryCatchAsync(() =>
      database.batch([database.insert(workspaces).values(workspace), database.insert(memberships).values(membership)]),
    );
    if (inserted instanceof WorkOsError) return inserted;

    return workspace;
  };

  const listWorkspacesForUser = async (userId: UserId): Promise<readonly Workspace[] | WorkOsError> => {
    const rows = await tryCatchAsync(() => selectMemberWorkspaces(database, eq(memberships.userId, userId)));
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toWorkspace);
  };

  const findMemberWorkspace = async (userId: UserId, workspaceId: WorkspaceId): Promise<Workspace | WorkOsError> => {
    const condition = and(eq(memberships.userId, userId), eq(memberships.workspaceId, workspaceId));
    const rows = await tryCatchAsync(() => selectMemberWorkspaces(database, condition));
    if (rows instanceof WorkOsError) return rows;

    const row = rows[0];
    if (row === undefined) return new NotFoundError(`Workspace ${workspaceId} is not available.`);
    return toWorkspace(row);
  };

  const listMemberIds = async (workspaceId: WorkspaceId): Promise<readonly UserId[] | WorkOsError> => {
    const rows = await tryCatchAsync(() =>
      database.select({ userId: memberships.userId }).from(memberships).where(eq(memberships.workspaceId, workspaceId)),
    );
    if (rows instanceof WorkOsError) return rows;

    return rows.map((row) => toUserId(row.userId));
  };

  return { createWorkspace, listWorkspacesForUser, findMemberWorkspace, listMemberIds };
};

const selectMemberWorkspaces = (database: WorkOsDatabase, condition: ReturnType<typeof eq> | undefined) => {
  return database
    .select({ id: workspaces.id, name: workspaces.name, kind: workspaces.kind, createdAt: workspaces.createdAt })
    .from(workspaces)
    .innerJoin(memberships, eq(memberships.workspaceId, workspaces.id))
    .where(condition);
};

const toWorkspace = (row: WorkspaceRow): Workspace => ({ ...row, id: toWorkspaceId(row.id) });
