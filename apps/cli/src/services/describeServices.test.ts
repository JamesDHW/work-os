import { describe, expect, it } from "vitest";

import { describeServices } from "./describeServices.ts";

describe("describeServices", () => {
  const [server, runner] = describeServices({
    nodePath: "/opt/homebrew/bin/node",
    repositoryRoot: "/Users/ada/Repos/work-os",
    homeDirectory: "/Users/ada",
    searchPath: "/opt/homebrew/bin:/usr/bin:/bin",
    names: ["server", "runner"],
  });

  it("loads each service's settings file before its entry point", () => {
    expect(server?.programArguments).toEqual([
      "/opt/homebrew/bin/node",
      "--env-file-if-exists=/Users/ada/.work-os/server.env",
      "/Users/ada/Repos/work-os/apps/server/src/main.ts",
    ]);
    expect(runner?.environmentFile).toBe("/Users/ada/.work-os/runner.env");
  });

  it("starts the server's settings with the built web app", () => {
    expect(server?.environmentTemplate).toContain("WORK_OS_WEB_DIST=/Users/ada/Repos/work-os/apps/web/dist");
    expect(server?.environmentTemplate).toContain("# ANTHROPIC_API_KEY=");
  });
});
