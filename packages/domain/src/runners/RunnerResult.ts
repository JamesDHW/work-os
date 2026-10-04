import type { ChangedFile } from "../runs/ChangedFile.ts";

export type FolderEntry = {
  readonly name: string;
  readonly path: string;
  readonly isGitRepository: boolean;
};

export type CommandOutcome = {
  readonly exitCode: number;
  readonly output: string;
  readonly isTimedOut: boolean;
};

export type RunnerResult =
  | { readonly kind: "prepareEnvironment"; readonly workspacePath: string }
  | { readonly kind: "stopEnvironment" }
  | ({ readonly kind: "exec" } & CommandOutcome)
  | { readonly kind: "collectChanges"; readonly changedFiles: readonly ChangedFile[]; readonly diff: string | null }
  | ({ readonly kind: "hostCommand" } & CommandOutcome)
  | {
      readonly kind: "listFolders";
      readonly path: string;
      readonly parentPath: string | null;
      readonly folders: readonly FolderEntry[];
    };
