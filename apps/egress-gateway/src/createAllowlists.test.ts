import { describe, expect, it } from "vitest";

import { toRunId } from "@work-os/domain/identifiers/Identifiers";

import { createAllowlists } from "./createAllowlists.ts";

const runId = toRunId("run-1");

describe("createAllowlists", () => {
  it("allows a listed host from a registered container", () => {
    const allowlists = createAllowlists();
    allowlists.set("172.20.0.5", runId, ["registry.npmjs.org"]);

    expect(allowlists.decide("::ffff:172.20.0.5", "registry.npmjs.org", 443)).toEqual({ isAllowed: true });
  });

  it("blocks and reports an unlisted host", () => {
    const allowlists = createAllowlists();
    allowlists.set("172.20.0.5", runId, ["registry.npmjs.org"]);

    expect(allowlists.decide("172.20.0.5", "example.com", 443)).toMatchObject({ isAllowed: false });
    expect(allowlists.drainBlocked()).toEqual([{ runId, host: "example.com" }]);
    expect(allowlists.drainBlocked()).toEqual([]);
  });

  it("blocks unregistered containers and unusual ports", () => {
    const allowlists = createAllowlists();
    allowlists.set("172.20.0.5", runId, ["*.github.com"]);

    expect(allowlists.decide("172.20.0.9", "api.github.com", 443)).toMatchObject({ isAllowed: false });
    expect(allowlists.decide("172.20.0.5", "api.github.com", 22)).toMatchObject({ isAllowed: false });
  });
});
