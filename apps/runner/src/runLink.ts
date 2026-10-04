import type { RunnerCredentials } from "@work-os/config/RunnerCredentials";
import type { RunnerLinkMessage } from "@work-os/protocol/link/linkMessage.schema";
import type { Sandbox } from "@work-os/sandbox/createSandbox";

import { handleServerMessage } from "./handleServerMessage.ts";
import { LINK_PATH, RECONNECT_DELAYS_MILLISECONDS, RUNNER_VERSION, UNAUTHORIZED_CLOSE_CODE } from "./runner.constants.ts";
import { writeLogLine } from "./writeLogLine.ts";

export type LinkOptions = {
  readonly credentials: RunnerCredentials;
  readonly sandbox: Sandbox;
  readonly onUnauthorized: () => void;
};

export type Link = {
  readonly send: (message: RunnerLinkMessage) => void;
};

export const runLink = (options: LinkOptions): Link => {
  const sockets: WebSocket[] = [];
  const failedAttempts: number[] = [];
  const linkUrl = new URL(LINK_PATH, options.credentials.serverUrl.replace(/^http/u, "ws"));

  const send = (message: RunnerLinkMessage): void => {
    sockets.at(-1)?.send(JSON.stringify(message));
  };

  const scheduleReconnect = (): void => {
    failedAttempts.push(1);
    const delay = RECONNECT_DELAYS_MILLISECONDS[Math.min(failedAttempts.length, RECONNECT_DELAYS_MILLISECONDS.length) - 1] ?? 1000;
    writeLogLine("warn", "Lost the server link; reconnecting.", { delayMilliseconds: delay });
    setTimeout(connect, delay);
  };

  const connect = (): void => {
    const socket = new WebSocket(linkUrl);
    sockets.splice(0, sockets.length, socket);
    socket.addEventListener("open", () => {
      failedAttempts.splice(0);
      socket.send(JSON.stringify({ type: "hello", token: options.credentials.token, version: RUNNER_VERSION }));
      writeLogLine("info", "Connected to the work-os server.", { server: options.credentials.serverUrl });
    });
    socket.addEventListener("message", (event) => {
      void handleServerMessage(options.sandbox, String(event.data), send);
    });
    socket.addEventListener("close", (event) => {
      if (event.code === UNAUTHORIZED_CLOSE_CODE) {
        options.onUnauthorized();
        return;
      }
      scheduleReconnect();
    });
  };

  connect();
  return { send };
};
