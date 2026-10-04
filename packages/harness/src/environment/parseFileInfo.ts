import type { FileInfo, FileKind } from "@earendil-works/pi-durable/env";

import { joinPaths } from "./resolvePath.ts";

export const parseStatLine = (path: string, line: string): FileInfo => {
  const [typeName = "", size = "0", modifiedSeconds = "0"] = line.trim().split("|");
  return { name: path.split("/").at(-1) ?? path, path, kind: kindFromStat(typeName), size: Number(size), mtimeMs: Number(modifiedSeconds) * 1000 };
};

export const parseFindLine = (directory: string, line: string): FileInfo => {
  const [typeLetter = "", size = "0", modifiedSeconds = "0", ...nameParts] = line.split("|");
  const name = nameParts.join("|");
  return { name, path: joinPaths([directory, name]), kind: kindFromFind(typeLetter), size: Number(size), mtimeMs: Number(modifiedSeconds) * 1000 };
};

const kindFromStat = (typeName: string): FileKind => {
  switch (typeName) {
    case "directory":
      return "directory";
    case "symbolic link":
      return "symlink";
    default:
      return "file";
  }
};

const kindFromFind = (typeLetter: string): FileKind => {
  switch (typeLetter) {
    case "d":
      return "directory";
    case "l":
      return "symlink";
    default:
      return "file";
  }
};
