import { describe, expect, it } from "vitest";

import { diffManifests } from "./diffManifests.ts";

describe("diffManifests", () => {
  it("lists added, modified and deleted files in path order", () => {
    const before = { "a.md": "1", "b.md": "2", "c.md": "3" };
    const after = { "a.md": "1", "b.md": "changed", "d.md": "4" };

    expect(diffManifests(before, after)).toEqual([
      { path: "b.md", change: "modified" },
      { path: "c.md", change: "deleted" },
      { path: "d.md", change: "added" },
    ]);
  });

  it("returns nothing when the manifests match", () => {
    expect(diffManifests({ "a.md": "1" }, { "a.md": "1" })).toEqual([]);
  });
});
