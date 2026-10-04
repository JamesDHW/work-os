import type { Message } from "@earendil-works/pi-ai";

import { messageText } from "./messageText.ts";

export const findSettledAnswer = (messages: readonly Message[]): string | null => {
  const lastMessage = messages.at(-1);
  if (lastMessage?.role !== "assistant") return null;

  switch (lastMessage.stopReason) {
    case "error":
      return `The model call failed: ${lastMessage.errorMessage ?? "unknown error"}. Reply to try again.`;
    case "toolUse":
    case "pending":
    case "deferred":
      return null;
    case "stop":
    case "length":
    case "aborted":
      return messageText(lastMessage);
    default:
      return lastMessage.stopReason satisfies never;
  }
};
