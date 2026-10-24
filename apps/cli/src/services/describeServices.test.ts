import { profilePaths } from "@work-os/config/ProfilePaths";
import { describe, expect, it } from "vitest";

import { describeServices } from "./describeServices.ts";

describe("describeServices", () => {
  const [server, runner] = describeServices({
    nodePath: "/opt/homebrew/bin/node",
    appDirectory: "/Users/ada/Repos/work-os",
    paths: profilePaths("/Users/ada", "mini"),
    searchPath: "/opt/homebrew/bin:/usr/bin:/bin",
    names: ["server", "runner"],
  });

  it("loads the profile's settings file before its entry point", () => {
    expect(server?.programArguments).toEqual([
      "/opt/homebrew/bin/node",
      "--env-file-if-exists=/Users/ada/.work-os/mini/server.env",
      "/Users/ada/Repos/work-os/apps/server/src/main.ts",
    ]);
    expect(runner?.environmentFile).toBe("/Users/ada/.work-os/mini/runner.env");
    expect(runner?.logPath).toBe("/Users/ada/.work-os/mini/runner.log");
  });

  it("tells each process which profile it belongs to", () => {
    expect(server?.environment).toEqual({ PATH: "/opt/homebrew/bin:/usr/bin:/bin", WORK_OS_PROFILE: "mini" });
    expect(server?.description).toBe("work-os server (mini)");
  });
});
