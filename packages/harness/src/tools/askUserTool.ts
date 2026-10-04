import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ToolRegistration } from "@earendil-works/pi-durable";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { readRunId } from "../runs/readRunId.ts";
import { errorResult, textResult } from "./toolResults.ts";

const AskUserParameters = Type.Object({
  question: Type.String({ description: "One focused question for the user." }),
  options: Type.Optional(Type.Array(Type.String(), { description: "Suggested answers, if the choice is closed." })),
});

export const createAskUserTool = (askUser: RunToolHandlers["askUser"]): ToolRegistration<typeof AskUserParameters> =>
  defineTool({
    name: "ask_user",
    description: "Ask the user a question and wait for the answer. Use it for decisions only the user can make.",
    parameters: AskUserParameters,
    replay: "safe",
    execute: async (args, api, context) => {
      const runId = await readRunId(api, api.conversationId, context);
      if (runId === null) return errorResult("This conversation is not attached to a run.");

      const answer = await askUser({ runId, taskId: String(api.taskId), question: args.question, options: args.options ?? [] });
      if (answer instanceof WorkOsError) return errorResult(answer.message);
      return textResult(answer);
    },
  });
