export type FileChange = "added" | "modified" | "deleted";

export type ChangedFile = {
  readonly path: string;
  readonly change: FileChange;
};

export type FileManifest = Readonly<Record<string, string>>;
