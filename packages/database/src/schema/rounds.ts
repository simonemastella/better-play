import { pgTable, bigint, integer, jsonb, boolean } from "drizzle-orm/pg-core";

export const rounds = pgTable("rounds", {
  roundId: integer("round_id").primaryKey().notNull(),
  ticketPrice: bigint("ticket_price", { mode: "number" }).notNull(),
  prizes: jsonb("prizes").notNull().$type<number[]>(), // [5000, 3000, 2000] for 50%, 30%, 20%
  nextTicketId: bigint("next_ticket_id", { mode: "number" })
    .default(0)
    .notNull(),
  prizePool: bigint("prize_pool", { mode: "number" })
    .default(0)
    .notNull(),
  endBlock: bigint("end_block", { mode: "number" }),
  revealed: boolean("revealed").default(false).notNull(),
});

export type Round = typeof rounds.$inferSelect;
export type NewRound = typeof rounds.$inferInsert;
