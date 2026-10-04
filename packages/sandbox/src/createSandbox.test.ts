import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { toRunId } from "@work-os/domain/identifiers/Identifiers";

import { createSandbox } from "./createSandbox.ts";
import { createHostDriver } from "./environments/createHostDriver.ts";
import { createManifestStore } from "./outputs/createManifestStore.ts";

const runId = toRunId("run-1");
const folders = { root: "", project: "" };

const createTestSandbox = () => createSandbox({ driver: createHostDriver(), manifestStore: createManifestStore(join(folders.root, "runs")) });
const ignoreOutput = (): void => undefined;

beforeEach(async () => {
  folders.root = await mkdtemp(join(tmpdir(), "work-os-sandbox-"));
  folders.project = join(folders.root, "project");
  await mkdir(join(folders.project, "src"), { recursive: true });
  await writeFile(join(folders.project, "README.md"), "# Demo\n");
  await writeFile(join(folders.project, "src", "old.ts"), "export {};\n");
});

afterEach(async () => {
  await rm(folders.root, { recursive: true, force: true });
});

describe("createSandbox with the host driver", () => {
  it("reports the files a run added, changed and deleted", async () => {
    const sandbox = createTestSandbox();
    await sandbox.handle({ kind: "prepareEnvironment", runId, projectPath: folders.project, devcontainer: {}, egress: [] }, ignoreOutput);

    const command = "echo changed >> README.md && rm src/old.ts && echo new > src/new.ts";
    await sandbox.handle({ kind: "exec", runId, command, timeoutSeconds: 10 }, ignoreOutput);
    const changes = await sandbox.handle({ kind: "collectChanges", runId }, ignoreOutput);

    expect(changes).toEqual({
      kind: "collectChanges",
      changedFiles: [
        { path: "README.md", change: "modified" },
        { path: "src/new.ts", change: "added" },
        { path: "src/old.ts", change: "deleted" },
      ],
      diff: null,
    });
  });

  it("streams output and passes stdin to commands", async () => {
    const sandbox = createTestSandbox();
    await sandbox.handle({ kind: "prepareEnvironment", runId, projectPath: folders.project, devcontainer: {}, egress: [] }, ignoreOutput);
    const chunks: string[] = [];

    const result = await sandbox.handle({ kind: "exec", runId, command: "base64 -d > copy.txt && cat copy.txt", stdin: "aGVsbG8=", timeoutSeconds: 10 }, (chunk) => chunks.push(chunk));

    expect(result).toMatchObject({ kind: "exec", exitCode: 0, output: "hello", isTimedOut: false });
    expect(chunks.join("")).toBe("hello");
    expect(await readFile(join(folders.project, "copy.txt"), "utf8")).toBe("hello");
  });

  it("stops a command that runs past its timeout", async () => {
    const sandbox = createTestSandbox();
    await sandbox.handle({ kind: "prepareEnvironment", runId, projectPath: folders.project, devcontainer: {}, egress: [] }, ignoreOutput);

    const result = await sandbox.handle({ kind: "exec", runId, command: "sleep 5", timeoutSeconds: 1 }, ignoreOutput);

    expect(result).toMatchObject({ kind: "exec", isTimedOut: true });
  });

  it("refuses the file system root as a project folder", async () => {
    const result = await createTestSandbox().handle({ kind: "prepareEnvironment", runId, projectPath: "/", devcontainer: {}, egress: [] }, ignoreOutput);

    expect(result).toBeInstanceOf(Error);
  });

  it("lists folders and marks Git repositories", async () => {
    await mkdir(join(folders.project, "repo", ".git"), { recursive: true });

    const listing = await createTestSandbox().handle({ kind: "listFolders", path: folders.project }, ignoreOutput);

    expect(listing).toMatchObject({ kind: "listFolders", folders: [{ name: "repo", isGitRepository: true }, { name: "src", isGitRepository: false }] });
  });
});
