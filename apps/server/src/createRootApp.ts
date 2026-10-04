import { serveStatic } from "@hono/node-server/serve-static";
import { createNodeWebSocket, type NodeWebSocket } from "@hono/node-ws";
import { createApiApp } from "@work-os/api/createApiApp";
import type { ApiServices } from "@work-os/api/ApiServices";
import { Hono } from "hono";

export type RootApp = {
  readonly app: Hono;
  readonly injectWebSocket: NodeWebSocket["injectWebSocket"];
};

export const createRootApp = (services: ApiServices, webDistDirectory: string | null): RootApp => {
  const app = new Hono();
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });
  app.route("/", createApiApp(services, upgradeWebSocket));
  if (webDistDirectory !== null) {
    app.use("/*", serveStatic({ root: webDistDirectory }));
    app.get("/*", serveStatic({ root: webDistDirectory, path: "index.html" }));
  }
  return { app, injectWebSocket };
};
