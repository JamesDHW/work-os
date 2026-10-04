import { AllowlistRequestSchema, RevokeAllowlistRequestSchema } from "@work-os/protocol/egress/egressControl.schema";
import { tryCatch } from "@work-os/shared/tryCatch";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "http";

import type { Allowlists } from "./createAllowlists.ts";
import { MAX_CONTROL_BODY_BYTES } from "./gateway.constants.ts";

export const createControlServer = (allowlists: Allowlists, token: string): Server => {
  return createServer((incoming, response) => {
    if (incoming.headers.authorization !== `Bearer ${token}`) {
      respond(response, 401, { error: "unauthorized" });
      return;
    }
    void handleAuthorized(allowlists, incoming, response);
  });
};

const handleAuthorized = async (allowlists: Allowlists, incoming: IncomingMessage, response: ServerResponse): Promise<void> => {
  const body = await readBody(incoming);
  route({ allowlists, incoming, response, body });
};

type ControlRequest = {
  readonly allowlists: Allowlists;
  readonly incoming: IncomingMessage;
  readonly response: ServerResponse;
  readonly body: unknown;
};

const route = (request: ControlRequest): void => {
  const routeKey = `${request.incoming.method ?? ""} ${request.incoming.url ?? ""}`;
  switch (routeKey) {
    case "GET /health":
      respond(request.response, 200, { ok: true });
      return;
    case "PUT /allowlists":
      setAllowlist(request);
      return;
    case "DELETE /allowlists":
      removeAllowlist(request);
      return;
    case "POST /blocked/drain":
      respond(request.response, 200, { blocked: request.allowlists.drainBlocked() });
      return;
    default:
      respond(request.response, 404, { error: "not found" });
      return;
  }
};

const setAllowlist = (request: ControlRequest): void => {
  const allowlist = AllowlistRequestSchema.safeParse(request.body);
  if (!allowlist.success) {
    respond(request.response, 400, { error: allowlist.error.message });
    return;
  }
  request.allowlists.set(allowlist.data.sourceIp, allowlist.data.runId, allowlist.data.hosts);
  respond(request.response, 200, { ok: true });
};

const removeAllowlist = (request: ControlRequest): void => {
  const revocation = RevokeAllowlistRequestSchema.safeParse(request.body);
  if (!revocation.success) {
    respond(request.response, 400, { error: revocation.error.message });
    return;
  }
  request.allowlists.remove(revocation.data.sourceIp);
  respond(request.response, 200, { ok: true });
};

const readBody = async (incoming: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of incoming) {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
    }
  }
  const text = Buffer.concat(chunks).subarray(0, MAX_CONTROL_BODY_BYTES).toString("utf8");
  return text.length === 0 ? {} : tryCatch((): unknown => JSON.parse(text));
};

const respond = (response: ServerResponse, status: number, body: object): void => {
  response.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(body));
};
