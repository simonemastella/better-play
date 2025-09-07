import { z, loadEnv } from '@better-play/shared'

const envSchema = z.object({
  VITE_APP_NAME: z.string(),
  VITE_VECHAIN_NETWORK: z.enum(['mainnet', 'testnet']),
  VITE_DELEGATOR_URL: z.string(),
})

export type AppEnv = z.infer<typeof envSchema>

// Create a custom env source that uses Vite's import.meta.env
const viteEnvSource = () => ({
  name: 'vite-env',
  load: () => ({
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_VECHAIN_NETWORK: import.meta.env.VITE_VECHAIN_NETWORK,
    VITE_DELEGATOR_URL: import.meta.env.VITE_DELEGATOR_URL,
  })
})

export const env = loadEnv(envSchema, {
  sources: [viteEnvSource()],
})
