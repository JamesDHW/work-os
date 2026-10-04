import { OpenAPIHono } from "@hono/zod-openapi";
import type { UpgradeWebSocket } from "hono/ws";

import type { ApiEnv } from "./ApiEnv.ts";
import type { ApiServices } from "./ApiServices.ts";
import { registerCatalogueRoutes } from "./catalogue/catalogueRoutes.ts";
import { registerConnectionRoutes } from "./connections/connectionRoutes.ts";
import { registerEventRoutes } from "./events/eventRoutes.ts";
import { registerGrantRoutes } from "./grants/grantRoutes.ts";
import { rejectInvalidRequest } from "./http/rejectInvalidRequest.ts";
import { registerIdentityRoutes } from "./identity/identityRoutes.ts";
import { registerPasskeyRoutes } from "./identity/passkeyRoutes.ts";
import { registerInboxRoutes } from "./inbox/inboxRoutes.ts";
import { createRequireUser } from "./middleware/requireUser.ts";
import { createRequireWorkspace } from "./middleware/requireWorkspace.ts";
import { registerProjectRoutes } from "./projects/projectRoutes.ts";
import { registerPushRoutes } from "./push/pushRoutes.ts";
import { registerRunnerLinkRoute } from "./runners/runnerLinkRoute.ts";
import { registerRunnerRoutes } from "./runners/runnerRoutes.ts";
import { registerRunRoutes } from "./runs/runRoutes.ts";

export type ApiApp = OpenAPIHono<ApiEnv>;

export const createApiApp = (services: ApiServices, upgradeWebSocket: UpgradeWebSocket): ApiApp => {
  const app = new OpenAPIHono<ApiEnv>({ defaultHook: rejectInvalidRequest });
  app.onError((error, context) => {
    services.logger.error("Unhandled API error.", { message: error.message });
    return context.json({ error: { code: "InternalError", message: "Something went wrong on the server." } }, 500);
  });
  app.use("/api/w/:workspaceId/*", createRequireUser(services), createRequireWorkspace(services));

  registerIdentityRoutes(app, services);
  registerPasskeyRoutes(app, services);
  registerRunnerRoutes(app, services);
  registerRunnerLinkRoute(app, services, upgradeWebSocket);
  registerProjectRoutes(app, services);
  registerCatalogueRoutes(app, services);
  registerConnectionRoutes(app, services);
  registerRunRoutes(app, services);
  registerInboxRoutes(app, services);
  registerGrantRoutes(app, services);
  registerPushRoutes(app, services);
  registerEventRoutes(app, services);
  app.doc31("/api/openapi.json", { openapi: "3.1.0", info: { title: "work-os", version: services.settings.serverVersion } });
  return app;
};
