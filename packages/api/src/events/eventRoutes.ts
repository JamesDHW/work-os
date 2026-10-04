import type { OpenAPIHono } from "@hono/zod-openapi";
import type { WorkspaceEvent } from "@work-os/domain/events/WorkspaceEvent";
import { streamSSE } from "hono/streaming";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { EVENT_KEEP_ALIVE_MILLISECONDS } from "../http/http.constants.ts";
import { writeEvent } from "./writeEvent.ts";

export const registerEventRoutes = (app: OpenAPIHono<ApiEnv>, services: ApiServices): void => {
  app.get("/api/w/:workspaceId/events", (context) =>
    streamSSE(context, async (stream) => {
      const closed = Promise.withResolvers<undefined>();
      const unsubscribe = services.events.subscribe(context.get("workspace").id, (event) => {
        void writeEvent(stream, event.kind, toEventBody(event));
      });
      const keepAlive = setInterval(() => void writeEvent(stream, "keepAlive", {}), EVENT_KEEP_ALIVE_MILLISECONDS);
      stream.onAbort(() => {
        clearInterval(keepAlive);
        unsubscribe();
        closed.resolve(undefined);
      });
      await writeEvent(stream, "ready", {});
      await closed.promise;
    }),
  );
};

const toEventBody = (event: WorkspaceEvent): object => {
  const { workspaceId, ...body } = event;
  return body;
};
