import { loadEnv, dotEnvSource, envVarsSource, z } from "@better-play/shared";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string().optional(),
  FRONTEND_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

export const env = loadEnv(envSchema, {
  sources: [dotEnvSource()],
});
