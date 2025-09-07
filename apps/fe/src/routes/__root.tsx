import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { VeChainKitProvider } from '@vechain/vechain-kit';

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <VeChainKitProvider
        dappKit={{}}
        network={{
          type: "test",
        }}
        loginMethods={[
          { method: "vechain", gridColumn: 4 },
          { method: "dappkit", gridColumn: 4 },
          { method: "ecosystem", gridColumn: 4 },
        ]}
        feeDelegation={{
          delegatorUrl: "https://sponsor-testnet.vechain.energy/by/90",
          delegateAllTransactions: false,
        }}
      >
        <div className="min-h-screen bg-gray-50">
          <Outlet />
        </div>
      </VeChainKitProvider>
    </QueryClientProvider>
  );
}
