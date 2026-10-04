import { createRoute, type OpenAPIHono } from "@hono/zod-openapi";
import { OkResponseSchema } from "@work-os/protocol/api/identity.schema";
import {
  DeletePushSubscriptionRequestSchema,
  PushPublicKeyResponseSchema,
  PushSubscriptionSchema,
} from "@work-os/protocol/api/push.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { errorResponses, jsonBody, jsonResponse } from "../http/errorResponses.ts";
import { respondWithError } from "../http/respondWithError.ts";
import { createRequireUser } from "../middleware/requireUser.ts";

export const registerPushRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  const requireUser = createRequireUser(services);

  const publicKeyRoute = createRoute({
    method: "get",
    path: "/api/push/public-key",
    responses: { 200: jsonResponse(PushPublicKeyResponseSchema, "The VAPID public key for subscriptions."), ...errorResponses },
  });
  app.openapi(publicKeyRoute, async (context) => context.json({ publicKey: services.push.publicKey }, 200));

  const subscribeRoute = createRoute({
    method: "post",
    path: "/api/push/subscriptions",
    middleware: [requireUser] as const,
    request: jsonBody(PushSubscriptionSchema),
    responses: { 200: jsonResponse(OkResponseSchema, "Subscribed."), ...errorResponses },
  });
  app.openapi(subscribeRoute, async (context) => {
    const subscribed = await services.push.subscribeToPush({ ...context.req.valid("json"), userId: context.get("user").id });
    if (subscribed instanceof WorkOsError) return respondWithError(context, subscribed);
    return context.json({ ok: true } as const, 200);
  });

  const unsubscribeRoute = createRoute({
    method: "delete",
    path: "/api/push/subscriptions",
    middleware: [requireUser] as const,
    request: jsonBody(DeletePushSubscriptionRequestSchema),
    responses: { 200: jsonResponse(OkResponseSchema, "Unsubscribed."), ...errorResponses },
  });
  app.openapi(unsubscribeRoute, async (context) => {
    const deleted = await services.push.pushSubscriptionStore.deletePushSubscription(context.req.valid("json").endpoint);
    if (deleted instanceof WorkOsError) return respondWithError(context, deleted);
    return context.json({ ok: true } as const, 200);
  });
};
