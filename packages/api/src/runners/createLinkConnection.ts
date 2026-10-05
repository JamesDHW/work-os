import type { RunnerRequestMessage } from "@work-os/core/runners/RunnerHub";
import type { RunnerSession } from "@work-os/core/runners/connectRunner";
import type { Runner } from "@work-os/domain/runners/Runner";
import { RunnerLinkMessageSchema, type RunnerLinkMessage } from "@work-os/protocol/link/linkMessage.schema";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiServices } from "../ApiServices.ts";
import { BEARER_PREFIX, RUNNER_LINK_UNAUTHORIZED_CLOSE_CODE } from "../http/http.constants.ts";

export type LinkSocket = {
  readonly send: (text: string) => void;
  readonly close: (code: number, reason: string) => void;
};

export type LinkConnection = {
  readonly open: (socket: LinkSocket) => void;
  readonly receive: (text: string) => Promise<undefined>;
  readonly close: () => Promise<undefined>;
};

// The runner sends its token with the WebSocket upgrade, so each connection knows its runner from the start.
// The socket arrives once the upgrade completes; the session starts as soon as it does.
export const createLinkConnection = async (services: ApiServices, authorization: string | undefined): Promise<LinkConnection> => {
  const token = authorization?.startsWith(BEARER_PREFIX) === true ? authorization.slice(BEARER_PREFIX.length) : "";
  const runner = await services.runners.authenticateRunner(token);
  if (runner instanceof WorkOsError) return rejectedConnection(runner.message);

  const opened = Promise.withResolvers<LinkSocket>();
  const session = startSession(services, runner, opened.promise);
  return {
    open: (socket) => opened.resolve(socket),
    receive: async (text) => receiveMessage(services, runner, text),
    close: async () => {
      const started = await session;
      return started.disconnect();
    },
  };
};

const rejectedConnection = (reason: string): LinkConnection => ({
  open: (socket) => socket.close(RUNNER_LINK_UNAUTHORIZED_CLOSE_CODE, reason),
  receive: async () => undefined,
  close: async () => undefined,
});

const startSession = async (services: ApiServices, runner: Runner, opened: Promise<LinkSocket>): Promise<RunnerSession> => {
  const socket = await opened;
  const send = (message: RunnerRequestMessage): void => socket.send(JSON.stringify(message));
  return services.runners.connectRunner(runner, { send });
};

const receiveMessage = async (services: ApiServices, runner: Runner, text: string): Promise<undefined> => {
  const parsed = RunnerLinkMessageSchema.safeParse(tryCatch((): unknown => JSON.parse(text)));
  if (!parsed.success) {
    services.logger.warn("Ignored an invalid runner message.", { problem: parsed.error.message });
    return undefined;
  }
  return handleMessage(services, runner, parsed.data);
};

const handleMessage = async (services: ApiServices, runner: Runner, message: RunnerLinkMessage): Promise<undefined> => {
  switch (message.type) {
    case "succeeded":
    case "failed":
    case "output":
      services.runners.runnerHub.receive(message);
      return undefined;
    case "egressBlocked":
      return services.runners.recordEgressBlocked({ runnerId: runner.id, runId: message.runId, host: message.host });
    default:
      return message satisfies never;
  }
};
