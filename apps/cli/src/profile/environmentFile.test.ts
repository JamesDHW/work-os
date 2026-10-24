import { describe, expect, it } from "vitest";

import { renderEnvironmentFile } from "./environmentFile.ts";

describe("renderEnvironmentFile", () => {
  it("replaces set variables in place and appends new ones", () => {
    const text = "# work-os server settings\nWORK_OS_PORT=4310\n# WORK_OS_PUBLIC_ORIGIN=https://example\nANTHROPIC_API_KEY=secret\n";

    const rendered = renderEnvironmentFile(text, { WORK_OS_PORT: "4312", WORK_OS_PUBLIC_ORIGIN: "https://mini.ts.net" });

    expect(rendered).toBe(
      "# work-os server settings\nWORK_OS_PORT=4312\n# WORK_OS_PUBLIC_ORIGIN=https://example\nANTHROPIC_API_KEY=secret\nWORK_OS_PUBLIC_ORIGIN=https://mini.ts.net\n",
    );
  });

  it("starts from the header when the file is new", () => {
    expect(renderEnvironmentFile("# header\n", { WORK_OS_PROFILE: "dev" })).toBe("# header\nWORK_OS_PROFILE=dev\n");
  });
});
