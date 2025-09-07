import { createFileRoute } from '@tanstack/react-router'
import { WalletConnection } from '@/components/wallet/WalletConnection'
import { env } from '@/config/env'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex flex-col min-h-screen justify-center items-center w-full space-y-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800 text-balance">
          {env.VITE_APP_NAME}
        </h1>
        <p className="text-lg text-gray-600 max-w-md text-balance">
          VeChain-powered gaming platform for the future
        </p>
      </div>

      <WalletConnection />
    </div>
  )
}
