import type { SettingsStore } from "@work-os/core/system/SettingsStore";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { eq } from "drizzle-orm";

import { settings } from "../tables/settings.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

export const createSettingsStore = (database: WorkOsDatabase): SettingsStore => {
  const readSetting = async (key: string): Promise<string | null | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(settings).where(eq(settings.key, key)));
    if (rows instanceof WorkOsError) return rows;

    return rows[0]?.value ?? null;
  };

  const writeSetting = async (key: string, value: string): Promise<WorkOsError | undefined> => {
    const written = await tryCatchAsync(() =>
      database.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } }),
    );
    return written instanceof WorkOsError ? written : undefined;
  };

  return { readSetting, writeSetting };
};
