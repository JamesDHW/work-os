import { describe, expect, it } from "vitest";

import { renderLaunchAgent } from "./renderLaunchAgent.ts";
import type { ServiceDefinition } from "./ServiceDefinition.ts";
import { renderSystemdUnit, systemdUnitName } from "./renderSystemdUnit.ts";

const service: ServiceDefinition = {
  name: "server",
  profile: "default",
  description: "work-os server (default)",
  programArguments: ["/usr/local/bin/node", "/Users/ada/R&D/work-os/apps/server/src/main.ts"],
  workingDirectory: "/Users/ada/R&D/work-os",
  environment: { PATH: "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin", WORK_OS_PROFILE: "default" },
  logPath: "/Users/ada/.work-os/default/server.log",
  environmentFile: "/Users/ada/.work-os/default/server.env",
};

describe("service files", () => {
  it("renders a LaunchAgent with escaped paths", () => {
    const plist = renderLaunchAgent(service);

    expect(plist).toContain("<key>Label</key><string>com.work-os.default.server</string>");
    expect(plist).toContain("<string>/Users/ada/R&amp;D/work-os/apps/server/src/main.ts</string>");
    expect(plist).toContain("<key>KeepAlive</key><true/>");
    expect(plist).toContain("<key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>");
    expect(plist).toContain("<key>WORK_OS_PROFILE</key><string>default</string>");
  });

  it("renders a systemd user unit with quoted arguments", () => {
    expect(systemdUnitName(service)).toBe("work-os-default-server.service");
    expect(renderSystemdUnit(service)).toContain('ExecStart="/usr/local/bin/node" "/Users/ada/R&D/work-os/apps/server/src/main.ts"');
    expect(renderSystemdUnit(service)).toContain('Environment="PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"');
    expect(renderSystemdUnit(service)).toContain('Environment="WORK_OS_PROFILE=default"');
  });
});
