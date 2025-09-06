import { z, loadEnv, dotEnvSource, envVarsSource } from "@better-play/shared";

// Contracts-specific environment schema
export const contractsEnvSchema = z.object({
  MNEMONIC: z.string(),
  X_ALLOCATION_VOTING_ADDRESS: z.string(),
  PAYMENT_TOKEN_ADDRESS: z.string(),
  INITIAL_TICKET_PRICE: z.string(),
  INITIAL_PRIZES: z.string(),
});

export type ContractsEnv = z.infer<typeof contractsEnvSchema>;

// Load contracts environment with standard sources
export function loadContractsEnv(additionalSources: any[] = []): ContractsEnv {
  return loadEnv(contractsEnvSchema, {
    sources: [dotEnvSource(".env"), envVarsSource(), ...additionalSources],
  });
}
