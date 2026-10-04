import type { WorkspacePackages } from "@work-os/core/catalogue/WorkspacePackages";
import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import { readAgent } from "./agents/readAgent.ts";
import { readEnvironment } from "./environments/readEnvironment.ts";
import { AGENTS_FOLDER, ENVIRONMENTS_FOLDER, SKILLS_FOLDER, STANDARDS_FOLDER } from "./files/files.constants.ts";
import { runGit } from "./git/runGit.ts";
import { listFromChain, readFromChain, type EntryReader } from "./manifest/chainLookup.ts";
import { readModelAliases } from "./manifest/readModelAliases.ts";
import { resolvePackageChain } from "./manifest/resolvePackageChain.ts";
import { readSkill } from "./skills/readSkill.ts";
import { readStandard } from "./standards/readStandard.ts";
import { createEnsurePackage } from "./workspace/ensurePackage.ts";
import { createSaveStandardFiles } from "./workspace/saveStandardFiles.ts";

export type WorkspacePackagesOptions = {
  readonly workspacesDirectory: string;
  readonly bundledDirectory: string;
  readonly defaultModel: string;
  readonly defaultExtends: readonly string[];
};

export const createWorkspacePackages = (options: WorkspacePackagesOptions): WorkspacePackages => {
  const workspaceDirectory = (workspaceId: WorkspaceId): string => join(options.workspacesDirectory, workspaceId);
  const chainFor = (workspaceId: WorkspaceId) =>
    resolvePackageChain({ workspaceDirectory: workspaceDirectory(workspaceId), bundledDirectory: options.bundledDirectory });

  const listEntries = async <Entry>(workspaceId: WorkspaceId, folder: string, reader: EntryReader<Entry>) => {
    const chain = await chainFor(workspaceId);
    if (chain instanceof WorkOsError) return chain;
    return listFromChain({ chain, folder }, reader);
  };

  const readEntry = async <Entry>(workspaceId: WorkspaceId, folder: string, name: string, reader: EntryReader<Entry>) => {
    const chain = await chainFor(workspaceId);
    if (chain instanceof WorkOsError) return chain;
    return readFromChain({ chain, folder }, name, reader);
  };

  return {
    ensurePackage: createEnsurePackage({ workspaceDirectory, ...options }),
    readRevision: async (workspaceId) => runGit(workspaceDirectory(workspaceId), ["rev-parse", "HEAD"]),
    listStandards: async (workspaceId) => listEntries(workspaceId, STANDARDS_FOLDER, readStandard),
    readStandard: async (workspaceId, standardId) => readEntry(workspaceId, STANDARDS_FOLDER, standardId, readStandard),
    saveStandard: createSaveStandardFiles({ workspaceDirectory }),
    listAgents: async (workspaceId) => listEntries(workspaceId, AGENTS_FOLDER, readAgent),
    readAgent: async (workspaceId, agentId) => readEntry(workspaceId, AGENTS_FOLDER, agentId, readAgent),
    listEnvironments: async (workspaceId) => listEntries(workspaceId, ENVIRONMENTS_FOLDER, readEnvironment),
    readEnvironment: async (workspaceId, environmentId) => readEntry(workspaceId, ENVIRONMENTS_FOLDER, environmentId, readEnvironment),
    readSkill: async (workspaceId, name) => readEntry(workspaceId, SKILLS_FOLDER, name, readSkill),
    readModelAliases: async (workspaceId) => {
      const chain = await chainFor(workspaceId);
      if (chain instanceof WorkOsError) return chain;
      return readModelAliases(chain);
    },
  };
};
