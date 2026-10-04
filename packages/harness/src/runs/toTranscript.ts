import type { AssistantMessage, Message } from "@earendil-works/pi-ai";
import type { EntryRecord } from "@earendil-works/pi-durable";
import type { TranscriptEntry } from "@work-os/core/runs/RunTranscript";

import { messageText } from "./messageText.ts";

export const toTranscript = (entries: readonly EntryRecord[]): readonly TranscriptEntry[] => {
  return entries.flatMap((entry) => (entry.model ?? []).flatMap((message, index) => describeMessage(`${entry.id}:${index}`, message)));
};

const describeMessage = (id: string, message: Message): readonly TranscriptEntry[] => {
  switch (message.role) {
    case "user":
      return [{ id, role: "user", text: messageText(message), toolName: null, isError: false }];
    case "assistant":
      return describeAssistant(id, message);
    case "toolResult":
      return [{ id, role: "tool", text: messageText(message), toolName: message.toolName, isError: message.isError }];
    case "system":
      return [];
    default:
      return message satisfies never;
  }
};

const describeAssistant = (id: string, message: AssistantMessage): readonly TranscriptEntry[] => {
  const text = messageText(message);
  const textEntries: readonly TranscriptEntry[] = text.length > 0 ? [{ id, role: "assistant", text, toolName: null, isError: false }] : [];
  const errorEntries: readonly TranscriptEntry[] =
    message.stopReason === "error" ? [{ id: `${id}:error`, role: "assistant", text: message.errorMessage ?? "The model call failed.", toolName: null, isError: true }] : [];
  const toolCalls = message.content.flatMap((block) => (block.type === "toolCall" ? [block] : []));
  const callEntries = toolCalls.map((call): TranscriptEntry => ({
    id: `${id}:${call.id}`,
    role: "tool",
    text: JSON.stringify(call.arguments),
    toolName: call.name,
    isError: false,
  }));
  return [...textEntries, ...errorEntries, ...callEntries];
};
