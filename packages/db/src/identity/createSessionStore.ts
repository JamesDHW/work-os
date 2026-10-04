import type { Session, SessionStore } from "@work-os/core/identity/SessionStore";
import { toUserId } from "@work-os/domain/identifiers/Identifiers";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { eq } from "drizzle-orm";

import { sessions } from "../tables/sessions.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

export const createSessionStore = (database: WorkOsDatabase): SessionStore => {
  const createSession = async (session: Session): Promise<Session | WorkOsError> => {
    const inserted = await tryCatchAsync(() => database.insert(sessions).values(session));
    if (inserted instanceof WorkOsError) return inserted;

    return session;
  };

  const findSession = async (tokenHash: string): Promise<Session | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(sessions).where(eq(sessions.tokenHash, tokenHash)));
    if (rows instanceof WorkOsError) return rows;

    const row = rows[0];
    if (row === undefined) return new NotFoundError("The session does not exist.");
    return { ...row, userId: toUserId(row.userId) };
  };

  const deleteSession = async (tokenHash: string): Promise<WorkOsError | undefined> => {
    const deleted = await tryCatchAsync(() => database.delete(sessions).where(eq(sessions.tokenHash, tokenHash)));
    return deleted instanceof WorkOsError ? deleted : undefined;
  };

  return { createSession, findSession, deleteSession };
};
