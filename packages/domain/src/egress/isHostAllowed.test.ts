import { describe, expect, it } from "vitest";

import { isHostAllowed } from "./isHostAllowed.ts";

describe("isHostAllowed", () => {
  it("allows an exact host", () => {
    expect(isHostAllowed("registry.npmjs.org", ["registry.npmjs.org"])).toBe(true);
  });

  it("allows a subdomain of a wildcard entry but not the bare domain", () => {
    expect(isHostAllowed("api.github.com", ["*.github.com"])).toBe(true);
    expect(isHostAllowed("github.com", ["*.github.com"])).toBe(false);
  });

  it("refuses a host that is not listed", () => {
    expect(isHostAllowed("evil.example", ["registry.npmjs.org"])).toBe(false);
  });

  it("compares case-insensitively", () => {
    expect(isHostAllowed("Registry.NPMJS.org", ["registry.npmjs.org"])).toBe(true);
  });
});
