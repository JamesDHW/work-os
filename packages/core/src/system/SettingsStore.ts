import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type SettingsStore = {
  readonly readSetting: (key: string) => Promise<string | null | WorkOsError>;
  readonly writeSetting: (key: string, value: string) => Promise<WorkOsError | undefined>;
};
