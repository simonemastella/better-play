import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { rounds } from "./rounds.js";
import { tickets } from "./tickets.js";
import { winners } from "./winners.js";
import { events } from "./events.js";
import { userRoles } from "./user-roles.js";

export const usersRelations = relations(users, ({ many }) => ({
  tickets: many(tickets),
  winners: many(winners),
  roles: many(userRoles),
}));

export const roundsRelations = relations(rounds, ({ many }) => ({
  tickets: many(tickets),
  winners: many(winners),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  user: one(users, {
    fields: [tickets.buyer],
    references: [users.address],
  }),
  round: one(rounds, {
    fields: [tickets.roundId],
    references: [rounds.roundId],
  }),
  event: one(events, {
    fields: [tickets.eventTxId, tickets.eventLogIndex],
    references: [events.txId, events.logIndex],
  }),
}));

export const winnersRelations = relations(winners, ({ one }) => ({
  user: one(users, {
    fields: [winners.winner],
    references: [users.address],
  }),
  round: one(rounds, {
    fields: [winners.roundId],
    references: [rounds.roundId],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  tickets: many(tickets),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userAddress],
    references: [users.address],
  }),
  event: one(events, {
    fields: [userRoles.eventTxId, userRoles.eventLogIndex],
    references: [events.txId, events.logIndex],
  }),
}));