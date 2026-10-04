import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { SecretVault } from "../connections/SecretVault.ts";
import type { SettingsStore } from "../system/SettingsStore.ts";
import { PUSH_KEYS_SETTING } from "./notifications.constants.ts";
import type { PushKeys } from "./PushKeys.ts";

type EnsurePushKeysDependencies = {
  readonly settingsStore: SettingsStore;
  readonly secretVault: SecretVault;
  readonly generatePushKeys: () => PushKeys;
  readonly parsePushKeys: (serialized: string) => PushKeys | WorkOsError;
};

export type EnsurePushKeys = () => Promise<PushKeys | WorkOsError>;

export const createEnsurePushKeys = (dependencies: EnsurePushKeysDependencies): EnsurePushKeys => {
  return async () => {
    const sealed = await dependencies.settingsStore.readSetting(PUSH_KEYS_SETTING);
    if (sealed instanceof WorkOsError) return sealed;
    if (sealed !== null) return openPushKeys(dependencies, sealed);

    const generated = dependencies.generatePushKeys();
    const sealedKeys = await dependencies.secretVault.sealSecret(JSON.stringify(generated));
    if (sealedKeys instanceof WorkOsError) return sealedKeys;

    const written = await dependencies.settingsStore.writeSetting(PUSH_KEYS_SETTING, sealedKeys);
    if (written instanceof WorkOsError) return written;

    return generated;
  };
};

const openPushKeys = async (dependencies: EnsurePushKeysDependencies, sealed: string): Promise<PushKeys | WorkOsError> => {
  const serialized = await dependencies.secretVault.openSecret(sealed);
  if (serialized instanceof WorkOsError) return serialized;

  return dependencies.parsePushKeys(serialized);
};
