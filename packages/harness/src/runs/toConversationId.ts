import type { ConversationId } from "@earendil-works/pi-durable";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";

export const toConversationId = (value: string): ConversationId | InvalidRequestError => {
  const numericId = Number(value);
  if (!Number.isSafeInteger(numericId)) return new InvalidRequestError(`"${value}" is not a conversation id.`);

  // oxlint-disable-next-line architecture/no-type-assertions, typescript/no-unsafe-type-assertion -- Pi Durable brands conversation ids and exports no constructor; this text came from createConversation.
  return numericId as ConversationId;
};
