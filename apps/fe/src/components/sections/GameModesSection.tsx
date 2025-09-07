export function GameModesSection() {
  const gameReady = true // Only lottery is ready
  const gameComingSoon = false

  const gameCards = [
    {
      id: 'lottery',
      title: '🎰 Lottery',
      description: 'Win big with our blockchain lottery system',
      features: ['Multiple prize tiers', 'Transparent draws', 'Instant payouts'],
      status: 'available',
      comingSoon: false
    },
    {
      id: 'dice',
      title: '🎲 Dice Games',
      description: 'Classic dice rolling with crypto rewards',
      features: ['Provably fair', 'Multiple bet types', 'Live results'],
      status: 'coming-soon',
      comingSoon: true
    },
    {
      id: 'poker',
      title: '🃏 Poker',
      description: 'Texas Hold\'em and more poker variants',
      features: ['Multiplayer tables', 'Tournaments', 'Skill-based'],
      status: 'coming-soon',
      comingSoon: true
    }
  ]

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 py-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
            Game Modes
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose your favorite game mode and start winning on the VeChain blockchain
          </p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gameCards.map((game) => (
            <div
              key={game.id}
              className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl ${
                game.comingSoon ? 'opacity-75' : 'hover:border-blue-400/50'
              }`}
            >
              {/* Coming Soon Badge */}
              {game.comingSoon && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Coming Soon
                </div>
              )}

              {/* Game Icon & Title */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">{game.title.split(' ')[0]}</div>
                <h3 className="text-2xl font-bold text-white">{game.title.split(' ').slice(1).join(' ')}</h3>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-center mb-6 leading-relaxed">
                {game.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-8">
                {game.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <span className="text-green-400 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  game.comingSoon
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-lg active:scale-95'
                }`}
                disabled={game.comingSoon}
              >
                {game.comingSoon ? 'Coming Soon' : 'Play Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-blue-400/30">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Play?</h3>
            <p className="text-gray-300 mb-6">Connect your wallet and start your gaming journey on VeChain</p>
            <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}