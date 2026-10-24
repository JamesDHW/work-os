import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { OkResponseSchema } from "@work-os/protocol/api/identity.schema";
import { AvailableModelsResponseSchema, DefaultModelSchema, ModelProviderParamsSchema, ModelProviderSchema, SaveModelProviderRequestSchema } from "@work-os/protocol/api/models.schema";
import { WorkspaceParamsSchema } from "@work-os/protocol/api/workspaces.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonBody, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";
import { createRequireUser } from "../middleware/requireUser.ts";

// Providers are server-wide (one person runs this server); the default model belongs to a workspace's package.
export const registerModelRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const requireUser = createRequireUser(services);

  const listProvidersRoute = createRoute({
    method: "get",
    path: "/api/models/providers",
    middleware: [requireUser] as const,
    responses: { 200: jsonResponse(z.array(ModelProviderSchema), "Configured model providers."), ...errorResponses },
  });
  app.openapi(listProvidersRoute, async (context) => {
    const providers = await services.models.listModelProviders();
    if (providers instanceof WorkOsError) return respondWithError(context, providers);
    return context.json([...providers], 200);
  });

  const saveProviderRoute = createRoute({
    method: "put",
    path: "/api/models/providers/{providerId}",
    middleware: [requireUser] as const,
    request: { params: ModelProviderParamsSchema, ...jsonBody(SaveModelProviderRequestSchema) },
    responses: { 200: jsonResponse(ModelProviderSchema, "The provider, saved and refreshed."), ...errorResponses },
  });
  app.openapi(saveProviderRoute, async (context) => {
    const body = context.req.valid("json");
    const saved = await services.models.saveModelProvider({ requestedId: context.req.valid("param").providerId, kind: body.kind, name: body.name, baseUrl: body.baseUrl, apiKey: body.apiKey });
    if (saved instanceof WorkOsError) return respondWithError(context, saved);
    return context.json({ ...saved, source: "settings" as const }, 200);
  });

  const deleteProviderRoute = createRoute({
    method: "delete",
    path: "/api/models/providers/{providerId}",
    middleware: [requireUser] as const,
    request: { params: ModelProviderParamsSchema },
    responses: { 200: jsonResponse(OkResponseSchema, "The provider is removed."), ...errorResponses },
  });
  app.openapi(deleteProviderRoute, async (context) => {
    const deleted = await services.models.deleteModelProvider(context.req.valid("param").providerId);
    if (deleted instanceof WorkOsError) return respondWithError(context, deleted);
    return context.json({ ok: true } as const, 200);
  });

  const availableModelsRoute = createRoute({
    method: "get",
    path: "/api/models",
    middleware: [requireUser] as const,
    responses: { 200: jsonResponse(AvailableModelsResponseSchema, "Models the configured providers can serve."), ...errorResponses },
  });
  app.openapi(availableModelsRoute, async (context) => {
    const models = await services.models.listAvailableModels();
    if (models instanceof WorkOsError) return respondWithError(context, models);
    return context.json({ models: [...models] }, 200);
  });

  const defaultModelRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/models/default",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(DefaultModelSchema, "The workspace's default model."), ...errorResponses },
  });
  app.openapi(defaultModelRoute, async (context) => {
    const model = await services.models.readDefaultModel(context.get("workspace").id);
    if (model instanceof WorkOsError) return respondWithError(context, model);
    return context.json({ model }, 200);
  });

  const saveDefaultModelRoute = createRoute({
    method: "put",
    path: "/api/w/{workspaceId}/models/default",
    request: { params: WorkspaceParamsSchema, ...jsonBody(DefaultModelSchema) },
    responses: { 200: jsonResponse(DefaultModelSchema, "The default model is saved in the workspace package."), ...errorResponses },
  });
  app.openapi(saveDefaultModelRoute, async (context) => {
    const { model } = context.req.valid("json");
    const saved = await services.models.saveDefaultModel(context.get("workspace").id, model);
    if (saved instanceof WorkOsError) return respondWithError(context, saved);
    return context.json({ model }, 200);
  });
};
