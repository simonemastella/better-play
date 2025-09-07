import { env } from './env'

export const vechainConfig = {
  dappKit: {},
  network: {
    type: env.VITE_VECHAIN_NETWORK === 'mainnet' ? 'main' as const : 'test' as const,
  },
  loginMethods: [
    { method: 'vechain' as const, gridColumn: 4 },
    { method: 'dappkit' as const, gridColumn: 4 },
    { method: 'ecosystem' as const, gridColumn: 4 },
  ],
  feeDelegation: {
    delegatorUrl: env.VITE_DELEGATOR_URL,
    delegateAllTransactions: false,
  },
}

// Contract addresses can be added here when needed
// export const contractAddresses = {
//   // Add your contract addresses here
// } as const