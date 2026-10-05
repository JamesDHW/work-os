import { describe, expect, it } from "vitest";

import { TOOL_PREVIEW_LENGTH } from "../runs.constants.ts";
import { toToolPreview } from "./toToolPreview.ts";

describe("toToolPreview", () => {
  it("collapses whitespace onto one line", () => {
    expect(toToolPreview('{"command":\n  "ls -la"}\n')).toBe('{"command": "ls -la"}');
  });

  it("shortens long output", () => {
    expect(toToolPreview("x".repeat(500))).toHaveLength(TOOL_PREVIEW_LENGTH + 1);
  });
});
