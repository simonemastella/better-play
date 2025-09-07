/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_VECHAIN_NETWORK: string
  readonly VITE_VECHAIN_NODE_URL: string
  readonly VITE_VECHAIN_NETWORK_ID: string
  readonly VITE_DELEGATOR_URL: string
  readonly VITE_DAPPIE_ADDRESS: string
  readonly VITE_B3TR_CONTRACT_ADDRESS: string
  readonly VITE_B3TR_ADDRESS?: string
  readonly VITE_PASSPORT_CONTRACT_ADDRESS: string
  readonly VITE_PAYMENT_GATEWAY_ADDRESS: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENVIRONMENT: string
  readonly VITE_ENABLE_DEVTOOLS: string
  readonly VITE_ENABLE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// VeChain wallet global types
interface Window {
  vechain?: {
    vendor: {
      sign: (type: 'tx', clauses: any[]) => {
        signer: (address: string) => any;
        comment: (text: string) => any;
        request: () => Promise<{ txid: string }>;
      };
    };
    thor: {
      transaction: (txid: string) => {
        getReceipt: () => Promise<any>;
      };
    };
  };
}