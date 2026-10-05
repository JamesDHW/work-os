export const REVIEW_MODES = ["required", "optional", "none"] as const;

export const REVIEW_MODE_LABELS = {
  required: "Required: a person accepts every run",
  optional: "Optional: finished runs can be reviewed later",
  none: "None: runs finish on their own",
} as const;

export const STANDARD_TEXT_FIELDS = ["describes", "consumer", "agentId", "skills", "egress", "checks", "inputHint", "criteria", "method"] as const;
