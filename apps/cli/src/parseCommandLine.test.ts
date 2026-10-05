import { WorkOsError } from "@work-os/shared/WorkOsError";
import { describe, expect, it } from "vitest";

import { parseCommandLine } from "./parseCommandLine.ts";

describe("parseCommandLine", () => {
  it("reads the command, its positionals and options", () => {
    expect(parseCommandLine(["pair", "http://mac.local:4310", "ABCD-1234"])).toEqual({
      command: "pair",
      positionals: ["http://mac.local:4310", "ABCD-1234"],
      serverUrl: undefined,
      isServerOnly: false,
      isRunnerOnly: false,
    });
    expect(parseCommandLine(["doctor", "--server", "http://x:1"])).toMatchObject({ command: "doctor", serverUrl: "http://x:1" });
  });

  it("rejects unknown options", () => {
    expect(parseCommandLine(["doctor", "--verbose"])).toBeInstanceOf(WorkOsError);
  });
});
