/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_URL: string
  readonly VITE_NETWORK: 'main' | 'test'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}