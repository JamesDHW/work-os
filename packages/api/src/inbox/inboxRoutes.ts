import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { AnswerInboxItemRequestSchema, InboxItemParamsSchema, InboxItemSchema } from "@work-os/protocol/api/inbox.schema";
import { WorkspaceParamsSchema } from "@work-os/protocol/api/workspaces.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonBody, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";
import { toInboxItemBody } from "./toInboxItemBody.ts";

export const registerInboxRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const listRoute = createRoute({
    method: "get",
    path: "/api/w/{workspaceId}/inbox",
    request: { params: WorkspaceParamsSchema },
    responses: { 200: jsonResponse(z.array(InboxItemSchema), "Inbox items, blocking first."), ...errorResponses },
  });
  app.openapi(listRoute, async (context) => {
    const inboxItems = await services.inbox.listInbox(context.get("workspace").id);
    if (inboxItems instanceof WorkOsError) return respondWithError(context, inboxItems);
    return context.json(inboxItems.map(toInboxItemBody), 200);
  });

  const answerRoute = createRoute({
    method: "post",
    path: "/api/w/{workspaceId}/inbox/{inboxItemId}/answer",
    request: { params: WorkspaceParamsSchema.extend(InboxItemParamsSchema.shape), ...jsonBody(AnswerInboxItemRequestSchema) },
    responses: { 200: jsonResponse(InboxItemSchema, "The answered item."), ...errorResponses },
  });
  app.openapi(answerRoute, async (context) => {
    const answered = await services.inbox.answerInboxItem({
      workspaceId: context.get("workspace").id,
      inboxItemId: context.req.valid("param").inboxItemId,
      userId: context.get("user").id,
      answer: context.req.valid("json").answer,
    });
    if (answered instanceof WorkOsError) return respondWithError(context, answered);
    return context.json(toInboxItemBody(answered), 200);
  });
};
