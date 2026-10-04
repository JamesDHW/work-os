import type { CapabilityId, RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { CapabilityRegistry } from "../capabilities/CapabilityRegistry.ts";
import type { EventBus } from "../events/EventBus.ts";
import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { AgentRuntime } from "./AgentRuntime.ts";
import { findWorkspaceRun } from "./findWorkspaceRun.ts";
import type { RunStore } from "./RunStore.ts";

export type AddRunCapabilityInput = {
  readonly workspaceId: WorkspaceId;
  readonly runId: RunId;
  readonly capabilityId: CapabilityId;
};

type AddRunCapabilityDependencies = {
  readonly runStore: Pick<RunStore, "findRun" | "updateRun">;
  readonly capabilityRegistry: Pick<CapabilityRegistry, "findCapability">;
  readonly agentRuntime: Pick<AgentRuntime, "submitMessage">;
  readonly eventBus: Pick<EventBus, "publish">;
  readonly randomSource: Pick<RandomSource, "createId">;
  readonly clock: SystemClock;
};

export type AddRunCapability = (input: AddRunCapabilityInput) => Promise<Run | WorkOsError>;

export const createAddRunCapability = (dependencies: AddRunCapabilityDependencies): AddRunCapability => {
  return async (input) => {
    const run = await findWorkspaceRun(dependencies.runStore, input.workspaceId, input.runId);
    if (run instanceof WorkOsError) return run;

    const capability = await dependencies.capabilityRegistry.findCapability(input.workspaceId, input.capabilityId);
    if (capability instanceof WorkOsError) return capability;

    const addedCapabilities = [...new Set([...run.addedCapabilities, input.capabilityId])];
    const updated = await dependencies.runStore.updateRun(run.id, { addedCapabilities, updatedAt: dependencies.clock.now() });
    if (updated instanceof WorkOsError) return updated;

    dependencies.eventBus.publish({ kind: "runUpdated", workspaceId: updated.workspaceId, runId: updated.id });
    return tellAgent(dependencies, updated, input.capabilityId);
  };
};

const tellAgent = async (dependencies: AddRunCapabilityDependencies, run: Run, capabilityId: CapabilityId): Promise<Run | WorkOsError> => {
  if (run.conversationId === null) return run;

  const text = `The user added the capability ${capabilityId} to this run. You can now use it with call_capability.`;
  const requestId = dependencies.randomSource.createId();
  const submitted = await dependencies.agentRuntime.submitMessage({ conversationId: run.conversationId, text, mode: "steer", requestId });
  if (submitted instanceof WorkOsError) return submitted;

  return run;
};
