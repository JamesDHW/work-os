import { describe, expect, it } from "vitest";

import { resolveModelReference, UnknownModelError } from "./resolveModelReference.ts";

describe("resolveModelReference", () => {
  it("resolves an alias through the workspace aliases", () => {
    expect(resolveModelReference("default", { default: "anthropic/claude-sonnet-5" })).toEqual({
      provider: "anthropic",
      modelId: "claude-sonnet-5",
    });
  });

  it("accepts a provider/model reference directly", () => {
    expect(resolveModelReference("lmstudio/qwen3-coder", {})).toEqual({ provider: "lmstudio", modelId: "qwen3-coder" });
  });

  it("returns an error for an unknown alias", () => {
    expect(resolveModelReference("fast", {})).toBeInstanceOf(UnknownModelError);
  });
});
