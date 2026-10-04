import type { ProjectId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Project } from "@work-os/domain/projects/Project";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type ProjectStore = {
  readonly createProject: (project: Project) => Promise<Project | WorkOsError>;
  readonly listProjects: (workspaceId: WorkspaceId) => Promise<readonly Project[] | WorkOsError>;
  readonly findProject: (workspaceId: WorkspaceId, projectId: ProjectId) => Promise<Project | NotFoundError | WorkOsError>;
};
