import { createServer, request, type IncomingMessage, type Server, type ServerResponse } from "http";
import { connect, type Socket } from "net";

import type { Allowlists } from "./allowlists.state.ts";

export const createProxyServer = (allowlists: Allowlists): Server => {
  const server = createServer((incoming, response) => forwardPlainRequest(allowlists, incoming, response));
  server.on("connect", (incoming: IncomingMessage, clientSocket: Socket, head: Buffer) => openTunnel({ allowlists, incoming, clientSocket, head }));
  return server;
};

type TunnelRequest = {
  readonly allowlists: Allowlists;
  readonly incoming: IncomingMessage;
  readonly clientSocket: Socket;
  readonly head: Buffer;
};

const openTunnel = (tunnel: TunnelRequest): void => {
  const [host = "", portText = "443"] = (tunnel.incoming.url ?? "").split(":");
  const decision = tunnel.allowlists.decide(tunnel.incoming.socket.remoteAddress ?? "", host, Number(portText));
  if (!decision.isAllowed) {
    tunnel.clientSocket.end(`HTTP/1.1 403 Forbidden\r\nX-Work-Os-Egress: blocked\r\n\r\n${decision.reason}\n`);
    return;
  }
  const upstream = connect(Number(portText), host, () => {
    tunnel.clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    upstream.write(tunnel.head);
    upstream.pipe(tunnel.clientSocket);
    tunnel.clientSocket.pipe(upstream);
  });
  upstream.on("error", () => tunnel.clientSocket.destroy());
  tunnel.clientSocket.on("error", () => upstream.destroy());
};

const forwardPlainRequest = (allowlists: Allowlists, incoming: IncomingMessage, response: ServerResponse): void => {
  const target = parseProxyTarget(incoming.url ?? "");
  if (target === null) {
    response.writeHead(400).end("The gateway only accepts proxy requests.\n");
    return;
  }
  const decision = allowlists.decide(incoming.socket.remoteAddress ?? "", target.hostname, Number(target.port === "" ? "80" : target.port));
  if (!decision.isAllowed) {
    response.writeHead(403, { "x-work-os-egress": "blocked" }).end(`${decision.reason}\n`);
    return;
  }
  const upstream = request(target, { method: incoming.method, headers: incoming.headers }, (upstreamResponse) => {
    response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
    upstreamResponse.pipe(response);
  });
  upstream.on("error", () => response.writeHead(502).end("The upstream request failed.\n"));
  incoming.pipe(upstream);
};

const parseProxyTarget = (url: string): URL | null => {
  if (!URL.canParse(url)) return null;

  return new URL(url);
};
