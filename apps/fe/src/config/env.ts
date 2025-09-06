import { z } from '@better-play/shared'

const envSchema = z.object({
  VITE_NODE_URL: z.string().url(),
  VITE_NETWORK: z.enum(['main', 'test']),
})

// In the browser, we use Vite's import.meta.env
export const env = envSchema.parse({
  VITE_NODE_URL: import.meta.env.VITE_NODE_URL,
  VITE_NETWORK: import.meta.env.VITE_NETWORK,
})

export type Env = z.infer<typeof envSchema>