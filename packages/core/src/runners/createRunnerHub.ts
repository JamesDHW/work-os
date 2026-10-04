import type { RunnerId } from "@work-os/domain/identifiers/Identifiers";
import type { RunnerRequestKind } from "@work-os/domain/runners/RunnerRequest";
import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";
import { UnavailableError } from "@work-os/shared/UnavailableError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { RunnerOutputListener, RunnerRequestOf, RunnerResultOf } from "./RunnerGateway.ts";
import type { RunnerConnection, RunnerHub, RunnerReply } from "./RunnerHub.ts";

export class RunnerOfflineError extends UnavailableError {}
export class RunnerRequestFailedError extends WorkOsError {}

type PendingRequest = {
  readonly runnerId: RunnerId;
  readonly resolvers: PromiseWithResolvers<RunnerResult | WorkOsError>;
  readonly onOutput: RunnerOutputListener | undefined;
};

type CreateRunnerHubDependencies = {
  readonly randomSource: Pick<RandomSource, "createId">;
};

export const createRunnerHub = (dependencies: CreateRunnerHubDependencies): RunnerHub => {
  const connections = new Map<RunnerId, RunnerConnection>();
  const pendingRequests = new Map<string, PendingRequest>();

  const request = async <Kind extends RunnerRequestKind>(
    runnerId: RunnerId,
    runnerRequest: RunnerRequestOf<Kind>,
    onOutput?: RunnerOutputListener,
  ): Promise<RunnerResultOf<Kind> | WorkOsError> => {
    const connection = connections.get(runnerId);
    if (connection === undefined) return new RunnerOfflineError("The machine for this project is offline.");

    const requestId = dependencies.randomSource.createId();
    const resolvers = Promise.withResolvers<RunnerResult | WorkOsError>();
    pendingRequests.set(requestId, { runnerId, resolvers, onOutput });
    connection.send({ type: "request", requestId, request: runnerRequest });
    return narrowResult(await resolvers.promise, runnerRequest.kind);
  };

  const attach = (runnerId: RunnerId, connection: RunnerConnection): void => {
    connections.set(runnerId, connection);
  };

  const detach = (runnerId: RunnerId, connection: RunnerConnection): void => {
    if (connections.get(runnerId) !== connection) return;

    connections.delete(runnerId);
    const orphanedRequests = [...pendingRequests.entries()].filter(([, pending]) => pending.runnerId === runnerId);
    for (const [requestId, pending] of orphanedRequests) {
      pendingRequests.delete(requestId);
      pending.resolvers.resolve(new RunnerOfflineError("The machine disconnected before it answered."));
    }
  };

  const receive = (reply: RunnerReply): void => {
    const pending = pendingRequests.get(reply.requestId);
    if (pending === undefined) return;

    deliverReply(pendingRequests, pending, reply);
  };

  const isOnline = (runnerId: RunnerId): boolean => connections.has(runnerId);

  return { request, attach, detach, receive, isOnline };
};

const deliverReply = (pendingRequests: Map<string, PendingRequest>, pending: PendingRequest, reply: RunnerReply): void => {
  switch (reply.type) {
    case "output":
      pending.onOutput?.(reply.chunk);
      return;
    case "succeeded":
      pendingRequests.delete(reply.requestId);
      pending.resolvers.resolve(reply.result);
      return;
    case "failed":
      pendingRequests.delete(reply.requestId);
      pending.resolvers.resolve(new RunnerRequestFailedError(reply.message));
      return;
    default:
      return reply satisfies never;
  }
};

const narrowResult = <Kind extends RunnerRequestKind>(
  result: RunnerResult | WorkOsError,
  kind: Kind,
): RunnerResultOf<Kind> | WorkOsError => {
  const isExpectedReply = result instanceof WorkOsError || isResultOfKind(result, kind);
  if (isExpectedReply) return result;

  return new RunnerRequestFailedError(`The machine answered a ${kind} request with ${result.kind}.`);
};

const isResultOfKind = <Kind extends RunnerRequestKind>(result: RunnerResult, kind: Kind): result is RunnerResultOf<Kind> => {
  return result.kind === kind;
};
