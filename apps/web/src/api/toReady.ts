import type { LoadResult } from "./LoadResult.ts";

export const toReady = <Value>(value: Value): LoadResult<Value> => ({ kind: "ready", value });
