export type WaitingReason = "approval" | "question" | "input" | "runnerOffline";
export type RunOutcome = "accepted" | "rejected" | "unreviewed";

export type RunState =
  | { readonly status: "preparing" }
  | { readonly status: "running" }
  | { readonly status: "waiting"; readonly reason: WaitingReason }
  | { readonly status: "checking" }
  | { readonly status: "reviewing" }
  | { readonly status: "completed"; readonly outcome: RunOutcome }
  | { readonly status: "failed"; readonly message: string }
  | { readonly status: "stopped" };

export type RunStatus = RunState["status"];
