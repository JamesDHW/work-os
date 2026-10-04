import type { CapabilityCall } from "@work-os/domain/capabilities/CapabilityCall";
import { decideApproval } from "@work-os/domain/capabilities/decideApproval";
import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RecordObservation } from "../observations/recordObservation.ts";
import type { RunStore } from "../runs/RunStore.ts";
import type { CallCapabilityInput } from "../runs/RunToolHandlers.ts";
import type { CapabilityCallStore } from "./CapabilityCallStore.ts";
import type { CapabilityImplementation, CapabilityRegistry } from "./CapabilityRegistry.ts";
import type { ExecuteCapability } from "./executeCapability.ts";
import type { GrantStore } from "./GrantStore.ts";
import type { SeekCapabilityApproval } from "./seekCapabilityApproval.ts";

type CallCapabilityDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly capabilityRegistry: Pick<CapabilityRegistry, "findCapability">;
  readonly capabilityCallStore: Pick<CapabilityCallStore, "findCapabilityCall">;
  readonly grantStore: Pick<GrantStore, "listGrants">;
  readonly seekCapabilityApproval: SeekCapabilityApproval;
  readonly executeCapability: ExecuteCapability;
  readonly recordObservation: RecordObservation;
};

export type CallCapability = (input: CallCapabilityInput) => Promise<string | WorkOsError>;

export const createCallCapability = (dependencies: CallCapabilityDependencies): CallCapability => {
  return async (input) => {
    const earlierCall = await dependencies.capabilityCallStore.findCapabilityCall(input.taskId);
    if (earlierCall instanceof WorkOsError) return earlierCall;
    const hasSettledEarlier = earlierCall !== null && earlierCall.status !== "pending";
    if (hasSettledEarlier) return earlierCall.result ?? earlierCall.status;

    const run = await dependencies.runStore.findRun(input.runId);
    if (run instanceof WorkOsError) return run;
    if (!isDeclared(run, input)) return refuseUndeclared(dependencies, run, input);

    const capability = await dependencies.capabilityRegistry.findCapability(run.workspaceId, input.capabilityId);
    if (capability instanceof WorkOsError) return `Capability ${input.capabilityId} is not available: ${capability.message}`;

    return authorizeAndExecute(dependencies, run, capability, input);
  };
};

const authorizeAndExecute = async (
  dependencies: CallCapabilityDependencies,
  run: Run,
  capability: CapabilityImplementation,
  input: CallCapabilityInput,
): Promise<string | WorkOsError> => {
  const grants = await dependencies.grantStore.listGrants(run.workspaceId);
  if (grants instanceof WorkOsError) return grants;

  const call: CapabilityCall = { ...input, standardId: run.standardId };
  const decision = decideApproval(capability.definition, call, grants);
  if (decision.kind === "allow") return dependencies.executeCapability({ run, capability, taskId: input.taskId, call });

  const approval = await dependencies.seekCapabilityApproval({ run, capability, taskId: input.taskId, call, durations: decision.durations });
  if (approval instanceof WorkOsError) return approval;
  if (approval.kind === "refused") return approval.message;

  return dependencies.executeCapability({ run, capability, taskId: input.taskId, call: approval.call });
};

const isDeclared = (run: Run, input: CallCapabilityInput): boolean => {
  return run.spec.capabilities.includes(input.capabilityId) || run.addedCapabilities.includes(input.capabilityId);
};

const refuseUndeclared = async (dependencies: CallCapabilityDependencies, run: Run, input: CallCapabilityInput): Promise<string> => {
  await dependencies.recordObservation({
    workspaceId: run.workspaceId,
    runId: run.id,
    kind: "capabilityRefused",
    detail: { capabilityId: input.capabilityId, reason: "undeclared" },
  });
  return `Capability ${input.capabilityId} is not declared for this run. Use ask_user to ask the user to add it.`;
};
