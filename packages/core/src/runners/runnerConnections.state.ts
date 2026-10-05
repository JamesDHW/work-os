import type { RunnerId } from "@work-os/domain/identifiers/Identifiers";

import type { RunnerConnection } from "./RunnerHub.ts";

// The open link to each connected runner. A runner that reconnects replaces its old connection.
export type RunnerConnections = {
  readonly attach: (runnerId: RunnerId, connection: RunnerConnection) => void;
  readonly detach: (runnerId: RunnerId, connection: RunnerConnection) => boolean;
  readonly find: (runnerId: RunnerId) => RunnerConnection | undefined;
};

export const createRunnerConnections = (): RunnerConnections => {
  const connections = new Map<RunnerId, RunnerConnection>();

  return {
    attach: (runnerId, connection) => {
      connections.set(runnerId, connection);
    },
    detach: (runnerId, connection) => {
      const isCurrent = connections.get(runnerId) === connection;
      if (!isCurrent) return false;

      connections.delete(runnerId);
      return true;
    },
    find: (runnerId) => connections.get(runnerId),
  };
};
