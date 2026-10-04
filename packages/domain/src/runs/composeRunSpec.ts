import type { AgentPreset } from "../agents/AgentPreset.ts";
import type { ModelReference } from "../agents/ModelReference.ts";
import type { EnvironmentDefinition } from "../environments/EnvironmentDefinition.ts";
import type { RunId } from "../identifiers/Identifiers.ts";
import type { Project } from "../projects/Project.ts";
import type { Standard } from "../standards/Standard.ts";
import type { RunSpec } from "./RunSpec.ts";

export type RunSpecIngredients = {
  readonly runId: RunId;
  readonly prompt: string;
  readonly project: Project;
  readonly standard: Standard;
  readonly packageRevision: string;
  readonly agent: AgentPreset;
  readonly model: ModelReference;
  readonly environment: EnvironmentDefinition;
};

export const composeRunSpec = (ingredients: RunSpecIngredients): RunSpec => {
  const { standard, agent, environment, project } = ingredients;

  return {
    runId: ingredients.runId,
    prompt: ingredients.prompt,
    project: { id: project.id, runnerId: project.location.runnerId, path: project.location.path },
    standard: {
      id: standard.id,
      packageRevision: ingredients.packageRevision,
      criteria: standard.criteria,
      method: standard.method,
      checks: standard.checks,
      review: standard.review,
    },
    agent: { id: agent.id, model: ingredients.model, thinkingLevel: agent.thinkingLevel, instructions: agent.instructions },
    skills: sortedUnique([...agent.skills, ...standard.skills]),
    capabilities: sortedUnique(standard.capabilities),
    environment: {
      id: environment.id,
      devcontainer: environment.devcontainer,
      egress: sortedUnique([...environment.egress, ...standard.egress]),
    },
  };
};

const sortedUnique = <Value extends string>(values: readonly Value[]): readonly Value[] => {
  return [...new Set(values)].toSorted();
};
