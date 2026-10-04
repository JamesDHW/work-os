import type { Extension } from "@work-os/sdk/defineExtension";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { access } from "fs/promises";
import { join } from "path";

import { EXTENSION_ENTRY } from "../files/files.constants.ts";
import type { PackageSource } from "../manifest/PackageChain.ts";
import { InvalidExtensionError, isExtensionModule } from "./isExtensionModule.ts";

export const loadExtension = async (source: PackageSource): Promise<Extension | null | WorkOsError> => {
  if (!source.isBundled) return null;

  const entryPath = join(source.directory, EXTENSION_ENTRY);
  const exists = await tryCatchAsync(() => access(entryPath));
  if (exists instanceof WorkOsError) return null;

  // oxlint-disable-next-line architecture/allowed-imports -- Bundled extensions are named in workos.yaml, so their entry path is only known at runtime.
  const loaded = await tryCatchAsync((): Promise<unknown> => import(`file://${entryPath}`));
  if (loaded instanceof WorkOsError) return loaded;
  if (!isExtensionModule(loaded)) return new InvalidExtensionError(`${entryPath} must export an extension made with defineExtension.`);

  return loaded.extension;
};
