import { WalletConnection } from '@/components/wallet/WalletConnection'

export function LoginSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-800/20 to-emerald-800/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent" />
      
      <div className="relative z-10 text-center space-y-8 px-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Better Play
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            VeChain-powered gaming platform with provably fair games
          </p>
        </div>

        {/* Game icons */}
        <div className="flex items-center justify-center space-x-8 text-4xl">
          <span className="animate-bounce text-yellow-400">🎰</span>
          <span className="animate-bounce text-red-400" style={{ animationDelay: '0.1s' }}>🎯</span>
          <span className="animate-bounce text-blue-400" style={{ animationDelay: '0.2s' }}>🎲</span>
          <span className="animate-bounce text-green-400" style={{ animationDelay: '0.3s' }}>🃏</span>
        </div>

        {/* Login/Wallet Connection */}
        <div className="relative">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-6">Connect to Play</h2>
            <WalletConnection />
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
            <p className="text-gray-300 text-sm">Blockchain-secured gaming with transparent outcomes</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">Fast</h3>
            <p className="text-gray-300 text-sm">Lightning-fast transactions on VeChain network</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-2xl mb-3">🎮</div>
            <h3 className="text-lg font-semibold text-white mb-2">Fair</h3>
            <p className="text-gray-300 text-sm">Provably fair games with verifiable randomness</p>
          </div>
        </div>
      </div>
    </section>
  )
}