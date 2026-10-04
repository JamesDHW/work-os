import type { RunnerRequestMessage } from "@work-os/core/runners/RunnerHub";
import type { RunnerSession } from "@work-os/core/runners/connectRunner";
import type { Runner } from "@work-os/domain/runners/Runner";
import { RunnerLinkMessageSchema, type RunnerLinkMessage } from "@work-os/protocol/link/linkMessage.schema";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiServices } from "../ApiServices.ts";

export type LinkSocket = {
  readonly send: (text: string) => void;
  readonly close: (code: number, reason: string) => void;
};

export type LinkConnection = {
  readonly receive: (text: string, socket: LinkSocket) => Promise<undefined>;
  readonly close: () => Promise<undefined>;
};

type AttachedRunner = {
  readonly runner: Runner;
  readonly session: RunnerSession;
};

export const createLinkConnection = (services: ApiServices): LinkConnection => {
  const attachedRunners: AttachedRunner[] = [];

  const attach = async (token: string, socket: LinkSocket): Promise<undefined> => {
    const runner = await services.runners.authenticateRunner(token);
    if (runner instanceof WorkOsError) {
      socket.close(4401, runner.message);
      return undefined;
    }
    const send = (message: RunnerRequestMessage): void => socket.send(JSON.stringify(message));
    attachedRunners.push({ runner, session: await services.runners.connectRunner(runner, { send }) });
    return undefined;
  };

  const handle = async (message: RunnerLinkMessage, socket: LinkSocket): Promise<undefined> => {
    const attached = attachedRunners[0];
    if (message.type === "hello") return attached === undefined ? attach(message.token, socket) : undefined;
    if (attached === undefined) return undefined;

    switch (message.type) {
      case "succeeded":
      case "failed":
      case "output":
        services.runners.runnerHub.receive(message);
        return undefined;
      case "egressBlocked":
        return services.runners.recordEgressBlocked({ runnerId: attached.runner.id, runId: message.runId, host: message.host });
      default:
        return message satisfies never;
    }
  };

  return {
    receive: async (text, socket) => {
      const parsed = RunnerLinkMessageSchema.safeParse(tryCatch((): unknown => JSON.parse(text)));
      if (!parsed.success) {
        services.logger.warn("Ignored an invalid runner message.", { problem: parsed.error.message });
        return undefined;
      }
      return handle(parsed.data, socket);
    },
    close: async () => {
      const attached = attachedRunners.splice(0);
      await Promise.all(attached.map((entry) => entry.session.disconnect()));
      return undefined;
    },
  };
};
