import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Project } from "@work-os/domain/projects/Project";
import { CreateProjectRequestSchema, ProjectParamsSchema, ProjectSchema } from "@work-os/protocol/api/projects.schema";
import { WorkspaceParamsSchema } from "@work-os/protocol/api/workspaces.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonBody, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";

export const registerProjectRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const listRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/projects",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(z.array(ProjectSchema), "Projects in the workspace."), ...errorResponses },
  });
  app.openapi(listRoute, async (context) => {
    const projects = await services.projects.projectStore.listProjects(context.get("workspace").id);
    if (projects instanceof WorkOsError) return respondWithError(context, projects);
    return context.json(projects.map(toProjectBody), 200);
  });

  const createProjectRoute = createRoute({
    method: "post",
    path: "/api/w/{workspaceId}/projects",
    request: { params: WorkspaceParamsSchema, ...jsonBody(CreateProjectRequestSchema) },
    responses: { 200: jsonResponse(ProjectSchema, "The new project."), ...errorResponses },
  });
  app.openapi(createProjectRoute, async (context) => {
    const project = await services.projects.createProject({ ...context.req.valid("json"), workspaceId: context.get("workspace").id });
    if (project instanceof WorkOsError) return respondWithError(context, project);
    return context.json(toProjectBody(project), 200);
  });

  const getRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/projects/{projectId}",
    request: { params: WorkspaceParamsSchema.extend(ProjectParamsSchema.shape) },
    responses: { 200: jsonResponse(ProjectSchema, "The project."), ...errorResponses },
  });
  app.openapi(getRoute, async (context) => {
    const project = await services.projects.projectStore.findProject(context.get("workspace").id, context.req.valid("param").projectId);
    if (project instanceof WorkOsError) return respondWithError(context, project);
    return context.json(toProjectBody(project), 200);
  });
};

const toProjectBody = (project: Project) => ({ ...project, connectionIds: [...project.connectionIds] });
