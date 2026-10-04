import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { WorkspacePackages } from "../catalogue/WorkspacePackages.ts";
import type { RunStore } from "./RunStore.ts";
import type { LoadSkillInput } from "./RunToolHandlers.ts";

type LoadSkillDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly workspacePackages: Pick<WorkspacePackages, "readSkill">;
};

export type LoadSkill = (input: LoadSkillInput) => Promise<string | WorkOsError>;

export const createLoadSkill = (dependencies: LoadSkillDependencies): LoadSkill => {
  return async (input) => {
    const run = await dependencies.runStore.findRun(input.runId);
    if (run instanceof WorkOsError) return run;
    if (!run.spec.skills.includes(input.name)) return new InvalidRequestError(`Skill "${input.name}" is not available in this run.`);

    const skill = await dependencies.workspacePackages.readSkill(run.workspaceId, input.name);
    if (skill instanceof WorkOsError) return skill;

    return `# ${skill.name}\n\n${skill.description}\n\n${skill.body}`;
  };
};
