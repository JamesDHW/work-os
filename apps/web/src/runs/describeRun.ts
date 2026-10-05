import type { RunSummary } from "../api/apiTypes.ts";

export const describeRun = (run: RunSummary): string => {
  if (run.summary !== null) return run.summary;

  return run.prompt.trim().length > 0 ? run.prompt : `A ${run.standardId} run`;
};
