import { createFileRoute, Link } from '@tanstack/react-router'
import { useWallet, useWalletModal } from '@vechain/vechain-kit'
import { AnimatedBackground } from '@/components/common/AnimatedBackground'
import { truncateAddress } from '@/utils/format'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const wallet = useWallet()
  const { open: openWalletModal } = useWalletModal()

  const handleWalletAction = () => {
    openWalletModal()
  }
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground showDice={true} />
      
      {/* Hero Section */}
      <div className="relative z-10 pt-12 pb-8 md:pb-4 px-8 min-h-[300px] md:min-h-0">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-blue-400 to-purple-500 bg-clip-text text-transparent mb-4 leading-tight">
            Better Play
          </h1>
          
          {/* Decentralization Text */}
          <p className="text-lg text-gray-300 max-w-lg mx-auto mb-12">
            Fully decentralized gaming on VeChain. Transparent, fair, on-chain verified.
          </p>
          
        </div>
      </div>

      {/* Login Section */}
      <div className="relative z-10 w-full bg-black/30 backdrop-blur-sm border-t border-b border-gray-600 py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                Ready to Play?
              </h2>
              <p className="text-gray-300">
                Connect your VeChain wallet to access all features and earn rewards
              </p>
            </div>
            
            <div className="flex items-center ml-8">
              <button 
                onClick={handleWalletAction}
                className="btn-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-8 text-lg font-semibold"
              >
                {wallet.connection.isConnected 
                  ? `Connected: ${truncateAddress(wallet.account?.address || '', 6, 4)}` 
                  : 'Connect VeChain Wallet'
                }
              </button>
            </div>
          </div>

          {/* Games Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lottery Game */}
            <div className="card bg-black/20 backdrop-blur-sm border-gray-600">
              <div className="card-content text-center">
                <div className="text-3xl mb-3">🎰</div>
                <h3 className="text-lg font-bold text-white mb-2">Lottery</h3>
                <p className="text-gray-300 text-xs mb-3">
                  Win big with our decentralized lottery
                </p>
                <Link to="/lottery">
                  <button className="btn-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 text-sm w-full">
                    Play Now
                  </button>
                </Link>
              </div>
            </div>

            {/* Coming Soon Game 1 */}
            <div className="card bg-black/10 backdrop-blur-sm border-gray-700 opacity-60">
              <div className="card-content text-center">
                <div className="text-3xl mb-3">🎲</div>
                <h3 className="text-lg font-bold text-white mb-2">Dice Games</h3>
                <p className="text-gray-400 text-xs mb-3">
                  Roll the dice and test your luck
                </p>
                <div className="py-2 px-4 bg-gray-600 text-gray-300 rounded-lg text-xs">
                  Coming Soon
                </div>
              </div>
            </div>

            {/* Coming Soon Game 2 */}
            <div className="card bg-black/10 backdrop-blur-sm border-gray-700 opacity-60">
              <div className="card-content text-center">
                <div className="text-3xl mb-3">♠️</div>
                <h3 className="text-lg font-bold text-white mb-2">Card Games</h3>
                <p className="text-gray-400 text-xs mb-3">
                  Poker, Blackjack and more
                </p>
                <div className="py-2 px-4 bg-gray-600 text-gray-300 rounded-lg text-xs">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm border-t border-blue-500/30 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Platform Statistics
            </h2>
            <p className="text-blue-200 text-lg">
              Live metrics from our decentralized gaming platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card bg-blue-900/40 backdrop-blur-sm border-blue-400/30 hover:border-blue-400/60 transition-colors">
              <div className="card-content text-center">
                <div className="text-4xl font-bold text-blue-300 mb-2">1,247</div>
                <div className="text-blue-100 text-sm font-medium">Total Games Played</div>
              </div>
            </div>
            <div className="card bg-green-900/40 backdrop-blur-sm border-green-400/30 hover:border-green-400/60 transition-colors">
              <div className="card-content text-center">
                <div className="text-4xl font-bold text-green-300 mb-2">892</div>
                <div className="text-green-100 text-sm font-medium">Winners</div>
              </div>
            </div>
            <div className="card bg-purple-900/40 backdrop-blur-sm border-purple-400/30 hover:border-purple-400/60 transition-colors">
              <div className="card-content text-center">
                <div className="text-4xl font-bold text-purple-300 mb-2">156.7</div>
                <div className="text-purple-100 text-sm font-medium">B3TR Won</div>
              </div>
            </div>
            <div className="card bg-orange-900/40 backdrop-blur-sm border-orange-400/30 hover:border-orange-400/60 transition-colors">
              <div className="card-content text-center">
                <div className="text-4xl font-bold text-orange-300 mb-2">99.2%</div>
                <div className="text-orange-100 text-sm font-medium">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Section */}
      <div className="relative z-10 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 backdrop-blur-sm border-t border-emerald-500/30 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
              Transparency & Trust
            </h2>
            <p className="text-emerald-200 text-lg">
              Open-source, verifiable, and community-driven
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Documentation Card */}
            <div className="card bg-emerald-900/30 backdrop-blur-sm border-emerald-400/30 hover:border-emerald-400/50 transition-colors">
              <div className="card-content">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">📚</div>
                  <h3 className="text-2xl font-bold text-emerald-100">Documentation</h3>
                </div>
                <p className="text-emerald-200 text-sm mb-6">
                  Complete documentation covering game mechanics, smart contracts, and fairness proofs.
                </p>
                <div className="flex flex-col gap-3">
                  <a 
                    href="#" 
                    className="text-emerald-400 hover:text-emerald-300 text-sm underline font-medium"
                  >
                    Game Rules & Mechanics
                  </a>
                  <a 
                    href="#" 
                    className="text-emerald-400 hover:text-emerald-300 text-sm underline font-medium"
                  >
                    Smart Contract Audits
                  </a>
                  <a 
                    href="#" 
                    className="text-emerald-400 hover:text-emerald-300 text-sm underline font-medium"
                  >
                    Fairness Verification
                  </a>
                </div>
              </div>
            </div>

            {/* Open Source Card */}
            <div className="card bg-teal-900/30 backdrop-blur-sm border-teal-400/30 hover:border-teal-400/50 transition-colors">
              <div className="card-content">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">⚡</div>
                  <h3 className="text-2xl font-bold text-teal-100">Open Source</h3>
                </div>
                <p className="text-teal-200 text-sm mb-6">
                  Full transparency through open-source code. Verify, audit, and contribute to our platform.
                </p>
                <div className="flex flex-col gap-3">
                  <a 
                    href="#" 
                    className="text-teal-400 hover:text-teal-300 text-sm underline flex items-center gap-2 font-medium"
                  >
                    <span>🔗</span>
                    GitHub Repository
                  </a>
                  <a 
                    href="#" 
                    className="text-teal-400 hover:text-teal-300 text-sm underline flex items-center gap-2 font-medium"
                  >
                    <span>🔍</span>
                    Contract Verification
                  </a>
                  <a 
                    href="#" 
                    className="text-teal-400 hover:text-teal-300 text-sm underline flex items-center gap-2 font-medium"
                  >
                    <span>📊</span>
                    Live Analytics
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Trust Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-emerald-800/20 border border-emerald-500/20 rounded-lg">
              <div className="text-5xl mb-4">🛡️</div>
              <h4 className="text-xl font-bold text-emerald-100 mb-3">Provably Fair</h4>
              <p className="text-emerald-200 text-sm">
                All games use cryptographic proofs that can be independently verified
              </p>
            </div>
            <div className="text-center p-6 bg-teal-800/20 border border-teal-500/20 rounded-lg">
              <div className="text-5xl mb-4">🔒</div>
              <h4 className="text-xl font-bold text-teal-100 mb-3">Decentralized</h4>
              <p className="text-teal-200 text-sm">
                No central authority - all game logic runs on VeChain blockchain
              </p>
            </div>
            <div className="text-center p-6 bg-cyan-800/20 border border-cyan-500/20 rounded-lg">
              <div className="text-5xl mb-4">👥</div>
              <h4 className="text-xl font-bold text-cyan-100 mb-3">Community Driven</h4>
              <p className="text-cyan-200 text-sm">
                Open governance allowing community input on platform development
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
