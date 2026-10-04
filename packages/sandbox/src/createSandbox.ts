import type { RunnerRequest } from "@work-os/domain/runners/RunnerRequest";
import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { EnvironmentDriver } from "./environments/EnvironmentDriver.ts";
import { prepareProject } from "./environments/prepareProject.ts";
import { listFolders } from "./folders/listFolders.ts";
import { runGitIn } from "./hostCommands/runGitIn.ts";
import { collectChanges } from "./outputs/collectChanges.ts";
import type { ManifestStore } from "./outputs/createManifestStore.ts";
import { requireProjectFolder } from "./environments/requireProjectFolder.ts";

export type Sandbox = {
  readonly handle: (request: RunnerRequest, onOutput: (chunk: string) => void) => Promise<RunnerResult | WorkOsError>;
};

export type SandboxParts = {
  readonly driver: EnvironmentDriver;
  readonly manifestStore: ManifestStore;
};

export const createSandbox = (parts: SandboxParts): Sandbox => ({
  handle: async (request, onOutput) => {
    switch (request.kind) {
      case "prepareEnvironment":
        return prepareProject(parts, request);
      case "stopEnvironment": {
        const stopped = await parts.driver.stop(request.runId);
        return stopped ?? { kind: "stopEnvironment" };
      }
      case "exec": {
        const outcome = await parts.driver.exec({ ...request, onOutput });
        return outcome instanceof WorkOsError ? outcome : { kind: "exec", ...outcome };
      }
      case "collectChanges": {
        const projectPath = await parts.manifestStore.readProjectPath(request.runId);
        return projectPath instanceof WorkOsError ? projectPath : collectChanges(parts.manifestStore, { runId: request.runId, projectPath });
      }
      case "hostCommand":
        return runHostCommand(request);
      case "listFolders":
        return listFolders(request.path);
      default:
        return request satisfies never;
    }
  },
});

const runHostCommand = async (request: Extract<RunnerRequest, { readonly kind: "hostCommand" }>): Promise<RunnerResult | WorkOsError> => {
  const folder = await requireProjectFolder(request.projectPath);
  if (folder instanceof WorkOsError) return folder;

  const outcome = await runGitIn(folder, request.arguments, request.credential);
  return outcome instanceof WorkOsError ? outcome : { kind: "hostCommand", ...outcome };
};
