import { createRoute, type OpenAPIHono } from "@hono/zod-openapi";
import {
  FolderListingSchema,
  FolderQuerySchema,
  PairingCodeResponseSchema,
  PairRunnerRequestSchema,
  PairRunnerResponseSchema,
  RunnerParamsSchema,
  RunnerSchema,
} from "@work-os/protocol/api/runners.schema";
import { WorkspaceParamsSchema } from "@work-os/protocol/api/workspaces.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { z } from "@hono/zod-openapi";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonBody, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";

export const registerRunnerRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const pairingCodeRoute = createRoute({
    method: "post",
    path: "/api/w/{workspaceId}/runners/pairing-codes",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(PairingCodeResponseSchema, "A one-time code for pairing a machine."), ...errorResponses },
  });
  app.openapi(pairingCodeRoute, async (context) => {
    return context.json(services.runners.pairingCodes.issuePairingCode(context.get("workspace").id), 200);
  });

  const pairRoute = createRoute({
    method: "post",
    path: "/api/runners/pair",
    request: jsonBody(PairRunnerRequestSchema),
    responses: { 200: jsonResponse(PairRunnerResponseSchema, "The machine's identity and token."), ...errorResponses },
  });
  app.openapi(pairRoute, async (context) => {
    const paired = await services.runners.pairRunner(context.req.valid("json"));
    if (paired instanceof WorkOsError) return respondWithError(context, paired);
    return context.json(paired, 200);
  });

  const listRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/runners",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(z.array(RunnerSchema), "Paired machines and whether they are online."), ...errorResponses },
  });
  app.openapi(listRoute, async (context) => {
    const runners = await services.runners.listRunners(context.get("workspace").id);
    if (runners instanceof WorkOsError) return respondWithError(context, runners);
    return context.json([...runners], 200);
  });

  const foldersRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/runners/{runnerId}/folders",
    request: { params: WorkspaceParamsSchema.extend(RunnerParamsSchema.shape), query: FolderQuerySchema },
    responses: { 200: jsonResponse(FolderListingSchema, "Folders on the machine."), ...errorResponses },
  });
  app.openapi(foldersRoute, async (context) => {
    const { runnerId } = context.req.valid("param");
    const query = context.req.valid("query");
    const listing = await services.runners.listRunnerFolders({ workspaceId: context.get("workspace").id, runnerId, ...query });
    if (listing instanceof WorkOsError) return respondWithError(context, listing);
    return context.json({ path: listing.path, parentPath: listing.parentPath, folders: [...listing.folders] }, 200);
  });
};
