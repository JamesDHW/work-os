import { describe, expect, it } from "vitest";

import { ConfigError } from "./ConfigError.ts";
import { parseServerConfig } from "./ServerConfig.ts";

const source = { homeDirectory: "/Users/ada", bundledPackagesDirectory: "/opt/work-os/bundled" };

describe("parseServerConfig", () => {
  it("defaults to a loopback server in the home directory", () => {
    const config = parseServerConfig({ ...source, environment: {} });

    expect(config).toEqual({
      dataDirectory: "/Users/ada/.work-os/server",
      port: 4310,
      host: "127.0.0.1",
      publicOrigin: "http://localhost:4310",
      webDistDirectory: null,
      lmStudioUrl: null,
      bundledPackagesDirectory: "/opt/work-os/bundled",
      defaultModel: "anthropic/claude-sonnet-5-5",
      masterKey: null,
      scriptedResponses: null,
      setupCode: null,
    });
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
