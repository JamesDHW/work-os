import type { RunnerCredentials } from "@work-os/config/RunnerCredentials";
import type { RunnerLinkMessage } from "@work-os/protocol/link/linkMessage.schema";
import type { Sandbox } from "@work-os/sandbox/createSandbox";

import { handleServerMessage } from "./handleServerMessage.ts";
import { LINK_PATH, RECONNECT_DELAYS_MILLISECONDS, UNAUTHORIZED_CLOSE_CODE } from "./runner.constants.ts";
import { writeLogLine } from "./writeLogLine.ts";

export type SendLinkMessage = (message: RunnerLinkMessage) => void;

export type LinkOptions = {
  readonly credentials: RunnerCredentials;
  readonly sandbox: Sandbox;
  readonly onUnauthorized: () => void;
  /** Runs while a connection is open; returns the function that stops it. */
  readonly whileConnected: (send: SendLinkMessage) => () => void;
};

// Each connection is one call to connect with its own constants. The retry count is a parameter:
// a connection that never opened retries with a longer delay, one that was open starts again from the shortest.
export const runLink = (options: LinkOptions): void => {
  const linkUrl = new URL(LINK_PATH, options.credentials.serverUrl.replace(/^http/u, "ws"));

  const connect = (attempt: number): void => {
    const socket = new WebSocket(linkUrl, { headers: { authorization: `Bearer ${options.credentials.token}` } });
    const send: SendLinkMessage = (message) => socket.send(JSON.stringify(message));
    const reconnectAfter = (nextAttempt: number) => (event: CloseEvent): void => {
      if (event.code === UNAUTHORIZED_CLOSE_CODE) {
        options.onUnauthorized();
        return;
      }
      const delay = RECONNECT_DELAYS_MILLISECONDS[Math.min(nextAttempt, RECONNECT_DELAYS_MILLISECONDS.length) - 1] ?? 1000;
      writeLogLine("warn", "Lost the server link; reconnecting.", { delayMilliseconds: delay });
      setTimeout(() => connect(nextAttempt), delay);
    };
    const retryLonger = reconnectAfter(attempt + 1);

    socket.addEventListener("close", retryLonger);
    socket.addEventListener("open", () => {
      socket.removeEventListener("close", retryLonger);
      socket.addEventListener("close", reconnectAfter(1));
      socket.addEventListener("close", options.whileConnected(send));
      writeLogLine("info", "Connected to the work-os server.", { server: options.credentials.serverUrl });
    });
    socket.addEventListener("message", (event) => {
      void handleServerMessage(options.sandbox, String(event.data), send);
    });
  };

  connect(0);
};
