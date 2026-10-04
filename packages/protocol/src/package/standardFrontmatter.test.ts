import { describe, expect, it } from "vitest";

import { StandardFrontmatterSchema } from "./standardFrontmatter.schema.ts";

describe("StandardFrontmatterSchema", () => {
  it("fills defaults for optional lists and review", () => {
    const parsed = StandardFrontmatterSchema.parse({
      id: "fix-bug",
      describes: "A bug fix",
      consumer: "The maintainers",
      agent: "default",
    });

    expect(parsed).toMatchObject({ skills: [], capabilities: [], egress: [], checks: [], review: "required" });
  });

  it("rejects capability names that are not dotted", () => {
    const parsed = StandardFrontmatterSchema.safeParse({
      id: "fix-bug",
      describes: "A bug fix",
      consumer: "The maintainers",
      agent: "default",
      capabilities: ["push"],
    });

    expect(parsed.success).toBe(false);
  });
});
