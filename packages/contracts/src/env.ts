import { z, loadEnv, dotEnvSource, envVarsSource } from "@better-play/shared";

const envSchema = z.object({
  MNEMONIC: z.string(),
  X_ALLOCATION_VOTING_ADDRESS: z.string(),
  PAYMENT_TOKEN_ADDRESS: z.string(),
  INITIAL_TICKET_PRICE: z.string(),
  INITIAL_PRIZES: z.string(),
});

export type Env = z.infer<typeof envSchema>;

// Load from multiple sources with priority (later sources override earlier ones)
export const env = loadEnv(envSchema, {
  sources: [
    dotEnvSource(".env"), // Then .env
    envVarsSource(), // Finally, process.env
  ],
});
