import type { Message } from "@earendil-works/pi-ai";

export const messageText = (message: Message): string => {
  if (typeof message.content === "string") return message.content;

  const textBlocks = message.content.flatMap((block) => (block.type === "text" ? [block.text] : []));
  return textBlocks.join("\n").trim();
};
