import type { OpenAPIHono } from "@hono/zod-openapi";
import type { UpgradeWebSocket, WSContext } from "hono/ws";

import type { ApiEnv } from "../ApiEnv.ts";
import type { ApiServices } from "../ApiServices.ts";
import { createLinkConnection, type LinkSocket } from "./createLinkConnection.ts";

type LinkMessageEvent = {
  // oxlint-disable-next-line eslint/id-denylist -- WebSocket message events name their payload field data.
  readonly data: unknown;
};

export const registerRunnerLinkRoute = (app: OpenAPIHono<ApiEnv>, services: ApiServices, upgradeWebSocket: UpgradeWebSocket): void => {
  app.get(
    "/api/runners/link",
    upgradeWebSocket(async (context) => {
      const connection = await createLinkConnection(services, context.req.header("authorization"));
      return {
        onOpen: (_event: Event, socket: WSContext) => {
          connection.open(toLinkSocket(socket));
        },
        onMessage: (event: LinkMessageEvent) => {
          void connection.receive(String(event.data));
        },
        onClose: () => {
          void connection.close();
        },
      };
    }),
  );
};

const toLinkSocket = (socket: WSContext): LinkSocket => ({
  send: (text: string) => socket.send(text),
  close: (code: number, reason: string) => socket.close(code, reason),
});
