import { describeFailure } from "./describeFailure.ts";
import type { LoadFailure } from "./LoadResult.ts";

type FailedResponse = Parameters<typeof describeFailure>[0];

export const toFailure = (result: FailedResponse): LoadFailure => ({ kind: "failed", message: describeFailure(result) ?? "The server sent an empty response." });
