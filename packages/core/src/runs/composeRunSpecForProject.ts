import type { ProjectId, RunId, StandardId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { resolveModelReference } from "@work-os/domain/agents/resolveModelReference";
import { composeRunSpec } from "@work-os/domain/runs/composeRunSpec";
import type { RunSpec } from "@work-os/domain/runs/RunSpec";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { WorkspacePackages } from "../catalogue/WorkspacePackages.ts";
import type { ProjectStore } from "../projects/ProjectStore.ts";

export type ComposeRunSpecInput = {
  readonly workspaceId: WorkspaceId;
  readonly runId: RunId;
  readonly projectId: ProjectId;
  readonly standardId: StandardId;
  readonly prompt: string;
};

type ComposeRunSpecForProjectDependencies = {
  readonly projectStore: Pick<ProjectStore, "findProject">;
  readonly workspacePackages: Pick<WorkspacePackages, "readStandard" | "readAgent" | "readEnvironment" | "readModelAliases" | "readRevision">;
};

export type ComposeRunSpecForProject = (input: ComposeRunSpecInput) => Promise<RunSpec | WorkOsError>;

export const createComposeRunSpecForProject = (dependencies: ComposeRunSpecForProjectDependencies): ComposeRunSpecForProject => {
  return async (input) => {
    const packages = dependencies.workspacePackages;
    const project = await dependencies.projectStore.findProject(input.workspaceId, input.projectId);
    if (project instanceof WorkOsError) return project;

    const standard = await packages.readStandard(input.workspaceId, input.standardId);
    if (standard instanceof WorkOsError) return standard;

    const [agent, environment, aliases, packageRevision] = await Promise.all([
      packages.readAgent(input.workspaceId, standard.agentId),
      packages.readEnvironment(input.workspaceId, project.environmentId),
      packages.readModelAliases(input.workspaceId),
      packages.readRevision(input.workspaceId),
    ]);
    if (agent instanceof WorkOsError) return agent;
    if (environment instanceof WorkOsError) return environment;
    if (aliases instanceof WorkOsError) return aliases;
    if (packageRevision instanceof WorkOsError) return packageRevision;

    const model = resolveModelReference(agent.model, aliases);
    if (model instanceof WorkOsError) return model;

    return composeRunSpec({ ...input, project, standard, agent, environment, model, packageRevision });
  };
};
