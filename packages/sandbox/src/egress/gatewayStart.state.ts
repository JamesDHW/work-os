import { WorkOsError } from "@work-os/shared/WorkOsError";

type StartAttempt = Promise<WorkOsError | undefined>;

export type GatewayStart = {
  /** The current start, shared by every caller; a start that failed is retried on the next call. */
  readonly ensure: () => StartAttempt;
};

// The runner lives longer than the conditions it starts in: Docker may be off, or the gateway image missing,
// when it boots. Remembering only a successful start lets the next run try again instead of repeating the error.
export const createGatewayStart = (start: () => StartAttempt): GatewayStart => {
  const state = new Map<"attempt", StartAttempt>();

  const attemptStart = async (): StartAttempt => {
    const outcome = await start();
    if (outcome instanceof WorkOsError) {
      state.delete("attempt");
    }
    return outcome;
  };

  const begin = (): StartAttempt => {
    const attempt = attemptStart();
    state.set("attempt", attempt);
    return attempt;
  };

  return { ensure: () => state.get("attempt") ?? begin() };
};
