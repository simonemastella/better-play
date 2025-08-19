import { pgTable, text, primaryKey, integer } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const userRoles = pgTable("user_roles", {
  userAddress: text("user_address")
    .notNull()
    .references(() => users.address),
  role: text("role", { 
    enum: ["ADMIN_ROLE", "OPERATOR_ROLE", "TREASURER_ROLE", "PAUSER_ROLE"] 
  }).notNull(),
  eventTxId: text("event_tx_id").notNull(),
  eventLogIndex: integer("event_log_index").notNull(),
}, (table) => [
  primaryKey({ columns: [table.userAddress, table.role] }),
]);

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;