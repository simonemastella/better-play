import { createFileRoute } from '@tanstack/react-router'
import { ConnectButton } from '../components/ConnectButton.tsx'
import { BuyTicket } from '../components/BuyTicket.tsx'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex justify-end">
        <ConnectButton />
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Welcome to</span>
          <span className="block text-indigo-600">Better Play</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Buy tickets, win prizes, and track your gaming history on the VeChain blockchain.
        </p>
        <div className="mt-8 max-w-md mx-auto">
          <BuyTicket />
        </div>
      </div>
      
      <div className="mt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8">
              <div className="-mt-6">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Real-time Draws</h3>
                <p className="mt-5 text-base text-gray-500">
                  Participate in live lottery draws with instant results on the blockchain.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8">
              <div className="-mt-6">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Secure & Transparent</h3>
                <p className="mt-5 text-base text-gray-500">
                  All transactions and draws are secured and verifiable on the VeChain blockchain.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8">
              <div className="-mt-6">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Win Rewards</h3>
                <p className="mt-5 text-base text-gray-500">
                  Win VET tokens and other rewards through our lottery system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}