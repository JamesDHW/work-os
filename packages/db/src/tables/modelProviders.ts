import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const modelProviders = sqliteTable("model_providers", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  name: text("name").notNull(),
  baseUrl: text("base_url"),
  sealedApiKey: text("sealed_api_key"),
  createdAt: text("created_at").notNull(),
});
