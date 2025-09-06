import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { WalletButton } from '@vechain/vechain-kit'

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold">Better Play</h1>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link 
                      to="/" 
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      activeProps={{ className: 'border-indigo-500 text-gray-900' }}
                    >
                      Home
                    </Link>
                    <Link 
                      to="/tickets" 
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      activeProps={{ className: 'border-indigo-500 text-gray-900' }}
                    >
                      Tickets
                    </Link>
                    <Link 
                      to="/profile" 
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      activeProps={{ className: 'border-indigo-500 text-gray-900' }}
                    >
                      Profile
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <WalletButton />
                </div>
              </div>
            </div>
          </nav>
          <main>
            <Outlet />
          </main>
        </div>
      </>
    )
  },
})