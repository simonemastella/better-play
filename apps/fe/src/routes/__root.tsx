import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { VeChainKitProvider } from '@vechain/vechain-kit'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { QueryErrorBoundary } from '@/components/common/QueryErrorBoundary'
import { vechainConfig } from '@/config/vechain'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry if it's a 4xx error
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <QueryErrorBoundary>
          <VeChainKitProvider {...vechainConfig}>
            <div className="min-h-screen bg-gray-50">
              <Outlet />
            </div>
          </VeChainKitProvider>
        </QueryErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
