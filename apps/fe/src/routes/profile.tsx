import { createFileRoute } from '@tanstack/react-router'
import { useWallet } from '@vechain/vechain-kit'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { account } = useWallet()
  
  if (!account?.address) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please connect your wallet</h2>
          <p className="mt-2 text-gray-500">You need to connect your wallet to view your profile</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile & History</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Account Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Your wallet and gaming statistics</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{account.address}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="mt-1 text-sm text-gray-900">January 1, 2024</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Total Tickets Purchased</dt>
              <dd className="mt-1 text-sm text-gray-900">234</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Total Winnings</dt>
              <dd className="mt-1 text-sm text-gray-900 font-bold text-green-600">12,500 VET</dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Win Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">12.5%</dd>
            <p className="mt-2 text-sm text-gray-500">30 wins from 240 draws</p>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Average Win</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">416 VET</dd>
            <p className="mt-2 text-sm text-gray-500">Per winning ticket</p>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Lucky Number</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">7</dd>
            <p className="mt-2 text-sm text-gray-500">Most frequent in wins</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Transaction History</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          <li className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Ticket Purchase</p>
                <p className="text-sm text-gray-500">Draw #1235 - 5 tickets</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-600">-50 VET</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
            </div>
          </li>
          <li className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Prize Claim</p>
                <p className="text-sm text-gray-500">Draw #1234 - Won 3rd place</p>
                <p className="text-xs text-gray-400">Yesterday</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">+500 VET</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
            </div>
          </li>
          <li className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Ticket Purchase</p>
                <p className="text-sm text-gray-500">Draw #1234 - 3 tickets</p>
                <p className="text-xs text-gray-400">2 days ago</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-600">-30 VET</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}