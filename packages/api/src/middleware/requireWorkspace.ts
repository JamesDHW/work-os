import { WorkspaceIdSchema } from "@work-os/protocol/common/identifiers.schema";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { respondWithError } from "../http/respondWithError.ts";

export const createRequireWorkspace = (services: ApiServices): MiddlewareHandler<ApiEnv> =>
  createMiddleware<ApiEnv>(async (context, next) => {
    const workspaceId = WorkspaceIdSchema.safeParse(context.req.param("workspaceId"));
    if (!workspaceId.success) return respondWithError(context, new NotFoundError("This workspace does not exist."));

    const workspace = await services.workspaces.requireMembership(context.get("user").id, workspaceId.data);
    if (workspace instanceof WorkOsError) return respondWithError(context, workspace);

    context.set("workspace", workspace);
    await next();
    return undefined;
  });
