import { describe, expect, it } from "vitest";

import { composeEffectiveDevcontainer } from "./composeEffectiveDevcontainer.ts";

describe("composeEffectiveDevcontainer", () => {
  it("mounts the project folder and routes the network through the egress gateway", () => {
    const effective = composeEffectiveDevcontainer({
      devcontainer: { image: "node:24", runArgs: ["--network=host", "--cpus=2"], containerEnv: { CI: "1" } },
      projectPath: "/Users/ada/app",
      runId: "run-1",
    });

    expect(effective).toMatchObject({
      image: "node:24",
      workspaceMount: "source=/Users/ada/app,target=/workspace,type=bind",
      workspaceFolder: "/workspace",
      runArgs: ["--cpus=2", "--network=work-os-egress", "--label=work-os.run=run-1"],
      containerEnv: { CI: "1", HTTPS_PROXY: "http://work-os-egress-gateway:3128" },
    });
  });
});
