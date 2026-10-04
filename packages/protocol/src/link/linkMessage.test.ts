import { describe, expect, it } from "vitest";

import { RunnerLinkMessageSchema, ServerLinkMessageSchema } from "./linkMessage.schema.ts";

describe("runner link messages", () => {
  it("parses an exec request without optional fields", () => {
    const message = {
      type: "request",
      requestId: "request-1",
      request: { kind: "exec", runId: "run-1", command: "ls", timeoutSeconds: 30 },
    };

    const parsed = ServerLinkMessageSchema.parse(message);

    expect(parsed.request).toEqual({ kind: "exec", runId: "run-1", command: "ls", timeoutSeconds: 30 });
  });

  it("parses a successful collectChanges result", () => {
    const message = {
      type: "succeeded",
      requestId: "request-2",
      result: { kind: "collectChanges", changedFiles: [{ path: "README.md", change: "modified" }], diff: null },
    };

    expect(RunnerLinkMessageSchema.safeParse(message).success).toBe(true);
  });

  it("rejects a host command for a program other than git", () => {
    const message = {
      type: "request",
      requestId: "request-3",
      request: { kind: "hostCommand", projectPath: "/work", program: "rm", arguments: ["-rf", "/"] },
    };

    expect(ServerLinkMessageSchema.safeParse(message).success).toBe(false);
  });
});
