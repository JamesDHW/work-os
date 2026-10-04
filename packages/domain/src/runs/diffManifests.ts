import type { ChangedFile, FileManifest } from "./ChangedFile.ts";

export const diffManifests = (before: FileManifest, after: FileManifest): readonly ChangedFile[] => {
  const paths = [...new Set([...Object.keys(before), ...Object.keys(after)])].toSorted();
  return paths.flatMap((path) => describeChange(path, before[path], after[path]));
};

const describeChange = (path: string, beforeHash: string | undefined, afterHash: string | undefined): readonly ChangedFile[] => {
  if (beforeHash === undefined) return [{ path, change: "added" }];
  if (afterHash === undefined) return [{ path, change: "deleted" }];
  if (beforeHash === afterHash) return [];

  return [{ path, change: "modified" }];
};
