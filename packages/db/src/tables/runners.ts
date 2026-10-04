import type { RunnerPlatform } from "@work-os/domain/runners/Runner";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const runners = sqliteTable("runners", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  name: text("name").notNull(),
  platform: text("platform").$type<RunnerPlatform>().notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  pairedAt: text("paired_at").notNull(),
  lastSeenAt: text("last_seen_at"),
});
