import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ToolRegistration } from "@earendil-works/pi-durable";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { readRunId } from "../runs/readRunId.ts";
import { errorResult, textResult } from "./toolResults.ts";

const LoadSkillParameters = Type.Object({ name: Type.String({ description: "Skill name from the run's skill list." }) });

export const createLoadSkillTool = (loadSkill: RunToolHandlers["loadSkill"]): ToolRegistration<typeof LoadSkillParameters> =>
  defineTool({
    name: "load_skill",
    description: "Load a skill's instructions by name.",
    parameters: LoadSkillParameters,
    replay: "safe",
    execute: async (args, api, context) => {
      const runId = await readRunId(api, api.conversationId, context);
      if (runId === null) return errorResult("This conversation is not attached to a run.");

      const skill = await loadSkill({ runId, name: args.name });
      if (skill instanceof WorkOsError) return errorResult(skill.message);
      return textResult(skill);
    },
  });
