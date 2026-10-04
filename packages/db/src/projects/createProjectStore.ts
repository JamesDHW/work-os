import type { ProjectStore } from "@work-os/core/projects/ProjectStore";
import { toConnectionId, toEnvironmentId, toProjectId, toRunnerId, toWorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { ProjectId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Project } from "@work-os/domain/projects/Project";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { and, asc, eq } from "drizzle-orm";

import { projects } from "../tables/projects.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

type ProjectRow = typeof projects.$inferSelect;

export const createProjectStore = (database: WorkOsDatabase): ProjectStore => {
  const createProject = async (project: Project): Promise<Project | WorkOsError> => {
    const row = { ...project, runnerId: project.location.runnerId, path: project.location.path };
    const inserted = await tryCatchAsync(() => database.insert(projects).values(row));
    if (inserted instanceof WorkOsError) return inserted;

    return project;
  };

  const listProjects = async (workspaceId: WorkspaceId): Promise<readonly Project[] | WorkOsError> => {
    const rows = await tryCatchAsync(() =>
      database.select().from(projects).where(eq(projects.workspaceId, workspaceId)).orderBy(asc(projects.name)),
    );
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toProject);
  };

  const findProject = async (workspaceId: WorkspaceId, projectId: ProjectId): Promise<Project | WorkOsError> => {
    const condition = and(eq(projects.workspaceId, workspaceId), eq(projects.id, projectId));
    const rows = await tryCatchAsync(() => database.select().from(projects).where(condition));
    if (rows instanceof WorkOsError) return rows;

    const row = rows[0];
    if (row === undefined) return new NotFoundError(`Project ${projectId} does not exist.`);
    return toProject(row);
  };

  return { createProject, listProjects, findProject };
};

const toProject = (row: ProjectRow): Project => ({
  id: toProjectId(row.id),
  workspaceId: toWorkspaceId(row.workspaceId),
  name: row.name,
  location: { runnerId: toRunnerId(row.runnerId), path: row.path },
  environmentId: toEnvironmentId(row.environmentId),
  connectionIds: row.connectionIds.map(toConnectionId),
  createdAt: row.createdAt,
});
