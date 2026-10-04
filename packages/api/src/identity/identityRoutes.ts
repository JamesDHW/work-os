import { createRoute, type OpenAPIHono } from "@hono/zod-openapi";
import { OkResponseSchema, SetupRequestSchema, SetupStatusResponseSchema } from "@work-os/protocol/api/identity.schema";
import { SessionResponseSchema } from "@work-os/protocol/api/workspaces.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";
import { createRequireUser } from "../middleware/requireUser.ts";
import { clearSessionCookie, writeSessionCookie } from "./sessionCookie.ts";

export const registerIdentityRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const requireUser = createRequireUser(services);

  const setupStatusRoute = createRoute({
    method: "get",
    path: "/api/setup",
    responses: { 200: jsonResponse(SetupStatusResponseSchema, "Whether the first user exists."), ...errorResponses },
  });
  app.openapi(setupStatusRoute, async (context) => {
    const userCount = await services.identity.userStore.countUsers();
    if (userCount instanceof WorkOsError) return respondWithError(context, userCount);
    return context.json({ isSetUp: userCount > 0 }, 200);
  });

  const setupRoute = createRoute({
    method: "post",
    path: "/api/setup",
    request: { body: { content: { "application/json": { schema: SetupRequestSchema } }, required: true } },
    responses: { 200: jsonResponse(SessionResponseSchema, "The first user, signed in."), ...errorResponses },
  });
  app.openapi(setupRoute, async (context) => {
    const completed = await services.identity.completeSetup(context.req.valid("json"));
    if (completed instanceof WorkOsError) return respondWithError(context, completed);

    writeSessionCookie(context, completed.token, services.settings.isSecureCookie);
    return context.json({ user: completed.user, workspaces: [completed.workspace] }, 200);
  });

  const sessionRoute = createRoute({
    method: "get",
    path: "/api/session",
    middleware: [requireUser] as const,
    responses: { 200: jsonResponse(SessionResponseSchema, "The signed-in user and their workspaces."), ...errorResponses },
  });
  app.openapi(sessionRoute, async (context) => {
    const user = context.get("user");
    const workspaces = await services.workspaces.workspaceStore.listWorkspacesForUser(user.id);
    if (workspaces instanceof WorkOsError) return respondWithError(context, workspaces);
    return context.json({ user, workspaces: [...workspaces] }, 200);
  });

  const signOutRoute = createRoute({
    method: "delete",
    path: "/api/session",
    middleware: [requireUser] as const,
    responses: { 200: jsonResponse(OkResponseSchema, "Signed out."), ...errorResponses },
  });
  app.openapi(signOutRoute, async (context) => {
    const signedOut = await services.identity.signOut(context.get("sessionToken"));
    if (signedOut instanceof WorkOsError) return respondWithError(context, signedOut);

    clearSessionCookie(context);
    return context.json({ ok: true } as const, 200);
  });
};
