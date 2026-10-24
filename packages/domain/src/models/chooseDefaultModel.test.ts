import { describe, expect, it } from "vitest";

import { chooseDefaultModel } from "./chooseDefaultModel.ts";
import type { ModelSummary } from "./ModelProvider.ts";

const model = (reference: string): ModelSummary => {
  const [providerId = "", modelId = ""] = reference.split("/");
  return { providerId, modelId, name: modelId, reference };
};

describe("chooseDefaultModel", () => {
  it("prefers a Sonnet from Anthropic, then any Anthropic model, then LM Studio", () => {
    expect(chooseDefaultModel([model("lmstudio/qwen"), model("anthropic/claude-opus-5"), model("anthropic/claude-sonnet-5-5")], "x/y")).toBe("anthropic/claude-sonnet-5-5");
    expect(chooseDefaultModel([model("gateway/gpt"), model("lmstudio/qwen")], "x/y")).toBe("lmstudio/qwen");
  });

  it("takes the first available model otherwise, and the fallback when none is available", () => {
    expect(chooseDefaultModel([model("gateway/gpt")], "x/y")).toBe("gateway/gpt");
    expect(chooseDefaultModel([], "anthropic/claude-sonnet-5-5")).toBe("anthropic/claude-sonnet-5-5");
  });
});
