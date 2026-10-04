import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const passkeys = sqliteTable("passkeys", {
  credentialId: text("credential_id").primaryKey(),
  userId: text("user_id").notNull(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").notNull(),
  transports: text("transports", { mode: "json" }).$type<readonly string[]>().notNull(),
  createdAt: text("created_at").notNull(),
});
