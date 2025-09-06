import { createFileRoute } from '@tanstack/react-router'
import { useWallet } from '@vechain/vechain-kit'
import { BuyTicket } from '../components/BuyTicket'

export const Route = createFileRoute('/tickets')({
  component: TicketsPage,
})

function TicketsPage() {
  const { account } = useWallet()
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tickets</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Buy Tickets</h2>
            
            <BuyTicket />
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Current Draw</h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Next draw in: <span className="font-bold">2h 34m 12s</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Prize Pool</p>
                  <p className="text-2xl font-bold text-gray-900">50,000 VET</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tickets Sold</p>
                  <p className="text-2xl font-bold text-gray-900">4,234</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Your Past Wins</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {account?.address ? (
            <>
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">Draw #1234</p>
                    <p className="text-sm text-gray-500">January 15, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Won: 500 VET</p>
                    <p className="text-sm text-gray-500">3 tickets</p>
                  </div>
                </div>
              </li>
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">Draw #1230</p>
                    <p className="text-sm text-gray-500">January 10, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Won: 1,200 VET</p>
                    <p className="text-sm text-gray-500">5 tickets</p>
                  </div>
                </div>
              </li>
            </>
          ) : (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              Connect your wallet to see your winning history
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}