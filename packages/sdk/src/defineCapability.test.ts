import { describe, expect, it } from "vitest";
import { z } from "zod";

import { CapabilityError } from "./CapabilityError.ts";
import { defineCapability } from "./defineCapability.ts";
import type { HostServices } from "./HostServices.ts";

const hostServices: HostServices = {
  http: { send: async () => new CapabilityError("no network in tests") },
  workspaceFiles: { readFile: async () => "", writeFiles: async () => "abc123" },
  runGit: async () => ({ exitCode: 0, output: "", isTimedOut: false }),
};

const greet = defineCapability({
  id: "example.greet",
  connectionKind: "",
  description: "Greets someone.",
  effect: "read",
  executionSite: "server",
  editableFields: [],
  argumentsSchema: z.object({ name: z.string() }),
  execute: async (context) => `Hello, ${context.arguments.name}`,
});

describe("defineCapability", () => {
  it("passes validated arguments to execute", async () => {
    const result = await greet.execute({ ...hostServices, arguments: { name: "Ada" }, target: "", secret: null });

    expect(result).toBe("Hello, Ada");
  });

  it("returns a capability error for invalid arguments", async () => {
    const result = await greet.execute({ ...hostServices, arguments: { name: 42 }, target: "", secret: null });

    expect(result).toBeInstanceOf(CapabilityError);
  });
});
