import { defineExtension, type Extension } from "@earendil-works/pi-durable";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";

import { WORK_OS_EXTENSION_NAME } from "./harness.constants.ts";
import { createAskUserTool } from "./tools/askUserTool.ts";
import { createCallCapabilityTool } from "./tools/callCapabilityTool.ts";
import { createCompleteTool } from "./tools/completeTool.ts";
import { createLoadSkillTool } from "./tools/loadSkillTool.ts";

export const createWorkOsExtension = (handlers: RunToolHandlers): Extension =>
  defineExtension({
    name: WORK_OS_EXTENSION_NAME,
    tools: [
      createAskUserTool(handlers.askUser),
      createCallCapabilityTool(handlers.callCapability),
      createCompleteTool(handlers.completeRun),
      createLoadSkillTool(handlers.loadSkill),
    ],
  });
