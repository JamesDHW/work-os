import type { z } from "@hono/zod-openapi";
import type { RunDetail } from "@work-os/core/runs/getRunDetail";
import type { RunDetailSchema, RunSummarySchema } from "@work-os/protocol/api/runs.schema";
import type { Run } from "@work-os/domain/runs/Run";

import { toOpaqueJson } from "../http/toOpaqueJson.ts";

export type RunSummaryBody = z.output<typeof RunSummarySchema>;
export type RunDetailBody = z.output<typeof RunDetailSchema>;

export const toRunSummaryBody = (run: Run): RunSummaryBody => ({
  id: run.id,
  projectId: run.projectId,
  standardId: run.standardId,
  prompt: run.spec.prompt,
  state: run.state,
  summary: run.summary,
  createdAt: run.createdAt,
  updatedAt: run.updatedAt,
});

export const toRunDetailBody = (detail: RunDetail): RunDetailBody => ({
  run: toRunSummaryBody(detail.run),
  spec: toOpaqueJson(detail.run.spec),
  transcript: [...detail.transcript.entries],
  streamingText: detail.transcript.streamingText,
  changedFiles: [...(detail.run.outputs?.changedFiles ?? [])],
  diff: detail.run.outputs?.diff ?? null,
  capabilityCalls: detail.capabilityCalls.map((call) => ({ ...call, arguments: toOpaqueJson(call.arguments) })),
  capabilities: [...detail.capabilities],
});
