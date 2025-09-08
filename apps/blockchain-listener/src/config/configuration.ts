import { loadEnv, dotEnvSource, envVarsSource } from '@better-play/shared';
import { z } from 'zod';

const envSchema = z.object({
  // Blockchain Configuration
  NETWORK: z.enum(['mainnet', 'testnet']).default('testnet'),
  LOTTERY_CONTRACT_ADDRESS: z.string(),
  STARTING_BLOCK: z.coerce.number().default(0),
  POLLING_INTERVAL: z.coerce.number().default(5000),
  
  // Database Configuration
  DATABASE_URL: z.string(),
});

const env = loadEnv(envSchema, dotEnvSource('.env'), envVarsSource());

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