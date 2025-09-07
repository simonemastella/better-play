import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'

interface FallingTicket {
  id: number
  x: number
  rotation: number
  scale: number
  delay: number
}

interface FallingTicketsProps {
  className?: string
}

export function FallingTickets({ className }: FallingTicketsProps) {
  const [tickets, setTickets] = useState<FallingTicket[]>([])

  const spawnTicket = useCallback(() => {
    const currentId = Date.now() + Math.random() // Ensure unique ID
    const newTicket: FallingTicket = {
      id: currentId,
      x: Math.random() * (window.innerWidth - 60),
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4,
      delay: 0
    }

    setTickets(prev => [...prev, newTicket])

    // Remove ticket after animation completes (shorter cleanup time)
    setTimeout(() => {
      setTickets(prev => prev.filter(ticket => ticket.id !== currentId))
    }, 12000)
  }, [])

  useEffect(() => {
    // Continuous spawning - one ticket every 1.2 seconds (5x more frequent)
    const interval = setInterval(() => {
      spawnTicket()
    }, 1200)

    // Initial ticket after 0.4 seconds
    setTimeout(() => spawnTicket(), 400)

    return () => clearInterval(interval)
  }, [spawnTicket])

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      <AnimatePresence>
        {tickets.map((ticket) => (
          <motion.div
            key={ticket.id}
            initial={{
              x: ticket.x,
              y: -60,
              rotate: ticket.rotation,
              scale: ticket.scale,
              opacity: 0
            }}
            animate={{
              x: ticket.x, // No horizontal drift - simpler animation
              y: window.innerHeight + 60,
              rotate: ticket.rotation + 45, // Simple fixed rotation
              opacity: [0, 0.3, 0.3, 0] // Simplified opacity
            }}
            exit={{
              opacity: 0,
              scale: 0
            }}
            transition={{
              duration: 10, // Fixed 10 seconds - no random for better performance
              delay: ticket.delay,
              ease: "linear",
              opacity: {
                times: [0, 0.3, 0.7, 1],
                duration: 10
              }
            }}
            className="absolute text-2xl select-none"
            style={{
              opacity: 0.3,
              willChange: 'transform'
            }}
          >
            🎫
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}