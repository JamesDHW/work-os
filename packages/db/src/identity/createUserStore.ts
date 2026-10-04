import type { UserStore } from "@work-os/core/identity/UserStore";
import { toUserId } from "@work-os/domain/identifiers/Identifiers";
import type { User } from "@work-os/domain/workspaces/User";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { count, eq } from "drizzle-orm";

import { users } from "../tables/users.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

export const createUserStore = (database: WorkOsDatabase): UserStore => {
  const countUsers = async (): Promise<number | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select({ total: count() }).from(users));
    if (rows instanceof WorkOsError) return rows;

    return rows[0]?.total ?? 0;
  };

  const createUser = async (user: User): Promise<User | WorkOsError> => {
    const inserted = await tryCatchAsync(() => database.insert(users).values(user));
    if (inserted instanceof WorkOsError) return inserted;

    return user;
  };

  const findUser = async (userId: User["id"]): Promise<User | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(users).where(eq(users.id, userId)));
    if (rows instanceof WorkOsError) return rows;

    const row = rows[0];
    if (row === undefined) return new NotFoundError(`User ${userId} does not exist.`);
    return { ...row, id: toUserId(row.id) };
  };

  return { countUsers, createUser, findUser };
};
