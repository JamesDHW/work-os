import type { RunnerId } from "@work-os/domain/identifiers/Identifiers";
import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RunnerOutputListener } from "./RunnerGateway.ts";

export type PendingRequest = {
  readonly runnerId: RunnerId;
  readonly resolvers: PromiseWithResolvers<RunnerResult | WorkOsError>;
  readonly onOutput: RunnerOutputListener | undefined;
};

// Requests sent to a runner that are still waiting for its reply, by request id.
export type PendingRequests = {
  readonly add: (requestId: string, pending: PendingRequest) => void;
  readonly find: (requestId: string) => PendingRequest | undefined;
  readonly take: (requestId: string) => PendingRequest | undefined;
  readonly takeForRunner: (runnerId: RunnerId) => readonly PendingRequest[];
};

export const createPendingRequests = (): PendingRequests => {
  const pending = new Map<string, PendingRequest>();

  const take = (requestId: string): PendingRequest | undefined => {
    const request = pending.get(requestId);
    pending.delete(requestId);
    return request;
  };

  return {
    add: (requestId, request) => {
      pending.set(requestId, request);
    },
    find: (requestId) => pending.get(requestId),
    take,
    takeForRunner: (runnerId) => {
      const requestIds = [...pending.entries()].filter(([, request]) => request.runnerId === runnerId).map(([requestId]) => requestId);
      return requestIds.flatMap((requestId) => take(requestId) ?? []);
    },
  };
};
