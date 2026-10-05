import { describe, expect, it } from "vitest";

import { toDiffLines } from "./toDiffLines.ts";

describe("toDiffLines", () => {
  it("classifies headers, hunks, additions, removals and context", () => {
    const diff = "diff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -1,2 +1,2 @@\n same\n-old\n+new\n";

    expect(toDiffLines(diff).map((line) => line.kind)).toEqual(["header", "header", "header", "hunk", "context", "removed", "added"]);
  });

  it("numbers lines from one", () => {
    expect(toDiffLines("a\nb").map((line) => line.lineNumber)).toEqual([1, 2]);
  });
});
