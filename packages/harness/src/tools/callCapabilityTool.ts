import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ToolRegistration } from "@earendil-works/pi-durable";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import { CapabilityIdSchema } from "@work-os/protocol/common/identifiers.schema";
import { JsonObjectSchema } from "@work-os/protocol/common/json.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { readRunId } from "../runs/readRunId.ts";
import { errorResult, textResult } from "./toolResults.ts";

const CallCapabilityParameters = Type.Object({
  capability: Type.String({ description: "Capability id, such as github.pr.create." }),
  target: Type.String({ description: "What the capability acts on, such as owner/name for a repository or a branch name." }),
  arguments: Type.Record(Type.String(), Type.Unknown(), { description: "Capability arguments as a JSON object." }),
});

export const createCallCapabilityTool = (callCapability: RunToolHandlers["callCapability"]): ToolRegistration<typeof CallCapabilityParameters> =>
  defineTool({
    name: "call_capability",
    description: "Use a declared capability to act outside the project folder. Some calls wait for the user's approval.",
    parameters: CallCapabilityParameters,
    replay: "safe",
    execute: async (args, api, context) => {
      const runId = await readRunId(api, api.conversationId, context);
      if (runId === null) return errorResult("This conversation is not attached to a run.");

      const capabilityId = CapabilityIdSchema.safeParse(args.capability);
      const capabilityArguments = JsonObjectSchema.safeParse(args.arguments);
      if (!capabilityId.success) return errorResult(`"${args.capability}" is not a capability id.`);
      if (!capabilityArguments.success) return errorResult("arguments must be a JSON object.");

      const call = { runId, taskId: String(api.taskId), capabilityId: capabilityId.data, target: args.target, arguments: capabilityArguments.data };
      const result = await callCapability(call);
      if (result instanceof WorkOsError) return errorResult(result.message);
      return textResult(result);
    },
  });
