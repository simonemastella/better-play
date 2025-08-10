import { z, loadEnv, jsonFileSource, dotEnvSource, envVarsSource } from '@better-play/shared';

const envSchema = z.object({
  VECHAIN_PRIVATE_KEY: z.string(),
});

export type Env = z.infer<typeof envSchema>;

// Load from multiple sources with priority (later sources override earlier ones)
export const env = loadEnv(envSchema, {
  sources: [
    jsonFileSource('./secrets.json'),  // First try secrets.json
    dotEnvSource('.env.local'),        // Then .env.local
    dotEnvSource('.env'),              // Then .env
    envVarsSource(),                   // Finally, process.env
  ]
});