import { AnimatedBackground } from '@/components/common/AnimatedBackground'

export function DiceShowcaseSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated Background with Dice */}
      <AnimatedBackground />
      
      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Title */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Interactive Dice
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Experience our beautiful 3D dice animation. Click and drag them around!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl mb-3">🎲</div>
              <h3 className="text-lg font-semibold text-white mb-2">3D Animation</h3>
              <p className="text-gray-300 text-sm">Smooth rotating dice with realistic physics</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl mb-3">🖱️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Interactive</h3>
              <p className="text-gray-300 text-sm">Click to squeeze, drag to move around the screen</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibent text-white mb-2">Responsive</h3>
              <p className="text-gray-300 text-sm">Adapts to screen size with dynamic dice count</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Performant</h3>
              <p className="text-gray-300 text-sm">GPU-accelerated with smooth 60fps animation</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 mt-12">
            <h3 className="text-2xl font-bold text-white mb-6">How to Interact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-4">
                <span className="text-2xl">👆</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Click</h4>
                  <p className="text-gray-300 text-sm">Click any dice to see it squeeze and bounce</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-2xl">🖱️</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Drag</h4>
                  <p className="text-gray-300 text-sm">Drag dice around but they avoid the UI areas</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-2xl">🔄</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Auto-Rotate</h4>
                  <p className="text-gray-300 text-sm">Watch them continuously spin with smooth animation</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-2xl">📐</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Resize</h4>
                  <p className="text-gray-300 text-sm">Resize window to see dice count adapt dynamically</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fun Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">6</div>
              <div className="text-gray-300 text-sm">Faces per dice</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">3D</div>
              <div className="text-gray-300 text-sm">Real depth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">60</div>
              <div className="text-gray-300 text-sm">FPS smooth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">∞</div>
              <div className="text-gray-300 text-sm">Fun factor</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}