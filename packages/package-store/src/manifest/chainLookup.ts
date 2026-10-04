import { NotFoundError } from "@work-os/shared/NotFoundError";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import { isSafeEntryName } from "../files/isSafeEntryName.ts";
import { listFolderNames } from "../files/listFolderNames.ts";
import type { PackageChain } from "./PackageChain.ts";

export type EntryReader<Entry> = (directory: string, folderName: string) => Promise<Entry | WorkOsError>;

export type ChainFolder = {
  readonly chain: PackageChain;
  readonly folder: string;
};

export const readFromChain = async <Entry>(location: ChainFolder, name: string, reader: EntryReader<Entry>): Promise<Entry | WorkOsError> => {
  if (!isSafeEntryName(name)) return new InvalidRequestError(`"${name}" is not a valid name.`);

  for (const source of location.chain.sources.toReversed()) {
    const entry = await reader(join(source.directory, location.folder, name), name);
    if (!(entry instanceof NotFoundError)) return entry;
  }
  return new NotFoundError(`${location.folder}/${name} does not exist in this workspace or the packages it extends.`);
};

export const listFromChain = async <Entry>(location: ChainFolder, reader: EntryReader<Entry>): Promise<readonly Awaited<Entry>[]> => {
  const namesBySource = await Promise.all(
    location.chain.sources.map((source) => listFolderNames(join(source.directory, location.folder))),
  );
  const names = [...new Set(namesBySource.flat())].toSorted();
  const entries = await Promise.all(names.map((name) => readFromChain(location, name, reader)));
  return entries.filter((entry): entry is Awaited<Entry> => !(entry instanceof WorkOsError));
};
