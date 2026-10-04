import { UnauthenticatedError } from "@work-os/shared/UnauthenticatedError";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { createMiddleware } from "hono/factory";
import type { MiddlewareHandler } from "hono";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { respondWithError } from "../http/respondWithError.ts";
import { readSessionToken } from "../identity/sessionCookie.ts";

export const createRequireUser = (services: ApiServices): MiddlewareHandler<ApiEnv> =>
  createMiddleware<ApiEnv>(async (context, next) => {
    const token = readSessionToken(context);
    if (token === undefined) return respondWithError(context, new UnauthenticatedError("Sign in to continue."));

    const user = await services.identity.authenticateSession(token);
    if (user instanceof WorkOsError) return respondWithError(context, user);

    context.set("user", user);
    context.set("sessionToken", token);
    await next();
    return undefined;
  });
