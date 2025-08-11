import { z, loadEnv, dotEnvSource, envVarsSource } from "@better-play/shared";

const envSchema = z.object({
  DATABASE_URL: z.string().default("postgresql://localhost:5432/better_play"),
});

export type Env = z.infer<typeof envSchema>;

export const env = loadEnv(envSchema, {
  sources: [
    dotEnvSource(".env"),
    envVarsSource(),
  ],
});