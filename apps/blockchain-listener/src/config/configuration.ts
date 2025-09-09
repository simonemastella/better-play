import { loadEnv, dotEnvSource, envVarsSource, z } from "@better-play/shared";

const envSchema = z.object({
  // Blockchain Configuration
  NETWORK: z.enum(["mainnet", "testnet"]),
  LOTTERY_CONTRACT_ADDRESS: z.string(),
  STARTING_BLOCK: z.coerce.number(),
  POLLING_INTERVAL: z.coerce.number(),

  // Database Configuration
  DATABASE_URL: z.string(),
});
export type BlEnv = z.infer<typeof envSchema>;

const env = loadEnv<BlEnv>(envSchema, {
  sources: [dotEnvSource(".env"), envVarsSource()],
});

export const configuration = () => ({
  blockchain: {
    network: env.NETWORK,
    lotteryContractAddress: env.LOTTERY_CONTRACT_ADDRESS,
    startingBlock: env.STARTING_BLOCK,
    pollingInterval: env.POLLING_INTERVAL,
  },
  database: {
    url: env.DATABASE_URL,
  },
});

export type Configuration = ReturnType<typeof configuration>;
