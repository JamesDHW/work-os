import { describe, expect, it } from "vitest";

import { toAgentId, toEnvironmentId, toProjectId, toRunId, toRunnerId, toStandardId } from "../identifiers/Identifiers.ts";
import { composeRunInstructions } from "./composeRunInstructions.ts";
import type { RunSpec } from "./RunSpec.ts";

const spec: RunSpec = {
  runId: toRunId("run-1"),
  prompt: "Fix the login bug",
  project: { id: toProjectId("project-1"), runnerId: toRunnerId("runner-1"), path: "/work/app" },
  standard: {
    id: toStandardId("fix-bug"),
    packageRevision: "abc123",
    criteria: "The bug no longer reproduces.",
    method: "",
    checks: [],
    review: "required",
  },
  agent: { id: toAgentId("default"), model: { provider: "faux", modelId: "scripted" }, thinkingLevel: "medium", instructions: "Be brief." },
  skills: [],
  capabilities: [],
  environment: { id: toEnvironmentId("default"), devcontainer: {}, egress: [] },
};

describe("composeRunInstructions", () => {
  it("wraps the standard criteria in a tagged section", () => {
    expect(composeRunInstructions(spec)).toContain("<standard>\nThe bug no longer reproduces.\n</standard>");
  });

  it("omits an empty method", () => {
    expect(composeRunInstructions(spec)).not.toContain("<method>");
  });

  it("starts with the agent's own instructions", () => {
    expect(composeRunInstructions(spec).startsWith("Be brief.")).toBe(true);
  });
});
