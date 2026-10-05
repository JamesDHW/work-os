import type { RunnerId } from "@work-os/domain/identifiers/Identifiers";
import type { RunnerRequestKind } from "@work-os/domain/runners/RunnerRequest";
import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";
import { UnavailableError } from "@work-os/shared/UnavailableError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { RunnerOutputListener, RunnerRequestOf, RunnerResultOf } from "./RunnerGateway.ts";
import { createPendingRequests, type PendingRequest, type PendingRequests } from "./pendingRequests.state.ts";
import type { RunnerConnection, RunnerHub, RunnerReply } from "./RunnerHub.ts";
import { createRunnerConnections } from "./runnerConnections.state.ts";

export class RunnerOfflineError extends UnavailableError {}
export class RunnerRequestFailedError extends WorkOsError {}

type CreateRunnerHubDependencies = {
  readonly randomSource: Pick<RandomSource, "createId">;
};

export const createRunnerHub = (dependencies: CreateRunnerHubDependencies): RunnerHub => {
  const connections = createRunnerConnections();
  const pendingRequests = createPendingRequests();

  const request = async <Kind extends RunnerRequestKind>(
    runnerId: RunnerId,
    runnerRequest: RunnerRequestOf<Kind>,
    onOutput?: RunnerOutputListener,
  ): Promise<RunnerResultOf<Kind> | WorkOsError> => {
    const connection = connections.find(runnerId);
    if (connection === undefined) return new RunnerOfflineError("The machine for this project is offline.");

    const requestId = dependencies.randomSource.createId();
    const resolvers = Promise.withResolvers<RunnerResult | WorkOsError>();
    pendingRequests.add(requestId, { runnerId, resolvers, onOutput });
    connection.send({ type: "request", requestId, request: runnerRequest });
    return narrowResult(await resolvers.promise, runnerRequest.kind);
  };

  const detach = (runnerId: RunnerId, connection: RunnerConnection): void => {
    const wasCurrent = connections.detach(runnerId, connection);
    if (!wasCurrent) return;

    for (const pending of pendingRequests.takeForRunner(runnerId)) {
      pending.resolvers.resolve(new RunnerOfflineError("The machine disconnected before it answered."));
    }
  };

  const receive = (reply: RunnerReply): void => {
    const pending = pendingRequests.find(reply.requestId);
    if (pending === undefined) return;

    deliverReply(pendingRequests, pending, reply);
  };

  const isOnline = (runnerId: RunnerId): boolean => connections.find(runnerId) !== undefined;

  return { request, attach: connections.attach, detach, receive, isOnline };
};

const deliverReply = (pendingRequests: PendingRequests, pending: PendingRequest, reply: RunnerReply): void => {
  switch (reply.type) {
    case "output":
      pending.onOutput?.(reply.chunk);
      return;
    case "succeeded":
      pendingRequests.take(reply.requestId);
      pending.resolvers.resolve(reply.result);
      return;
    case "failed":
      pendingRequests.take(reply.requestId);
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
