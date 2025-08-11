import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import * as schema from '../schema';

// Basic schemas without refinements
export const insertUserSchema = createInsertSchema(schema.users);
export const insertEventSchema = createInsertSchema(schema.events);
export const insertRoundSchema = createInsertSchema(schema.rounds);
export const insertTicketSchema = createInsertSchema(schema.tickets);
export const insertWinnerSchema = createInsertSchema(schema.winners);

// Custom validation schemas with proper validation
export const userValidationSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

export const eventValidationSchema = z.object({
  txId: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  logIndex: z.number().int().min(0),
  eventName: z.string().min(1),
  blockNumber: z.bigint().min(0n),
  decoded: z.any(),
});

export const ticketValidationSchema = z.object({
  ticketId: z.bigint().min(0n),
  roundId: z.number().int().min(0),
  buyer: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  price: z.bigint().min(0n),
  eventTxId: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  eventLogIndex: z.number().int().min(0),
});