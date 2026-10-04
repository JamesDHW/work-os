import type { Passkey, PasskeyStore } from "@work-os/core/identity/PasskeyStore";
import { toUserId, type UserId } from "@work-os/domain/identifiers/Identifiers";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { eq } from "drizzle-orm";

import { passkeys } from "../tables/passkeys.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

type PasskeyRow = typeof passkeys.$inferSelect;

export const createPasskeyStore = (database: WorkOsDatabase): PasskeyStore => {
  const savePasskey = async (passkey: Passkey): Promise<Passkey | WorkOsError> => {
    const inserted = await tryCatchAsync(() => database.insert(passkeys).values(passkey));
    if (inserted instanceof WorkOsError) return inserted;

    return passkey;
  };

  const listPasskeysForUser = async (userId: UserId): Promise<readonly Passkey[] | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(passkeys).where(eq(passkeys.userId, userId)));
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toPasskey);
  };

  const findPasskey = async (credentialId: string): Promise<Passkey | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(passkeys).where(eq(passkeys.credentialId, credentialId)));
    if (rows instanceof WorkOsError) return rows;

    const row = rows[0];
    if (row === undefined) return new NotFoundError("The passkey is not registered.");
    return toPasskey(row);
  };

  const updatePasskeyCounter = async (credentialId: string, counter: number): Promise<WorkOsError | undefined> => {
    const updated = await tryCatchAsync(() => database.update(passkeys).set({ counter }).where(eq(passkeys.credentialId, credentialId)));
    return updated instanceof WorkOsError ? updated : undefined;
  };

  return { savePasskey, listPasskeysForUser, findPasskey, updatePasskeyCounter };
};

const toPasskey = (row: PasskeyRow): Passkey => ({ ...row, userId: toUserId(row.userId) });
