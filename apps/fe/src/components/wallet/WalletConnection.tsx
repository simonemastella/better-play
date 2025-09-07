import { useWallet, useWalletModal } from '@vechain/vechain-kit'
import { Button } from '@/components/common/Button'
import { truncateAddress } from '@/utils/format'
import { cn } from '@/utils/cn'

interface WalletConnectionProps {
  className?: string
}

export function WalletConnection({ className }: WalletConnectionProps) {
  const wallet = useWallet()
  const { open: openModal } = useWalletModal()

  const handleConnect = () => {
    openModal()
  }

  const handleManage = () => {
    openModal()
  }

  if (wallet.connection.isConnected) {
    return (
      <ConnectedWallet 
        wallet={wallet}
        onManage={handleManage}
        className={className}
      />
    )
  }

  return (
    <DisconnectedWallet 
      onConnect={handleConnect}
      isConnecting={false}
      className={className}
    />
  )
}

interface ConnectedWalletProps {
  wallet: any
  onManage: () => void
  className?: string
}

function ConnectedWallet({ wallet, onManage, className }: ConnectedWalletProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-md p-6 w-full max-w-md", className)}>
      <h2 className="text-xl font-semibold mb-4 text-center">Wallet Connection</h2>
      
      <div className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center text-green-600 font-medium text-lg mb-2">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Wallet Connected
          </div>
          
          {wallet.account?.address && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Address:</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {truncateAddress(wallet.account.address, 8, 6)}
              </p>
            </div>
          )}
        </div>
        
        <Button
          variant="secondary"
          size="lg"
          onClick={onManage}
          className="w-full"
        >
          Manage Wallet
        </Button>
      </div>
    </div>
  )
}

interface DisconnectedWalletProps {
  onConnect: () => void
  isConnecting?: boolean
  className?: string
}

function DisconnectedWallet({ onConnect, isConnecting, className }: DisconnectedWalletProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-md p-6 w-full max-w-md", className)}>
      <h2 className="text-xl font-semibold mb-4 text-center">Wallet Connection</h2>
      
      <div className="space-y-4 text-center">
        <p className="text-gray-600 mb-4">
          Connect your VeChain wallet to get started
        </p>
        
        <Button
          variant="primary"
          size="lg"
          onClick={onConnect}
          isLoading={isConnecting}
          className="w-full"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        
        <p className="text-xs text-gray-500">
          Supports VeWorld, Sync2, and other VeChain wallets
        </p>
      </div>
    </div>
  )
}