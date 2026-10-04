import { describe, expect, it } from "vitest";

import { toCapabilityId, toGrantId, toRunId, toStandardId, toUserId, toWorkspaceId } from "../identifiers/Identifiers.ts";
import type { CapabilityCall } from "./CapabilityCall.ts";
import type { CapabilityDefinition, CapabilityEffect } from "./CapabilityDefinition.ts";
import { decideApproval } from "./decideApproval.ts";
import type { Grant } from "./Grant.ts";

const call: CapabilityCall = {
  runId: toRunId("run-1"),
  standardId: toStandardId("code-change"),
  capabilityId: toCapabilityId("github.pr.create"),
  target: "acme/app",
  arguments: { title: "Fix login" },
};

const capabilityWithEffect = (effect: CapabilityEffect): CapabilityDefinition => ({
  id: call.capabilityId,
  connectionKind: "github",
  description: "Open a pull request",
  effect,
  executionSite: "server",
  editableFields: ["title"],
});

const standardGrant: Grant = {
  id: toGrantId("grant-1"),
  workspaceId: toWorkspaceId("workspace-1"),
  capabilityId: call.capabilityId,
  target: "acme/app",
  scope: { kind: "standard", standardId: call.standardId },
  createdBy: toUserId("user-1"),
  createdAt: "2026-10-04T00:00:00.000Z",
};

describe("decideApproval", () => {
  it("allows reads without asking", () => {
    expect(decideApproval(capabilityWithEffect("read"), call, [])).toEqual({ kind: "allow", reason: "read" });
  });

  it("asks with every duration for a reversible write without a grant", () => {
    expect(decideApproval(capabilityWithEffect("reversible"), call, [])).toEqual({
      kind: "ask",
      durations: ["once", "run", "standard"],
    });
  });

  it("allows a reversible write covered by a standing grant", () => {
    expect(decideApproval(capabilityWithEffect("reversible"), call, [standardGrant])).toEqual({
      kind: "allow",
      reason: "grant",
      grantId: standardGrant.id,
    });
  });

  it("always asks once for an irreversible action, even with a grant", () => {
    expect(decideApproval(capabilityWithEffect("irreversible"), call, [standardGrant])).toEqual({
      kind: "ask",
      durations: ["once"],
    });
  });

  it("ignores a grant for a different target", () => {
    const otherTarget = { ...standardGrant, target: "acme/other" };
    expect(decideApproval(capabilityWithEffect("reversible"), call, [otherTarget]).kind).toBe("ask");
  });
});
