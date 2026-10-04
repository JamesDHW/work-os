import type { Context } from "@earendil-works/chord";
import type { ConversationId, DocumentReader } from "@earendil-works/pi-durable";
import { toRunId, type RunId } from "@work-os/domain/identifiers/Identifiers";

import { RunLinkDoc } from "./RunLinkDoc.ts";

export const readRunId = async (reader: DocumentReader, conversationId: ConversationId, context: Context): Promise<RunId | null> => {
  const link = await reader.snapshot(RunLinkDoc, conversationId, context);
  const hasRun = link !== undefined && link.runId.length > 0;
  if (!hasRun) return null;

  return toRunId(link.runId);
};
