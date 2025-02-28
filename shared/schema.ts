import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  method: text("method").notNull(),
  headers: jsonb("headers").notNull(),
  body: jsonb("body").notNull(),
  path: text("path").notNull(),
});

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  timestamp: true,
});

export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;
