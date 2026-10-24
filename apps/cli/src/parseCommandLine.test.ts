import { WorkOsError } from "@work-os/shared/WorkOsError";
import { describe, expect, it } from "vitest";

import { parseCommandLine } from "./parseCommandLine.ts";

describe("parseCommandLine", () => {
  it("reads the command, its positionals and options", () => {
    expect(parseCommandLine(["pair", "http://mac.local:4310", "ABCD-1234", "--profile", "mini"])).toMatchObject({
      command: "pair",
      positionals: ["http://mac.local:4310", "ABCD-1234"],
      profile: "mini",
      role: "all",
    });
    expect(parseCommandLine(["doctor", "--server", "http://x:1"])).toMatchObject({ command: "doctor", serverUrl: "http://x:1" });
    expect(parseCommandLine(["setup", "--role", "runner", "--expose", "tailscale", "--driver", "unsafeHost", "--port", "4312", "--no-start"])).toMatchObject({
      role: "runner",
      exposure: "tailscale",
      driver: "unsafeHost",
      port: 4312,
      isStartSkipped: true,
    });
    expect(parseCommandLine(["logs", "server", "-f"])).toMatchObject({ positionals: ["server"], isFollowing: true });
  });

  it("rejects unknown options and values outside their choices", () => {
    expect(parseCommandLine(["doctor", "--verbose"])).toBeInstanceOf(WorkOsError);
    expect(parseCommandLine(["setup", "--role", "both"])).toBeInstanceOf(WorkOsError);
    expect(parseCommandLine(["dev", "--port", "eighty"])).toBeInstanceOf(WorkOsError);
  });
});
