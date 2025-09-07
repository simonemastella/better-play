import { createFileRoute } from '@tanstack/react-router';
import { useWallet, useWalletModal } from '@vechain/vechain-kit';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const {
    connection: { isConnected },
    account,
  } = useWallet();

  const { open: openModal } = useWalletModal();

  const handleConnect = () => {
    openModal();
  };

  const handleDisconnect = () => {
    // Open modal to manage wallet connection
    openModal();
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center w-full space-y-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">
          Better Play
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          VeChain-powered gaming platform
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Wallet Connection</h2>
        
        {isConnected ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-green-600 font-medium text-lg mb-2">✓ Wallet Connected</p>
              {account?.address && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500 mb-1">Address:</p>
                  <p className="text-sm font-mono text-gray-700 break-all">
                    {account.address}
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleDisconnect}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Manage Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-gray-600 mb-4">
              Connect your VeChain wallet to get started
            </p>
            
            <button
              onClick={handleConnect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Connect Wallet
            </button>
            
            <p className="text-xs text-gray-500">
              Supports VeWorld, Sync2, and other VeChain wallets
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
