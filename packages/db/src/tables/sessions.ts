import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id").notNull(),
    createdAt: text("created_at").notNull(),
    expiresAt: text("expires_at").notNull(),
  },
  (table) => [index("sessions_user_id").on(table.userId)],
);
