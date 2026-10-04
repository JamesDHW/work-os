import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import {
  AddRunCapabilityRequestSchema,
  RunDetailSchema,
  RunListQuerySchema,
  RunParamsSchema,
  RunSummarySchema,
  SendRunMessageRequestSchema,
  StartRunRequestSchema,
} from "@work-os/protocol/api/runs.schema";
import { WorkspaceParamsSchema } from "@work-os/protocol/api/workspaces.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonBody, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";
import { toRunDetailBody, toRunSummaryBody } from "./runBodies.ts";

export const registerRunRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const runParams = WorkspaceParamsSchema.extend(RunParamsSchema.shape);
  const runSummary = jsonResponse(RunSummarySchema, "The run.");

  const listRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/runs",
    request: { params: WorkspaceParamsSchema, query: RunListQuerySchema },
    responses: { 200: jsonResponse(z.array(RunSummarySchema), "Recent runs, newest first."), ...errorResponses },
  });
  app.openapi(listRoute, async (context) => {
    const runs = await services.runs.runStore.listRuns(context.get("workspace").id, context.req.valid("query"));
    if (runs instanceof WorkOsError) return respondWithError(context, runs);
    return context.json(runs.map(toRunSummaryBody), 200);
  });

  const startRoute = createRoute({
    method: "post",
    path: "/api/w/{workspaceId}/runs",
    request: { params: WorkspaceParamsSchema, ...jsonBody(StartRunRequestSchema) },
    responses: { 200: runSummary, ...errorResponses },
  });
  app.openapi(startRoute, async (context) => {
    const input = { ...context.req.valid("json"), workspaceId: context.get("workspace").id, userId: context.get("user").id };
    const run = await services.runs.startRun(input);
    if (run instanceof WorkOsError) return respondWithError(context, run);
    return context.json(toRunSummaryBody(run), 200);
  });

  const detailRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/runs/{runId}",
    request: { params: runParams },
    responses: { 200: jsonResponse(RunDetailSchema, "The run with its transcript and outputs."), ...errorResponses },
  });
  app.openapi(detailRoute, async (context) => {
    const detail = await services.runs.getRunDetail(context.get("workspace").id, context.req.valid("param").runId);
    if (detail instanceof WorkOsError) return respondWithError(context, detail);
    return context.json(toRunDetailBody(detail), 200);
  });

  const messageRoute = createRoute({
    method: "post",
    path: "/api/w/{workspaceId}/runs/{runId}/messages",
    request: { params: runParams, ...jsonBody(SendRunMessageRequestSchema) },
    responses: { 200: runSummary, ...errorResponses },
  });
  app.openapi(messageRoute, async (context) => {
    const input = { ...context.req.valid("json"), ...context.req.valid("param"), workspaceId: context.get("workspace").id };
    const run = await services.runs.sendRunMessage(input);
    if (run instanceof WorkOsError) return respondWithError(context, run);
    return context.json(toRunSummaryBody(run), 200);
  });

  const stopRoute = createRoute({
    method: "post",
    path: "/api/w/{workspaceId}/runs/{runId}/stop",
    request: { params: runParams },
    responses: { 200: runSummary, ...errorResponses },
  });
  app.openapi(stopRoute, async (context) => {
    const run = await services.runs.stopRun({ workspaceId: context.get("workspace").id, runId: context.req.valid("param").runId });
    if (run instanceof WorkOsError) return respondWithError(context, run);
    return context.json(toRunSummaryBody(run), 200);
  });

  const capabilityRoute = createRoute({
    method: "post",
    path: "/api/w/{workspaceId}/runs/{runId}/capabilities",
    request: { params: runParams, ...jsonBody(AddRunCapabilityRequestSchema) },
    responses: { 200: runSummary, ...errorResponses },
  });
  app.openapi(capabilityRoute, async (context) => {
    const input = { ...context.req.valid("json"), ...context.req.valid("param"), workspaceId: context.get("workspace").id };
    const run = await services.runs.addRunCapability(input);
    if (run instanceof WorkOsError) return respondWithError(context, run);
    return context.json(toRunSummaryBody(run), 200);
  });
};
