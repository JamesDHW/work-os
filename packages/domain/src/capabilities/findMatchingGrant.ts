import type { CapabilityCall } from "./CapabilityCall.ts";
import type { Grant, GrantScope } from "./Grant.ts";

export const findMatchingGrant = (call: CapabilityCall, grants: readonly Grant[]): Grant | undefined => {
  return grants.find((grant) => isGrantForCall(grant, call));
};

const isGrantForCall = (grant: Grant, call: CapabilityCall): boolean => {
  const isSameOperation = grant.capabilityId === call.capabilityId && grant.target === call.target;
  return isSameOperation && isScopeForCall(grant.scope, call);
};

const isScopeForCall = (scope: GrantScope, call: CapabilityCall): boolean => {
  switch (scope.kind) {
    case "run":
      return scope.runId === call.runId;
    case "standard":
      return scope.standardId === call.standardId;
    default:
      return scope satisfies never;
  }
};
