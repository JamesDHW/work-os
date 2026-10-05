import { describe, expect, it } from "vitest";

import type { Standard } from "../api/apiTypes.ts";
import { toReviewMode, toSaveStandardRequest, toStandardForm } from "./standardForm.ts";

const standard: Standard = {
  id: "code-change",
  describes: "A change to a codebase",
  consumer: "the project maintainer",
  agentId: "coder",
  skills: ["testing", "git"],
  capabilities: ["github.push"],
  egress: ["registry.npmjs.org"],
  checks: [{ name: "tests", command: "pnpm test" }],
  review: "required",
  criteria: "Tests pass.",
  method: "Work in small steps.",
};

describe("standardForm", () => {
  it("round-trips a standard through the form", () => {
    expect(toSaveStandardRequest(standard.id, toStandardForm(standard))).toEqual(standard);
  });

  it("parses checks, egress lines and skills from text", () => {
    const form = { ...toStandardForm(standard), skills: " a, ,b ", egress: "x.com\n\n y.com ", checks: "lint: pnpm lint\npnpm build" };
    const request = toSaveStandardRequest("s", form);

    expect(request.skills).toEqual(["a", "b"]);
    expect(request.egress).toEqual(["x.com", "y.com"]);
    expect(request.checks).toEqual([
      { name: "lint", command: "pnpm lint" },
      { name: "pnpm build", command: "pnpm build" },
    ]);
  });

  it("accepts only known review modes", () => {
    expect(toReviewMode("optional")).toBe("optional");
    expect(toReviewMode("sometimes")).toBeUndefined();
  });
});
