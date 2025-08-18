import { pgTable, text, bigint, integer, primaryKey } from "drizzle-orm/pg-core";
import { rounds } from "./rounds";
import { users } from "./users";

export const winners = pgTable("winners", {
  roundId: integer("round_id")
    .notNull()
    .references(() => rounds.roundId),
  position: integer("position").notNull(),
  winner: text("winner")
    .notNull()
    .references(() => users.address),
  prizeWon: bigint("prize_won", { mode: "number" }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.roundId, table.position] }),
]);

export type Winner = typeof winners.$inferSelect;
export type NewWinner = typeof winners.$inferInsert;
