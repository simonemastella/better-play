import { z, loadEnv, dotEnvSource, envVarsSource } from "@better-play/shared";

const envSchema = z.object({
  LOTTERY_CONTRACT_ADDRESS: z.string(),
  NETWORK: z.enum(["mainnet", "testnet"]),
  STARTING_BLOCK: z.coerce.number().default(0),
  POLLING_INTERVAL: z.coerce.number().default(5000),
});

export type Env = z.infer<typeof envSchema>;

export const env = loadEnv(envSchema, {
  sources: [dotEnvSource(".env"), envVarsSource()],
}) as Env;
