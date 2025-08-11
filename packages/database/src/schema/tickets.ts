import {
  pgTable,
  text,
  bigint,
  index,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { rounds } from "./rounds";

export const tickets = pgTable(
  "tickets",
  {
    ticketId: bigint("ticket_id", { mode: "bigint" }).notNull(),
    roundId: integer("round_id")
      .notNull()
      .references(() => rounds.roundId),
    buyer: text("buyer")
      .notNull()
      .references(() => users.address),
    eventTxId: text("event_tx_id").notNull(),
    eventLogIndex: integer("event_log_index").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.ticketId, table.roundId] }),
    index("tickets_round_idx").on(table.roundId),
    index("tickets_buyer_idx").on(table.buyer),
  ]
);

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
