import type { CapabilityId, RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { CapabilityCallRecord, CapabilityCallStore } from "../capabilities/CapabilityCallStore.ts";
import type { AgentRuntime } from "./AgentRuntime.ts";
import { findWorkspaceRun } from "./findWorkspaceRun.ts";
import type { RunStore } from "./RunStore.ts";
import type { RunTranscript } from "./RunTranscript.ts";

export type RunDetail = {
  readonly run: Run;
  readonly transcript: RunTranscript;
  readonly capabilityCalls: readonly CapabilityCallRecord[];
  readonly capabilities: readonly CapabilityId[];
};

type GetRunDetailDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly agentRuntime: Pick<AgentRuntime, "readTranscript">;
  readonly capabilityCallStore: Pick<CapabilityCallStore, "listCapabilityCalls">;
};

export type GetRunDetail = (workspaceId: WorkspaceId, runId: RunId) => Promise<RunDetail | WorkOsError>;

export const createGetRunDetail = (dependencies: GetRunDetailDependencies): GetRunDetail => {
  return async (workspaceId, runId) => {
    const run = await findWorkspaceRun(dependencies.runStore, workspaceId, runId);
    if (run instanceof WorkOsError) return run;

    const [transcript, capabilityCalls] = await Promise.all([
      readTranscript(dependencies, run),
      dependencies.capabilityCallStore.listCapabilityCalls(run.id),
    ]);
    if (transcript instanceof WorkOsError) return transcript;
    if (capabilityCalls instanceof WorkOsError) return capabilityCalls;

    const capabilities = [...new Set([...run.spec.capabilities, ...run.addedCapabilities])].toSorted();
    return { run, transcript, capabilityCalls, capabilities };
  };
};

const readTranscript = async (dependencies: GetRunDetailDependencies, run: Run): Promise<RunTranscript | WorkOsError> => {
  if (run.conversationId === null) return { entries: [], streamingText: null };

  return dependencies.agentRuntime.readTranscript(run.conversationId);
};
