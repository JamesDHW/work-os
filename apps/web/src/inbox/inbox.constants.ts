export const DURATION_LABELS = {
  once: "Allow once",
  run: "Allow for this run",
  standard: "Always allow for this standard",
} as const;

export const KIND_LABELS = {
  question: "Question",
  approval: "Approval",
  review: "Review",
  escalation: "Escalation",
} as const;

export const APPROVAL_DURATIONS = ["once", "run", "standard"] as const;
