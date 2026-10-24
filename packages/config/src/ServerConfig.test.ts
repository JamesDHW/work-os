import { describe, expect, it } from "vitest";

import { ConfigError } from "./ConfigError.ts";
import { parseServerConfig } from "./ServerConfig.ts";

const source = { homeDirectory: "/Users/ada", bundledPackagesDirectory: "/opt/work-os/bundled" };

describe("parseServerConfig", () => {
  it("defaults to a loopback server in the home directory", () => {
    const config = parseServerConfig({ ...source, environment: {} });

    expect(config).toEqual({
      profile: "default",
      dataDirectory: "/Users/ada/.work-os/default/server",
      signInCodeFile: "/Users/ada/.work-os/default/server/sign-in-code.json",
      port: 4310,
      host: "127.0.0.1",
      publicOrigin: "http://localhost:4310",
      webDistDirectory: null,
      lmStudioUrl: null,
      bundledPackagesDirectory: "/opt/work-os/bundled",
      defaultModel: null,
      masterKey: null,
      scriptedResponses: null,
      setupCode: null,
      isDevAutoSignIn: false,
    });
  });

  it("keeps each profile's data apart", () => {
    const config = parseServerConfig({ ...source, environment: { WORK_OS_PROFILE: "dev" } });

    expect(config).toMatchObject({ profile: "dev", dataDirectory: "/Users/ada/.work-os/dev/server" });
  });

  it("rejects a profile name with unsafe characters", () => {
    const config = parseServerConfig({ ...source, environment: { WORK_OS_PROFILE: "../etc" } });

    expect(config).toBeInstanceOf(ConfigError);
  });

  it("reads the port and public origin from the environment", () => {
    const environment = { WORK_OS_PORT: "8080", WORK_OS_PUBLIC_ORIGIN: "https://mini.tailnet.ts.net" };
    const config = parseServerConfig({ ...source, environment });

    expect(config).toMatchObject({ port: 8080, publicOrigin: "https://mini.tailnet.ts.net" });
  });

  it("rejects a port that is not a number", () => {
    const config = parseServerConfig({ ...source, environment: { WORK_OS_PORT: "eighty" } });

    expect(config).toBeInstanceOf(ConfigError);
  });
});
