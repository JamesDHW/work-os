import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { ConnectionParamsSchema, ConnectionSchema, CreateConnectionRequestSchema } from "@work-os/protocol/api/connections.schema";
import { OkResponseSchema } from "@work-os/protocol/api/identity.schema";
import { WorkspaceParamsSchema } from "@work-os/protocol/api/workspaces.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonBody, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";

export const registerConnectionRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const listRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/connections",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(z.array(ConnectionSchema), "Connections; secrets are never returned."), ...errorResponses },
  });
  app.openapi(listRoute, async (context) => {
    const connections = await services.connections.connectionStore.listConnections(context.get("workspace").id);
    if (connections instanceof WorkOsError) return respondWithError(context, connections);
    return context.json(connections.map(({ sealedSecret, ...connection }) => connection), 200);
  });

  const createConnectionRoute = createRoute({
    method: "post",
    path: "/api/w/{workspaceId}/connections",
    request: { params: WorkspaceParamsSchema, ...jsonBody(CreateConnectionRequestSchema) },
    responses: { 200: jsonResponse(ConnectionSchema, "The new connection."), ...errorResponses },
  });
  app.openapi(createConnectionRoute, async (context) => {
    const connection = await services.connections.createConnection({ ...context.req.valid("json"), workspaceId: context.get("workspace").id });
    if (connection instanceof WorkOsError) return respondWithError(context, connection);
    return context.json(connection, 200);
  });

  const deleteRoute = createRoute({
    method: "delete",
    path: "/api/w/{workspaceId}/connections/{connectionId}",
    request: { params: WorkspaceParamsSchema.extend(ConnectionParamsSchema.shape) },
    responses: { 200: jsonResponse(OkResponseSchema, "The connection is deleted."), ...errorResponses },
  });
  app.openapi(deleteRoute, async (context) => {
    const deleted = await services.connections.connectionStore.deleteConnection(context.get("workspace").id, context.req.valid("param").connectionId);
    if (deleted instanceof WorkOsError) return respondWithError(context, deleted);
    return context.json({ ok: true } as const, 200);
  });
};
