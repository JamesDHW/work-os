import { fauxAssistantMessage, fauxProvider, fauxText, fauxToolCall, type AssistantMessage, type Provider } from "@earendil-works/pi-ai";

import { SCRIPTED_MODEL_ID, SCRIPTED_PROVIDER_ID } from "../harness.constants.ts";
import type { ScriptedResponse } from "./ScriptedResponse.ts";

export const createScriptedProvider = (responses: readonly ScriptedResponse[]): Provider => {
  const scripted = fauxProvider({ provider: SCRIPTED_PROVIDER_ID, models: [{ id: SCRIPTED_MODEL_ID }] });
  scripted.setResponses(responses.map(toAssistantMessage));
  return scripted.provider;
};

const toAssistantMessage = (response: ScriptedResponse): AssistantMessage => {
  const textBlocks = response.text.length > 0 ? [fauxText(response.text)] : [];
  const toolCallBlocks = response.toolCalls.map((call) => fauxToolCall(call.name, call.arguments));
  const stopReason = toolCallBlocks.length > 0 ? "toolUse" : "stop";
  return fauxAssistantMessage([...textBlocks, ...toolCallBlocks], { stopReason });
};
