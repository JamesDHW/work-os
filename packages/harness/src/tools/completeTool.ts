import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ToolRegistration } from "@earendil-works/pi-durable";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { readRunId } from "../runs/readRunId.ts";
import { errorResult, finalResult, textResult } from "./toolResults.ts";

const CompleteParameters = Type.Object({
  summary: Type.String({ description: "What you changed and why, and anything the reviewer should check." }),
});

export const createCompleteTool = (completeRun: RunToolHandlers["completeRun"]): ToolRegistration<typeof CompleteParameters> =>
  defineTool({
    name: "complete",
    description: "Finish the run when the work meets the standard. Checks run; failures come back to you.",
    parameters: CompleteParameters,
    execute: async (args, api, context) => {
      const runId = await readRunId(api, api.conversationId, context);
      if (runId === null) return errorResult("This conversation is not attached to a run.");

      const completion = await completeRun({ runId, summary: args.summary });
      if (completion instanceof WorkOsError) return errorResult(completion.message);
      if (completion.isFinished) return finalResult(completion.message);
      return textResult(completion.message);
    },
  });
