import type { Context } from "@earendil-works/chord";
import { LiveDoc, type ConversationId, type Harness } from "@earendil-works/pi-durable";

export const readStreamingText = async (harness: Harness, conversationId: ConversationId, context: Context): Promise<string | null> => {
  const live = await harness.snapshot(LiveDoc, conversationId, context);
  const content = live?.generation?.message?.content ?? [];
  const text = content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
  return text.length > 0 ? text : null;
};
