import type { StatusTone } from "../ui/StatusBadge/StatusBadge.tsx";

export type RunStatus = "preparing" | "running" | "waiting" | "checking" | "reviewing" | "completed" | "failed" | "stopped";

export const RUN_STATUS_TONES = {
  preparing: "queued",
  running: "run",
  waiting: "review",
  checking: "run",
  reviewing: "review",
  completed: "ok",
  failed: "danger",
  stopped: "queued",
} as const satisfies Readonly<Record<RunStatus, StatusTone>>;

export const RUN_STATUS_LABELS = {
  preparing: "Preparing",
  running: "Working",
  waiting: "Waiting for you",
  checking: "Checking",
  reviewing: "In review",
  completed: "Done",
  failed: "Failed",
  stopped: "Stopped",
} as const satisfies Readonly<Record<RunStatus, string>>;

export const ACTIVE_RUN_STATUSES: ReadonlySet<RunStatus> = new Set(["preparing", "running", "waiting", "checking", "reviewing"]);

export const WAITING_REASON_LABELS = {
  approval: "Waiting for an approval in the inbox.",
  question: "Waiting for your answer in the inbox.",
  input: "Waiting for your next message.",
  runnerOffline: "Waiting for the machine to come back online.",
} as const;

export const OUTCOME_LABELS = {
  accepted: "Accepted",
  rejected: "Rejected",
  unreviewed: "Finished without review",
} as const;

export const CHANGE_LABELS = {
  added: "A",
  modified: "M",
  deleted: "D",
} as const;

export const CALL_STATUS_TONES = {
  pending: "review",
  succeeded: "ok",
  failed: "danger",
  refused: "queued",
} as const satisfies Readonly<Record<"pending" | "succeeded" | "failed" | "refused", StatusTone>>;

export const MESSAGE_MODE_LABELS = {
  followUp: "After this turn",
  steer: "Interrupt now",
} as const;

export const TOOL_PREVIEW_LENGTH = 120;
