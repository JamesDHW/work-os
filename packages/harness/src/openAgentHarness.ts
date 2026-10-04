import { BACKGROUND_CONTEXT } from "@earendil-works/chord/context";
import type { Models } from "@earendil-works/pi-ai";
import { createRegistry, Harness, MemoryStorage, type Storage } from "@earendil-works/pi-durable";
import { openNodeSqliteStorage } from "@earendil-works/pi-durable/storage/sqlite/node";
import { CodingTools } from "@earendil-works/pi-durable/tools";
import type { AgentRuntime } from "@work-os/core/runs/AgentRuntime";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import type { Logger } from "@work-os/core/system/Logger";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { createWorkOsExtension } from "./createWorkOsExtension.ts";
import { createEnvironmentFactory } from "./environment/createEnvironmentFactory.ts";
import { createAgentRuntime } from "./runs/createAgentRuntime.ts";

export type AgentHarnessOptions = {
  readonly storage: { readonly kind: "file"; readonly path: string } | { readonly kind: "memory" };
  readonly models: Models;
  readonly handlers: RunToolHandlers;
  readonly logger: Logger;
};

export type AgentHarness = {
  readonly agentRuntime: AgentRuntime;
  readonly close: () => Promise<WorkOsError | undefined>;
};

export const openAgentHarness = async (options: AgentHarnessOptions): Promise<AgentHarness | WorkOsError> => {
  const storage = await openStorage(options.storage);
  if (storage instanceof WorkOsError) return storage;

  const registry = createRegistry();
  registry.install(CodingTools);
  registry.install(createWorkOsExtension(options.handlers));
  const harnessOptions = {
    models: options.models,
    registry,
    env: createEnvironmentFactory(options.handlers.execInRun),
    onReport: (error: unknown) => options.logger.warn("Agent harness reported a problem.", { message: String(error) }),
  };
  const harness = await tryCatchAsync(() => Harness.open(storage, harnessOptions, BACKGROUND_CONTEXT));
  if (harness instanceof WorkOsError) return harness;

  harness.resume();
  const agentRuntime = createAgentRuntime({ harness, handlers: options.handlers, logger: options.logger });
  const close = async (): Promise<WorkOsError | undefined> => {
    agentRuntime.stopWatching();
    const closed = await tryCatchAsync(() => harness.close(BACKGROUND_CONTEXT));
    return closed instanceof WorkOsError ? closed : undefined;
  };
  return { agentRuntime, close };
};

const openStorage = async (storage: AgentHarnessOptions["storage"]): Promise<Storage | WorkOsError> => {
  switch (storage.kind) {
    case "file":
      return tryCatchAsync(() => openNodeSqliteStorage(storage.path));
    case "memory":
      return new MemoryStorage();
    default:
      return storage satisfies never;
  }
};
