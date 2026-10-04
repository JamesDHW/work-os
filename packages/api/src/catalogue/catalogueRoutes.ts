import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import {
  AgentPresetSchema,
  CapabilitySchema,
  EnvironmentSchema,
  SaveStandardRequestSchema,
  StandardParamsSchema,
  StandardSchema,
} from "@work-os/protocol/api/catalogue.schema";
import { WorkspaceParamsSchema } from "@work-os/protocol/api/workspaces.schema";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonBody, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";
import { toAgentBody, toCapabilityBody, toEnvironmentBody, toStandardBody } from "./catalogueBodies.ts";

export const registerCatalogueRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const packages = services.catalogue.workspacePackages;
  const standardParams = WorkspaceParamsSchema.extend(StandardParamsSchema.shape);

  const listStandardsRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/standards",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(z.array(StandardSchema), "Standards in the workspace and the packages it extends."), ...errorResponses },
  });
  app.openapi(listStandardsRoute, async (context) => {
    const standards = await packages.listStandards(context.get("workspace").id);
    if (standards instanceof WorkOsError) return respondWithError(context, standards);
    return context.json(standards.map(toStandardBody), 200);
  });

  const getStandardRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/standards/{standardId}",
    request: { params: standardParams },
    responses: { 200: jsonResponse(StandardSchema, "The standard."), ...errorResponses },
  });
  app.openapi(getStandardRoute, async (context) => {
    const standard = await packages.readStandard(context.get("workspace").id, context.req.valid("param").standardId);
    if (standard instanceof WorkOsError) return respondWithError(context, standard);
    return context.json(toStandardBody(standard), 200);
  });

  const saveStandardRoute = createRoute({
    method: "put",
    path: "/api/w/{workspaceId}/standards/{standardId}",
    request: { params: standardParams, ...jsonBody(SaveStandardRequestSchema) },
    responses: { 200: jsonResponse(StandardSchema, "The saved standard."), ...errorResponses },
  });
  app.openapi(saveStandardRoute, async (context) => {
    const standard = context.req.valid("json");
    if (standard.id !== context.req.valid("param").standardId) return respondWithError(context, new InvalidRequestError("The id in the body must match the path."));

    const saved = await services.catalogue.saveStandard({ workspaceId: context.get("workspace").id, standard });
    if (saved instanceof WorkOsError) return respondWithError(context, saved);
    return context.json(toStandardBody(saved), 200);
  });

  const listAgentsRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/agents",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(z.array(AgentPresetSchema), "Agent presets."), ...errorResponses },
  });
  app.openapi(listAgentsRoute, async (context) => {
    const agents = await packages.listAgents(context.get("workspace").id);
    if (agents instanceof WorkOsError) return respondWithError(context, agents);
    return context.json(agents.map(toAgentBody), 200);
  });

  const listEnvironmentsRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/environments",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(z.array(EnvironmentSchema), "Environment definitions."), ...errorResponses },
  });
  app.openapi(listEnvironmentsRoute, async (context) => {
    const environments = await packages.listEnvironments(context.get("workspace").id);
    if (environments instanceof WorkOsError) return respondWithError(context, environments);
    return context.json(environments.map(toEnvironmentBody), 200);
  });

  const listCapabilitiesRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/capabilities",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(z.array(CapabilitySchema), "Capabilities the workspace's packages provide."), ...errorResponses },
  });
  app.openapi(listCapabilitiesRoute, async (context) => {
    const capabilities = await services.catalogue.capabilityRegistry.listCapabilities(context.get("workspace").id);
    if (capabilities instanceof WorkOsError) return respondWithError(context, capabilities);
    return context.json(capabilities.map(toCapabilityBody), 200);
  });
};
