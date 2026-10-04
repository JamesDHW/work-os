import type { ServerConfig } from "@work-os/config/ServerConfig";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import type { Logger } from "@work-os/core/system/Logger";
import { createModelAccess } from "@work-os/harness/models/createModelAccess";
import { createScriptedProvider } from "@work-os/harness/models/createScriptedProvider";
import { openAgentHarness, type AgentHarness } from "@work-os/harness/openAgentHarness";
import { ScriptedResponsesSchema } from "@work-os/protocol/common/scriptedResponses.schema";
import { parseWithSchema } from "@work-os/protocol/common/parseWithSchema";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

export const openAgentLayer = async (config: ServerConfig, handlers: RunToolHandlers, logger: Logger): Promise<AgentHarness | WorkOsError> => {
  const scriptedProviders = readScriptedProviders(config.scriptedResponses);
  if (scriptedProviders instanceof WorkOsError) return scriptedProviders;

  const models = await createModelAccess({ lmStudioUrl: config.lmStudioUrl, extraProviders: scriptedProviders });
  if (models instanceof WorkOsError) return models;

  return openAgentHarness({ storage: { kind: "file", path: `${config.dataDirectory}/durable.sqlite` }, models, handlers, logger });
};

const readScriptedProviders = (scriptedResponses: string | null) => {
  if (scriptedResponses === null) return [];

  const json = tryCatch((): unknown => JSON.parse(scriptedResponses));
  const responses = parseWithSchema(ScriptedResponsesSchema, json, "WORK_OS_SCRIPTED_RESPONSES");
  if (responses instanceof WorkOsError) return responses;

  return [createScriptedProvider(responses)];
};
