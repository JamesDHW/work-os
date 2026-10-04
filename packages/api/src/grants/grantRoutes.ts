import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { GrantParamsSchema, GrantSchema } from "@work-os/protocol/api/grants.schema";
import { OkResponseSchema } from "@work-os/protocol/api/identity.schema";
import { WorkspaceParamsSchema } from "@work-os/protocol/api/workspaces.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";

export const registerGrantRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const listRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/grants",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(z.array(GrantSchema), "Standing approvals."), ...errorResponses },
  });
  app.openapi(listRoute, async (context) => {
    const grants = await services.grants.grantStore.listGrants(context.get("workspace").id);
    if (grants instanceof WorkOsError) return respondWithError(context, grants);
    return context.json([...grants], 200);
  });

  const revokeRoute = createRoute({
    method: "delete",
    path: "/api/w/{workspaceId}/grants/{grantId}",
    request: { params: WorkspaceParamsSchema.extend(GrantParamsSchema.shape) },
    responses: { 200: jsonResponse(OkResponseSchema, "The approval is revoked."), ...errorResponses },
  });
  app.openapi(revokeRoute, async (context) => {
    const revoked = await services.grants.grantStore.revokeGrant(context.get("workspace").id, context.req.valid("param").grantId);
    if (revoked instanceof WorkOsError) return respondWithError(context, revoked);
    return context.json({ ok: true } as const, 200);
  });
};
