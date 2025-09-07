import { cn } from '@/utils/cn'
import { useRef, useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Draggable from 'react-draggable'

interface AnimatedBackgroundProps {
  className?: string
  showDice?: boolean
}

interface DraggableDiceProps {
  id: number
  initialX: number
  initialY: number
  isVisible: boolean
}

function DraggableDice({ id, initialX, initialY, isVisible }: DraggableDiceProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isClicked, setIsClicked] = useState(false)

  // Different dot patterns for each dice face (1-6)
  const diceFaces = [
    [4], // 1 dot - center
    [0, 8], // 2 dots - diagonal
    [0, 4, 8], // 3 dots - diagonal
    [0, 2, 6, 8], // 4 dots - corners
    [0, 2, 4, 6, 8], // 5 dots - corners + center
    [0, 1, 2, 6, 7, 8], // 6 dots - two columns
  ]

  // Continuous rotation animation
  const animationDuration = useMemo(() => 6 + Math.random() * 8, [id])
  const rotationOffset = useMemo(() => Math.random() * 360, [id])
  

  // Handle dice click animation
  const handleDiceClick = () => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 300) // Reset after animation
  }

  // Handle drag start to trigger squeeze effect
  const handleDragStart = () => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 200)
  }

  // Allow all drags within screen bounds - no restricted areas
  const handleDrag = (e: any, data: any) => {
    // Allow all drag movements
    return true
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 0.9 : 0, 
        scale: isVisible ? 1 : 0.8 
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <Draggable
        nodeRef={nodeRef}
        defaultPosition={{ x: initialX, y: initialY }}
        onStart={handleDragStart}
        onDrag={handleDrag}
        enableUserSelectHack={false}
        disabled={!isVisible}
      >
        <div
          ref={nodeRef}
          className="absolute cursor-grab select-none pointer-events-auto touch-none"
          style={{
            perspective: 400,
            transformStyle: 'preserve-3d',
          }}
          onClick={handleDiceClick}
        >
        {/* 3D Cube Container with Framer Motion */}
        <motion.div 
          className="relative"
          style={{
            width: 48,
            height: 48,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
          animate={{
            rotateX: [rotationOffset, rotationOffset + 360],
            rotateY: [rotationOffset * 0.8, rotationOffset * 0.8 + 360],
            scaleX: isClicked ? [1, 0.7, 1] : 1,
            scaleY: isClicked ? [1, 1.3, 1] : 1,
            scaleZ: isClicked ? [1, 0.7, 1] : 1,
          }}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1],
            scaleX: isClicked ? { duration: 0.2, ease: "easeInOut" } : {},
            scaleY: isClicked ? { duration: 0.2, ease: "easeInOut" } : {},
            scaleZ: isClicked ? { duration: 0.2, ease: "easeInOut" } : {},
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Front Face */}
          <div 
            className="absolute w-12 h-12 bg-white border-2 border-gray-400 rounded-md shadow-xl flex items-center justify-center" 
            style={{ 
              transform: 'translateZ(24px)',
              backfaceVisibility: 'hidden',
              willChange: 'transform'
            }}
          >
            <div className="grid grid-cols-3 gap-1 w-10 h-10 place-items-center">
              {Array.from({ length: 9 }).map((_, dotIndex) => (
                <div
                  key={dotIndex}
                  className={`w-1.5 h-1.5 rounded-full ${
                    diceFaces[0].includes(dotIndex) ? 'bg-gray-900' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Back Face */}
          <div 
            className="absolute w-12 h-12 bg-white/95 border-2 border-gray-500 rounded-md shadow-xl flex items-center justify-center" 
            style={{ 
              transform: 'rotateY(180deg) translateZ(24px)',
              backfaceVisibility: 'hidden',
              willChange: 'transform'
            }}
          >
            <div className="grid grid-cols-3 gap-1 w-10 h-10 place-items-center">
              {Array.from({ length: 9 }).map((_, dotIndex) => (
                <div
                  key={dotIndex}
                  className={`w-1.5 h-1.5 rounded-full ${
                    diceFaces[1].includes(dotIndex) ? 'bg-gray-900' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Right Face */}
          <div 
            className="absolute w-12 h-12 bg-white/90 border-2 border-gray-500 rounded-md shadow-xl flex items-center justify-center" 
            style={{ 
              transform: 'rotateY(90deg) translateZ(24px)',
              backfaceVisibility: 'hidden',
              willChange: 'transform'
            }}
          >
            <div className="grid grid-cols-3 gap-1 w-10 h-10 place-items-center">
              {Array.from({ length: 9 }).map((_, dotIndex) => (
                <div
                  key={dotIndex}
                  className={`w-1.5 h-1.5 rounded-full ${
                    diceFaces[2].includes(dotIndex) ? 'bg-gray-900' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Left Face */}
          <div 
            className="absolute w-12 h-12 bg-white/90 border-2 border-gray-500 rounded-md shadow-xl flex items-center justify-center" 
            style={{ 
              transform: 'rotateY(-90deg) translateZ(24px)',
              backfaceVisibility: 'hidden',
              willChange: 'transform'
            }}
          >
            <div className="grid grid-cols-3 gap-1 w-10 h-10 place-items-center">
              {Array.from({ length: 9 }).map((_, dotIndex) => (
                <div
                  key={dotIndex}
                  className={`w-1.5 h-1.5 rounded-full ${
                    diceFaces[3].includes(dotIndex) ? 'bg-gray-900' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Top Face */}
          <div 
            className="absolute w-12 h-12 bg-white/95 border-2 border-gray-400 rounded-md shadow-xl flex items-center justify-center" 
            style={{ 
              transform: 'rotateX(90deg) translateZ(24px)',
              backfaceVisibility: 'hidden',
              willChange: 'transform'
            }}
          >
            <div className="grid grid-cols-3 gap-1 w-10 h-10 place-items-center">
              {Array.from({ length: 9 }).map((_, dotIndex) => (
                <div
                  key={dotIndex}
                  className={`w-1.5 h-1.5 rounded-full ${
                    diceFaces[4].includes(dotIndex) ? 'bg-gray-900' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Bottom Face */}
          <div 
            className="absolute w-12 h-12 bg-white/85 border-2 border-gray-600 rounded-md shadow-xl flex items-center justify-center" 
            style={{ 
              transform: 'rotateX(-90deg) translateZ(24px)',
              backfaceVisibility: 'hidden',
              willChange: 'transform'
            }}
          >
            <div className="grid grid-cols-3 gap-1 w-10 h-10 place-items-center">
              {Array.from({ length: 9 }).map((_, dotIndex) => (
                <div
                  key={dotIndex}
                  className={`w-1.5 h-1.5 rounded-full ${
                    diceFaces[5].includes(dotIndex) ? 'bg-gray-900' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
        </div>
      </Draggable>
    </motion.div>
  )
}

// Calculate optimal dice count based on viewport size
function calculateDiceCount(): number {
  const isMobile = window.innerWidth < 768 // md breakpoint
  return isMobile ? 1 : 2 // 1 dice on mobile, 2 on desktop
}


// Generate positions for dice around title
function generateNonOverlappingPositions(count: number): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = []
  const diceSize = 48
  const centerX = window.innerWidth / 2
  const isMobile = window.innerWidth < 768
  
  // Position dice at bottom of hero section
  const heroBottomY = isMobile ? 220 : 180 // Lower on mobile, standard on desktop
  const titleSideOffset = isMobile ? 150 : 300 // Smaller offset on mobile
  
  if (count >= 1) {
    if (isMobile) {
      // Single dice centered horizontally at bottom of hero section
      positions.push({
        x: Math.max(20, centerX - diceSize / 2),
        y: heroBottomY
      })
    } else {
      // Left dice on desktop at bottom of hero
      positions.push({
        x: Math.max(20, centerX - titleSideOffset - diceSize),
        y: heroBottomY
      })
    }
  }
  
  if (count >= 2 && !isMobile) {
    // Right dice - only on desktop at bottom of hero
    positions.push({
      x: Math.min(window.innerWidth - diceSize - 20, centerX + titleSideOffset),
      y: heroBottomY
    })
  }
  
  return positions
}

export function AnimatedBackground({ className, showDice = false }: AnimatedBackgroundProps) {
  const [diceCount, setDiceCount] = useState(() => showDice ? calculateDiceCount() : 0)
  const [resizeKey, setResizeKey] = useState(0) // Force re-render of Draggable components
  const [diceData, setDiceData] = useState(() => {
    if (!showDice) return []
    const count = calculateDiceCount()
    const positions = generateNonOverlappingPositions(count)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      ...positions[i] || { x: 100, y: 100 },
      isVisible: true
    }))
  })

  useEffect(() => {
    if (!showDice) return

    let resizeTimeout: NodeJS.Timeout

    const handleResize = () => {
      // Clear existing timeout to debounce resize events
      if (resizeTimeout) clearTimeout(resizeTimeout)
      
      // Add delay before respawning dice
      resizeTimeout = setTimeout(() => {
        const newCount = calculateDiceCount()
        const newPositions = generateNonOverlappingPositions(newCount)
        setDiceCount(newCount)
        setDiceData(Array.from({ length: newCount }, (_, i) => ({
          id: i,
          ...newPositions[i] || { x: 100, y: 100 },
          isVisible: true
        })))
        setResizeKey(prev => prev + 1) // Force Draggable components to re-render with new positions
      }, 150) // 150ms delay to prevent lag
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) clearTimeout(resizeTimeout)
    }
  }, [showDice])

  return (
    <>
      {/* Background layers - behind everything */}
      <div className={cn("fixed inset-0 -z-10 overflow-hidden pointer-events-none", className)}>
        {/* Base background with rich gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" />
        
        {/* Secondary gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-800/20 to-emerald-800/30" />
        
        {/* Radial gradient overlay for lighting effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
        
        {/* Geometric pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(30deg, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(150deg, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px, 60px 60px, 20px 20px, 20px 20px'
          }}
        />

        {/* Subtle noise overlay for texture */}
        <div 
          className="absolute inset-0 opacity-[0.015] mix-blend-soft-light"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")'
          }}
        />
      </div>

      {/* Draggable 3D dice - positioned relative to content */}
      {showDice && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
          <AnimatePresence>
            {diceData.map((dice) => (
              <DraggableDice
                key={`dice-${dice.id}-${resizeKey}`}
                id={dice.id}
                initialX={dice.x}
                initialY={dice.y}
                isVisible={dice.isVisible}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}