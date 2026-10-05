import { describe, expect, it } from "vitest";

import { renderLaunchAgent } from "./renderLaunchAgent.ts";
import type { ServiceDefinition } from "./ServiceDefinition.ts";
import { renderSystemdUnit, systemdUnitName } from "./renderSystemdUnit.ts";

const service: ServiceDefinition = {
  name: "server",
  description: "work-os server",
  programArguments: ["/usr/local/bin/node", "/Users/ada/R&D/work-os/apps/server/src/main.ts"],
  workingDirectory: "/Users/ada/R&D/work-os",
  searchPath: "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin",
  logPath: "/Users/ada/.work-os/server.log",
  environmentFile: "/Users/ada/.work-os/server.env",
  environmentTemplate: "",
};

describe("service files", () => {
  it("renders a LaunchAgent with escaped paths", () => {
    const plist = renderLaunchAgent(service);

    expect(plist).toContain("<key>Label</key><string>dev.work-os.server</string>");
    expect(plist).toContain("<string>/Users/ada/R&amp;D/work-os/apps/server/src/main.ts</string>");
    expect(plist).toContain("<key>KeepAlive</key><true/>");
    expect(plist).toContain("<key>EnvironmentVariables</key><dict><key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string></dict>");
  });

  it("renders a systemd user unit with quoted arguments", () => {
    expect(systemdUnitName(service)).toBe("work-os-server.service");
    expect(renderSystemdUnit(service)).toContain('ExecStart="/usr/local/bin/node" "/Users/ada/R&D/work-os/apps/server/src/main.ts"');
    expect(renderSystemdUnit(service)).toContain('Environment="PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"');
  });
});
