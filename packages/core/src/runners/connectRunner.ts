import type { Runner } from "@work-os/domain/runners/Runner";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { EventBus } from "../events/EventBus.ts";
import type { Logger } from "../system/Logger.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { RunnerConnection, RunnerHub } from "./RunnerHub.ts";
import type { RunnerStore } from "./RunnerStore.ts";

export type RunnerSession = {
  readonly disconnect: () => Promise<undefined>;
};

type ConnectRunnerDependencies = {
  readonly runnerHub: Pick<RunnerHub, "attach" | "detach">;
  readonly runnerStore: Pick<RunnerStore, "markRunnerSeen">;
  readonly eventBus: Pick<EventBus, "publish">;
  readonly logger: Logger;
  readonly clock: SystemClock;
};

export type ConnectRunner = (runner: Runner, connection: RunnerConnection) => Promise<RunnerSession>;

export const createConnectRunner = (dependencies: ConnectRunnerDependencies): ConnectRunner => {
  return async (runner, connection) => {
    dependencies.runnerHub.attach(runner.id, connection);
    await markSeen(dependencies, runner);
    dependencies.logger.info("Runner connected.", { runnerId: runner.id, name: runner.name });

    const disconnect = async (): Promise<undefined> => {
      dependencies.runnerHub.detach(runner.id, connection);
      await markSeen(dependencies, runner);
      dependencies.logger.info("Runner disconnected.", { runnerId: runner.id });
      return undefined;
    };
    return { disconnect };
  };
};

const markSeen = async (dependencies: ConnectRunnerDependencies, runner: Runner): Promise<undefined> => {
  const marked = await dependencies.runnerStore.markRunnerSeen(runner.id, dependencies.clock.now());
  if (marked instanceof WorkOsError) {
    dependencies.logger.warn("Could not record runner presence.", { message: marked.message });
  }
  dependencies.eventBus.publish({ kind: "runnersUpdated", workspaceId: runner.workspaceId });
  return undefined;
};
