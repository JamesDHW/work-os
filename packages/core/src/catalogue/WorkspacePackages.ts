import type { AgentPreset } from "@work-os/domain/agents/AgentPreset";
import type { EnvironmentDefinition } from "@work-os/domain/environments/EnvironmentDefinition";
import type { AgentId, EnvironmentId, StandardId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Skill } from "@work-os/domain/skills/Skill";
import type { Standard } from "@work-os/domain/standards/Standard";
import type { Workspace } from "@work-os/domain/workspaces/Workspace";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type ModelAliases = Readonly<Record<string, string>>;

export type WorkspacePackages = {
  readonly ensurePackage: (workspace: Workspace) => Promise<string | WorkOsError>;
  readonly readRevision: (workspaceId: WorkspaceId) => Promise<string | WorkOsError>;
  readonly listStandards: (workspaceId: WorkspaceId) => Promise<readonly Standard[] | WorkOsError>;
  readonly readStandard: (workspaceId: WorkspaceId, standardId: StandardId) => Promise<Standard | NotFoundError | WorkOsError>;
  readonly saveStandard: (workspaceId: WorkspaceId, standard: Standard) => Promise<Standard | WorkOsError>;
  readonly listAgents: (workspaceId: WorkspaceId) => Promise<readonly AgentPreset[] | WorkOsError>;
  readonly readAgent: (workspaceId: WorkspaceId, agentId: AgentId) => Promise<AgentPreset | NotFoundError | WorkOsError>;
  readonly listEnvironments: (workspaceId: WorkspaceId) => Promise<readonly EnvironmentDefinition[] | WorkOsError>;
  readonly readEnvironment: (
    workspaceId: WorkspaceId,
    environmentId: EnvironmentId,
  ) => Promise<EnvironmentDefinition | NotFoundError | WorkOsError>;
  readonly readSkill: (workspaceId: WorkspaceId, name: string) => Promise<Skill | NotFoundError | WorkOsError>;
  readonly readModelAliases: (workspaceId: WorkspaceId) => Promise<ModelAliases | WorkOsError>;
};
