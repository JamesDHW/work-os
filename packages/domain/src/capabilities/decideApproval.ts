import type { GrantId } from "../identifiers/Identifiers.ts";
import type { CapabilityCall } from "./CapabilityCall.ts";
import type { CapabilityDefinition } from "./CapabilityDefinition.ts";
import { IRREVERSIBLE_DURATIONS, REVERSIBLE_DURATIONS } from "./decideApproval.constants.ts";
import { findMatchingGrant } from "./findMatchingGrant.ts";
import type { Grant, GrantDuration } from "./Grant.ts";

export type ApprovalDecision =
  | { readonly kind: "allow"; readonly reason: "read" }
  | { readonly kind: "allow"; readonly reason: "grant"; readonly grantId: GrantId }
  | { readonly kind: "ask"; readonly durations: readonly GrantDuration[] };

export const decideApproval = (
  capability: CapabilityDefinition,
  call: CapabilityCall,
  grants: readonly Grant[],
): ApprovalDecision => {
  switch (capability.effect) {
    case "read":
      return { kind: "allow", reason: "read" };
    case "irreversible":
      return { kind: "ask", durations: IRREVERSIBLE_DURATIONS };
    case "reversible":
      return decideReversibleApproval(call, grants);
    default:
      return capability.effect satisfies never;
  }
};

const decideReversibleApproval = (call: CapabilityCall, grants: readonly Grant[]): ApprovalDecision => {
  const matchingGrant = findMatchingGrant(call, grants);
  if (matchingGrant !== undefined) return { kind: "allow", reason: "grant", grantId: matchingGrant.id };

  return { kind: "ask", durations: REVERSIBLE_DURATIONS };
};
