import type { GrantDuration } from "./Grant.ts";

export const IRREVERSIBLE_DURATIONS: readonly GrantDuration[] = ["once"];
export const REVERSIBLE_DURATIONS: readonly GrantDuration[] = ["once", "run", "standard"];
