import { describe, expect, it } from "vitest";

import { checkNodeVersion } from "./checkNodeVersion.ts";

describe("checkNodeVersion", () => {
  it("accepts Node.js 24", () => {
    expect(checkNodeVersion("24.20.0").status).toBe("ok");
  });

  it("rejects Node.js 22", () => {
    expect(checkNodeVersion("22.22.0").status).toBe("fail");
  });
});
