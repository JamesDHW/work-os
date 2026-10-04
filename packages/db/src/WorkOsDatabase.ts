import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";

import type { workOsSchema } from "./workOsSchema.ts";

export type WorkOsDatabase = SqliteRemoteDatabase<typeof workOsSchema>;
