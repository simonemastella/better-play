import { pgTable, text, timestamp, bigint, jsonb, integer, primaryKey } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  txId: text("tx_id").notNull(),
  logIndex: integer("log_index").notNull(),
  eventName: text("event_name").notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  decoded: jsonb("decoded").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.txId, table.logIndex] }),
]);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
