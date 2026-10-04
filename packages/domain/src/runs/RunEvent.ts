import type { RunOutcome, WaitingReason } from "./RunState.ts";

export type RunEvent =
  | { readonly kind: "environmentReady" }
  | { readonly kind: "waitingStarted"; readonly reason: WaitingReason }
  | { readonly kind: "waitingEnded" }
  | { readonly kind: "completionRequested" }
  | { readonly kind: "checksFailed" }
  | { readonly kind: "checksPassed"; readonly isReviewRequired: boolean }
  | { readonly kind: "reviewDecided"; readonly outcome: RunOutcome }
  | { readonly kind: "reopened" }
  | { readonly kind: "stopped" }
  | { readonly kind: "failed"; readonly message: string };
