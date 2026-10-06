import { drizzle } from "drizzle-orm/sqlite-proxy";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { tryCatch, tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { WorkOsDatabase } from "./WorkOsDatabase.ts";
import { workOsSchema } from "./workOsSchema.ts";

export type OpenedDatabase = {
  readonly database: WorkOsDatabase;
  readonly close: () => WorkOsError | undefined;
};

type QueryMethod = "run" | "all" | "values" | "get";

export const openDatabase = async (path: string): Promise<OpenedDatabase | WorkOsError> => {
  const sqlite = tryCatch(() => new DatabaseSync(path));
  if (sqlite instanceof WorkOsError) return sqlite;

  const configured = tryCatch(() => sqlite.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;"));
  if (configured instanceof WorkOsError) return configured;

  const database = drizzle(createQueryCallback(sqlite), createBatchCallback(sqlite), { schema: workOsSchema });
  const migrated = await tryCatchAsync(() => migrate(database, createMigrationCallback(sqlite), { migrationsFolder: migrationsFolder() }));
  if (migrated instanceof WorkOsError) return migrated;

  return { database, close: () => closeSqlite(sqlite) };
};

const createQueryCallback = (sqlite: DatabaseSync) => {
  return async (sql: string, params: SQLInputValue[], method: QueryMethod) => {
    const statement = sqlite.prepare(sql);
    if (method === "run") {
      statement.run(...params);
      return { rows: [] };
    }
    const rows = statement.all(...params).map((row) => Object.values(row));
    if (method === "get") return { rows: rows[0] ?? [] };

    return { rows };
  };
};

type BatchEntry = {
  readonly sql: string;
  readonly params: SQLInputValue[];
  readonly method: QueryMethod;
};

const createBatchCallback = (sqlite: DatabaseSync) => {
  const runQuery = createQueryCallback(sqlite);
  // Statements run in order inside the transaction.
  const runEntries = async (batch: readonly BatchEntry[]) => Array.fromAsync(batch, async (entry) => runQuery(entry.sql, entry.params, entry.method));

  return async (batch: BatchEntry[]) => {
    sqlite.exec("BEGIN");
    const results = await tryCatchAsync(() => runEntries(batch));
    if (!(results instanceof WorkOsError)) {
      sqlite.exec("COMMIT");
      return results;
    }
    sqlite.exec("ROLLBACK");
    return Promise.reject(results);
  };
};

const createMigrationCallback = (sqlite: DatabaseSync) => {
  return async (migrationQueries: string[]): Promise<void> => {
    sqlite.exec("BEGIN");
    for (const query of migrationQueries) {
      sqlite.exec(query);
    }
    sqlite.exec("COMMIT");
  };
};

const migrationsFolder = (): string => new URL("../migrations", import.meta.url).pathname;

const closeSqlite = (sqlite: DatabaseSync): WorkOsError | undefined => {
  const closed = tryCatch(() => sqlite.close());
  return closed instanceof WorkOsError ? closed : undefined;
};
