import type { RunSummary } from "../api/apiTypes.ts";
import { ACTIVE_RUN_STATUSES } from "./runs.constants.ts";

export const isActiveRun = (run: RunSummary): boolean => ACTIVE_RUN_STATUSES.has(run.state.status);
