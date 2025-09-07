import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from './ErrorBoundary'
import type { ReactNode } from 'react'

interface QueryErrorBoundaryProps {
  children: ReactNode
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onError={(error) => {
            console.error('Query error:', error)
          }}
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="text-red-500 text-4xl mb-4">🔌</div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Connection Error
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Unable to connect to the blockchain. Please check your connection and try again.
                  </p>
                  <button
                    onClick={() => reset()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            </div>
          }
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}