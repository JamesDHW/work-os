import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pushSubscriptions = sqliteTable(
  "push_subscriptions",
  {
    endpoint: text("endpoint").primaryKey(),
    userId: text("user_id").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("push_subscriptions_user").on(table.userId)],
);
