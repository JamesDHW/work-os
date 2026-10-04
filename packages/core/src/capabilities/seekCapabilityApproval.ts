import type { CapabilityCall } from "@work-os/domain/capabilities/CapabilityCall";
import type { GrantDuration } from "@work-os/domain/capabilities/Grant";
import type { InboxItemState } from "@work-os/domain/inbox/InboxItem";
import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RecordObservation } from "../observations/recordObservation.ts";
import type { AwaitRunDecision } from "../runs/awaitRunDecision.ts";
import type { CapabilityImplementation } from "./CapabilityRegistry.ts";
import type { RecordGrant } from "./recordGrant.ts";

export type CapabilityApprovalRequest = {
  readonly run: Run;
  readonly capability: CapabilityImplementation;
  readonly taskId: string;
  readonly call: CapabilityCall;
  readonly durations: readonly GrantDuration[];
};

export type CapabilityApproval =
  | { readonly kind: "approved"; readonly call: CapabilityCall }
  | { readonly kind: "refused"; readonly message: string };

type SeekCapabilityApprovalDependencies = {
  readonly awaitRunDecision: AwaitRunDecision;
  readonly recordGrant: RecordGrant;
  readonly recordObservation: RecordObservation;
};

export type SeekCapabilityApproval = (request: CapabilityApprovalRequest) => Promise<CapabilityApproval | WorkOsError>;

export const createSeekCapabilityApproval = (dependencies: SeekCapabilityApprovalDependencies): SeekCapabilityApproval => {
  return async (request) => {
    const { call, capability } = request;
    const closedState = await dependencies.awaitRunDecision({
      run: request.run,
      taskId: request.taskId,
      origin: { kind: "capabilityApproval", taskId: request.taskId },
      title: `Allow ${call.capabilityId} on ${call.target}?`,
      payload: {
        kind: "approval",
        capabilityId: call.capabilityId,
        target: call.target,
        arguments: call.arguments,
        editableFields: capability.definition.editableFields,
        durations: request.durations,
      },
      waitingReason: "approval",
    });
    if (closedState instanceof WorkOsError) return closedState;

    return interpretDecision(dependencies, request, closedState);
  };
};

const interpretDecision = async (
  dependencies: SeekCapabilityApprovalDependencies,
  request: CapabilityApprovalRequest,
  state: InboxItemState,
): Promise<CapabilityApproval | WorkOsError> => {
  const isApproved = state.status === "answered" && state.answer.kind === "approve";
  if (!isApproved) return refuse(dependencies, request, state);

  const approvedCall = { ...request.call, arguments: { ...request.call.arguments, ...state.answer.editedArguments } };
  const grant = await dependencies.recordGrant({ run: request.run, call: approvedCall, duration: state.answer.duration, approvedBy: state.answeredBy });
  if (grant instanceof WorkOsError) return grant;

  return { kind: "approved", call: approvedCall };
};

const refuse = async (
  dependencies: SeekCapabilityApprovalDependencies,
  request: CapabilityApprovalRequest,
  state: InboxItemState,
): Promise<CapabilityApproval> => {
  const reason = describeRefusalReason(state);
  await dependencies.recordObservation({
    workspaceId: request.run.workspaceId,
    runId: request.run.id,
    kind: "capabilityRefused",
    detail: { capabilityId: request.call.capabilityId, reason },
  });
  return { kind: "refused", message: `The user did not allow ${request.call.capabilityId}. ${reason}`.trim() };
};

const describeRefusalReason = (state: InboxItemState): string => {
  if (state.status !== "answered") return "The request was withdrawn.";
  if (state.answer.kind !== "reject") return "";

  return state.answer.reason ?? "";
};
