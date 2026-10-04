import type { RunnerLinkMessage } from "@work-os/protocol/link/linkMessage.schema";
import { ServerLinkMessageSchema } from "@work-os/protocol/link/linkMessage.schema";
import type { Sandbox } from "@work-os/sandbox/createSandbox";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { writeLogLine } from "./writeLogLine.ts";

export type SendToServer = (message: RunnerLinkMessage) => void;

export const handleServerMessage = async (sandbox: Sandbox, text: string, send: SendToServer): Promise<undefined> => {
  const parsed = ServerLinkMessageSchema.safeParse(tryCatch((): unknown => JSON.parse(text)));
  if (!parsed.success) {
    writeLogLine("warn", "Ignored an invalid message from the server.", { problem: parsed.error.message });
    return undefined;
  }
  const { requestId, request } = parsed.data;
  const streamsOutput = request.kind === "exec" && request.streamsOutput === true;
  const onOutput = (chunk: string): void => {
    if (streamsOutput) {
      send({ type: "output", requestId, chunk });
    }
  };
  const result = await sandbox.handle(request, onOutput);
  if (result instanceof WorkOsError) {
    send({ type: "failed", requestId, message: result.message });
    return undefined;
  }
  send({ type: "succeeded", requestId, result });
  return undefined;
};
