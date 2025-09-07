export interface WalletAccount {
  address: string
}

export interface WalletConnection {
  isConnected: boolean
  isConnecting?: boolean
}

export interface WalletState {
  connection: WalletConnection
  account?: WalletAccount | null
}