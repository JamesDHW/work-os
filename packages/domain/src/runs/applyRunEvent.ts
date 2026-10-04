import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RunEvent } from "./RunEvent.ts";
import type { RunState } from "./RunState.ts";

export class InvalidRunTransitionError extends WorkOsError {}

export const applyRunEvent = (state: RunState, event: RunEvent): RunState | InvalidRunTransitionError => {
  switch (event.kind) {
    case "stopped":
      return stopUnlessFinished(state);
    case "failed":
      return failUnlessFinished(state, event.message);
    case "environmentReady":
      return requireStatus(state, ["preparing"], event, { status: "running" });
    case "waitingStarted":
      return requireStatus(state, ["running", "waiting"], event, { status: "waiting", reason: event.reason });
    case "waitingEnded":
      return requireStatus(state, ["waiting"], event, { status: "running" });
    case "completionRequested":
      return requireStatus(state, ["running"], event, { status: "checking" });
    case "checksFailed":
      return requireStatus(state, ["checking"], event, { status: "running" });
    case "checksPassed":
      return requireStatus(state, ["checking"], event, decideAfterChecks(event.isReviewRequired));
    case "reviewDecided":
      return requireStatus(state, ["reviewing"], event, { status: "completed", outcome: event.outcome });
    case "reopened":
      return requireStatus(state, ["completed", "stopped", "failed"], event, { status: "preparing" });
    default:
      return event satisfies never;
  }
};

const isFinished = (state: RunState): boolean => {
  return state.status === "completed" || state.status === "stopped" || state.status === "failed";
};

const stopUnlessFinished = (state: RunState): RunState | InvalidRunTransitionError => {
  if (isFinished(state)) return new InvalidRunTransitionError(`A ${state.status} run cannot be stopped.`);
  return { status: "stopped" };
};

const failUnlessFinished = (state: RunState, message: string): RunState | InvalidRunTransitionError => {
  if (isFinished(state)) return new InvalidRunTransitionError(`A ${state.status} run cannot fail.`);
  return { status: "failed", message };
};

const decideAfterChecks = (isReviewRequired: boolean): RunState => {
  return isReviewRequired ? { status: "reviewing" } : { status: "completed", outcome: "unreviewed" };
};

const requireStatus = (
  state: RunState,
  allowedStatuses: readonly RunState["status"][],
  event: RunEvent,
  nextState: RunState,
): RunState | InvalidRunTransitionError => {
  if (!allowedStatuses.includes(state.status)) {
    return new InvalidRunTransitionError(`Event "${event.kind}" is not allowed while the run is ${state.status}.`);
  }
  return nextState;
};
