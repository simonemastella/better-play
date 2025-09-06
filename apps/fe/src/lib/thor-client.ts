import { ThorClient, TESTNET_URL } from '@vechain/sdk-network';

// Create a singleton Thor client instance for testnet
export const thorClient = ThorClient.at(TESTNET_URL);

// Export network configuration
export const networkConfig = {
  isMainnet: false,
  networkUrl: TESTNET_URL,
  network: 'testnet',
};