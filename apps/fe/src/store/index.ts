import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Ticket {
  id: string
  drawNumber: number
  numbers: number[]
  purchaseDate: Date
  status: 'pending' | 'won' | 'lost'
  prize?: number
}

interface UserStats {
  totalTickets: number
  totalWins: number
  totalWinnings: number
  winRate: number
}

interface AppState {
  tickets: Ticket[]
  userStats: UserStats | null
  currentDrawInfo: {
    drawNumber: number
    prizePool: number
    ticketsSold: number
    timeRemaining: number
  } | null
  
  setTickets: (tickets: Ticket[]) => void
  addTicket: (ticket: Ticket) => void
  setUserStats: (stats: UserStats) => void
  setCurrentDrawInfo: (info: AppState['currentDrawInfo']) => void
}

export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      tickets: [],
      userStats: null,
      currentDrawInfo: null,
      
      setTickets: (tickets) => set({ tickets }),
      addTicket: (ticket) => set((state) => ({ 
        tickets: [...state.tickets, ticket] 
      })),
      setUserStats: (stats) => set({ userStats: stats }),
      setCurrentDrawInfo: (info) => set({ currentDrawInfo: info }),
    }),
    {
      name: 'better-play-store',
    }
  )
)