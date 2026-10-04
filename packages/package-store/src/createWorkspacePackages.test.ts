import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { toAgentId, toCapabilityId, toEnvironmentId, toStandardId, toWorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { createWorkspacePackages } from "./createWorkspacePackages.ts";
import { createCapabilityRegistry } from "./extensions/createCapabilityRegistry.ts";

const bundledDirectory = new URL("../../../bundled", import.meta.url).pathname;
const workspace = { id: toWorkspaceId("workspace-1"), name: "Ada's workspace", kind: "personal", createdAt: "2026-10-04T10:00:00.000Z" } as const;
const folder = { path: "" };

const createPackages = () =>
  createWorkspacePackages({ workspacesDirectory: folder.path, bundledDirectory, defaultModel: "faux/scripted", defaultExtends: ["base", "github"] });

beforeEach(async () => {
  folder.path = await mkdtemp(join(tmpdir(), "work-os-packages-"));
});

afterEach(async () => {
  await rm(folder.path, { recursive: true, force: true });
});

describe("createWorkspacePackages", () => {
  it("creates a workspace package that sees the bundled standards, agent and environment", async () => {
    const packages = createPackages();
    const revision = await packages.ensurePackage(workspace);

    expect(revision).toMatch(/^[0-9a-f]{40}$/u);
    const standards = await packages.listStandards(workspace.id);
    if (standards instanceof WorkOsError) return expect.unreachable(standards.message);
    expect(standards.map((standard) => standard.id)).toEqual(["author-standard", "improve-standard", "task"]);
    expect(await packages.readAgent(workspace.id, toAgentId("default"))).toMatchObject({ model: "default", thinkingLevel: "medium" });
    expect(await packages.readEnvironment(workspace.id, toEnvironmentId("default"))).toMatchObject({ egress: [] });
    expect(await packages.readModelAliases(workspace.id)).toEqual({ default: "faux/scripted" });
  });

  it("saves an edited standard as a commit that overrides the bundled one", async () => {
    const packages = createPackages();
    const firstRevision = await packages.ensurePackage(workspace);
    const bundled = await packages.readStandard(workspace.id, toStandardId("task"));
    if (bundled instanceof WorkOsError) return expect.unreachable(bundled.message);

    await packages.saveStandard(workspace.id, { ...bundled, criteria: "- Only what was asked.", method: "1. Read first." });

    expect(await packages.readStandard(workspace.id, toStandardId("task"))).toMatchObject({ criteria: "- Only what was asked.", method: "1. Read first." });
    expect(await packages.readRevision(workspace.id)).not.toBe(firstRevision);
  });
});

describe("createCapabilityRegistry", () => {
  it("lists capabilities from the bundled extensions the workspace extends", async () => {
    await createPackages().ensurePackage(workspace);
    const registry = createCapabilityRegistry({ workspacesDirectory: folder.path, bundledDirectory, onPackageChanged: () => undefined });

    const capabilities = await registry.listCapabilities(workspace.id);
    if (capabilities instanceof WorkOsError) return expect.unreachable(capabilities.message);

    expect(capabilities.map((capability) => capability.id)).toEqual([
      "workos.standard.read",
      "workos.standard.save",
      "github.repository.read",
      "github.pr.create",
      "git.push",
    ]);
  });

  it("refuses to save a standard whose frontmatter does not parse", async () => {
    await createPackages().ensurePackage(workspace);
    const registry = createCapabilityRegistry({ workspacesDirectory: folder.path, bundledDirectory, onPackageChanged: () => undefined });
    const saveStandard = await registry.findCapability(workspace.id, toCapabilityId("workos.standard.save"));
    if (saveStandard instanceof WorkOsError) return expect.unreachable(saveStandard.message);

    const result = await saveStandard.execute({
      arguments: { standardMarkdown: "no frontmatter here" },
      target: "weekly-report",
      secret: null,
      runHostCommand: async () => ({ exitCode: 0, output: "", isTimedOut: false }),
    });

    expect(result).toBeInstanceOf(WorkOsError);
  });
});
