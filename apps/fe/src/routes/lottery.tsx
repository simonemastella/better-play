import { createFileRoute } from "@tanstack/react-router";
import { useWallet, useWalletModal } from "@vechain/vechain-kit";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { FallingTickets } from "@/components/common/FallingTickets";
import { truncateAddress } from "@/utils/format";
import { useState } from "react";

export const Route = createFileRoute("/lottery")({
  component: LotteryPage,
});

function LotteryPage() {
  const wallet = useWallet();
  const { open: openWalletModal } = useWalletModal();
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedRound, setSelectedRound] = useState("latest");

  const handleWalletAction = () => {
    openWalletModal();
  };

  const handlePurchaseTicket = () => {
    if (!wallet.connection.isConnected) {
      handleWalletAction();
      return;
    }
    console.log("Purchasing lottery ticket...", { ticketCount });
  };

  const canPurchase = wallet.connection.isConnected;

  const lotteryRounds = {
    latest: {
      name: "Round #47 (Current)",
      winners: [
        { address: "0x742d35cc4cf21e7fc7d8c51b3b7b7a8a4f8e9b1c", amount: "1,247.8 B3TR", tickets: 5, time: "2 days ago" },
        { address: "0x892f45bc6de32f8c8d9e4b2a3c1f5e8d7a9b4e6f", amount: "892.5 B3TR", tickets: 3, time: "5 days ago" },
        { address: "0x543a78ef9ab45c2d1f8e9b6c4a7d3e2f1b9c8a5d", amount: "1,789.2 B3TR", tickets: 8, time: "1 week ago" },
      ]
    },
    "46": {
      name: "Round #46",
      winners: [
        { address: "0x123a78ef9ab45c2d1f8e9b6c4a7d3e2f1b9c8a5d", amount: "2,156.4 B3TR", tickets: 12, time: "2 weeks ago" },
        { address: "0x456d35cc4cf21e7fc7d8c51b3b7b7a8a4f8e9b1c", amount: "934.7 B3TR", tickets: 7, time: "2 weeks ago" },
        { address: "0x789f45bc6de32f8c8d9e4b2a3c1f5e8d7a9b4e6f", amount: "677.1 B3TR", tickets: 2, time: "2 weeks ago" },
      ]
    },
    "45": {
      name: "Round #45",
      winners: [
        { address: "0xabc378ef9ab45c2d1f8e9b6c4a7d3e2f1b9c8a5d", amount: "3,421.9 B3TR", tickets: 15, time: "3 weeks ago" },
        { address: "0xdef835cc4cf21e7fc7d8c51b3b7b7a8a4f8e9b1c", amount: "1,203.5 B3TR", tickets: 9, time: "3 weeks ago" },
        { address: "0x147f45bc6de32f8c8d9e4b2a3c1f5e8d7a9b4e6f", amount: "856.2 B3TR", tickets: 4, time: "3 weeks ago" },
      ]
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground showDice={false} />
      <FallingTickets />

      {/* Hero Section - Massive Jackpot */}
      <div className="relative z-10 pt-8 pb-16 px-8 bg-gradient-to-b from-yellow-900/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <button 
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-4xl font-black text-white">Lottery</h1>
            <button
              onClick={handleWalletAction}
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              {wallet.connection.isConnected
                ? `${truncateAddress(wallet.account?.address || "", 6, 4)}`
                : "Connect Wallet"}
            </button>
          </div>

          {/* Massive Jackpot Display */}
          <div className="text-center mb-12">
            <div className="text-yellow-200 text-xl mb-4">🏆 CURRENT JACKPOT</div>
            <div className="text-8xl md:text-9xl font-black bg-gradient-to-r from-yellow-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent mb-4 leading-none">
              2,547.8
            </div>
            <div className="text-3xl text-yellow-200 font-bold mb-6">B3TR</div>
            <div className="text-xl text-gray-300 mb-8">≈ $127.39 USD</div>
            
            {/* Previous Jackpot */}
            <div className="text-center mb-8">
              <div className="text-gray-400 text-sm mb-1">Previous Jackpot (Round #46)</div>
              <div className="text-lg font-bold text-gray-300">1,423.6 B3TR</div>
              <div className="text-green-400 text-xs">✓ Won by 0x742d...</div>
            </div>
            
            {/* Urgent Countdown */}
            <div className="inline-flex items-center gap-4 bg-red-900/40 backdrop-blur-sm px-8 py-4 rounded-2xl border border-red-500/40">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-200 font-bold text-xl">⏰ Draw in: 23h 45m</span>
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Purchase Section */}
      <div className="relative z-10 bg-black/40 backdrop-blur-sm border-t border-gray-600 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Get Your Tickets Now</h2>
            <p className="text-xl text-gray-300">10 B3TR per ticket • More tickets = Better odds</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Purchase Form */}
            <div className="bg-slate-900/80 backdrop-blur rounded-3xl p-8 border border-slate-700">
              
              {/* Ticket Amount */}
              <div className="mb-8">
                <label className="block text-white text-lg font-bold mb-4">Number of Tickets</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    className="w-14 h-14 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-slate-800 border-2 border-slate-600 focus:border-blue-500 text-white px-6 py-4 rounded-xl text-center text-3xl font-bold focus:outline-none"
                  />
                  <button
                    onClick={() => setTicketCount(ticketCount + 1)}
                    className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Purchase Summary */}
              <div className="bg-gradient-to-r from-slate-800 to-blue-900/30 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-1">Your Tickets</div>
                    <div className="text-3xl font-bold text-white">{ticketCount.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-1">Win Chance</div>
                    <div className="text-3xl font-bold text-green-400">
                      {((ticketCount / 10000) * 100).toFixed(3)}%
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">Total Cost</div>
                    <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {(10 * ticketCount).toLocaleString()} B3TR
                    </div>
                  </div>
                </div>
              </div>

              {/* HUGE Purchase Button */}
              <button
                onClick={handlePurchaseTicket}
                disabled={!canPurchase}
                className={`w-full py-6 px-8 rounded-2xl font-black text-2xl transition-all duration-300 ${
                  canPurchase
                    ? "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white shadow-2xl hover:shadow-green-500/40 transform hover:scale-105"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                {!wallet.connection.isConnected ? (
                  <div className="flex items-center justify-center gap-3">
                    <span>🔗</span>
                    <span>Connect Wallet to Play</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>🎫</span>
                    <span>BUY {ticketCount} TICKET{ticketCount > 1 ? "S" : ""} NOW</span>
                    <span>🚀</span>
                  </div>
                )}
              </button>
            </div>

            {/* My Tickets - All Rounds */}
            {wallet.connection.isConnected && (
              <div className="bg-purple-900/20 backdrop-blur rounded-3xl p-8 border border-purple-500/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-purple-200">
                    My Tickets - {selectedRound === "latest" ? "Round #47 (Current)" : `Round #${selectedRound}`}
                  </h3>
                  <select 
                    value={selectedRound}
                    onChange={(e) => setSelectedRound(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                  >
                    <option value="latest">Round #47 (Current)</option>
                    <option value="46">Round #46</option>
                    <option value="45">Round #45</option>
                  </select>
                </div>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-3 text-center border border-purple-500/30">
                    <div className="text-xl font-bold text-purple-300">
                      {selectedRound === "latest" ? "25" : selectedRound === "46" ? "18" : "22"}
                    </div>
                    <div className="text-purple-200 text-xs">
                      {selectedRound === "latest" ? "Active" : "Past"} Tickets
                    </div>
                  </div>
                  <div className="bg-green-900/40 backdrop-blur-sm rounded-xl p-3 text-center border border-green-500/30">
                    <div className="text-xl font-bold text-green-300">
                      {selectedRound === "latest" ? "250" : selectedRound === "46" ? "180" : "220"} B3TR
                    </div>
                    <div className="text-green-200 text-xs">Invested</div>
                  </div>
                </div>

                {/* Round Status */}
                {selectedRound !== "latest" && (
                  <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold">Round #{selectedRound} - Completed</div>
                        <div className="text-gray-400 text-sm">
                          {selectedRound === "46" ? "2 weeks ago" : "3 weeks ago"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 font-bold">No Wins</div>
                        <div className="text-gray-400 text-sm">Better luck next time!</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scrollable Ticket List */}
                <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
                  <div className="p-3 border-b border-purple-500/20">
                    <h4 className="text-sm font-bold text-purple-200">
                      My Tickets ({selectedRound === "latest" ? "25" : selectedRound === "46" ? "18" : "22"})
                    </h4>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    <div className="space-y-1 p-3">
                      {(() => {
                        const getTicketsForRound = () => {
                          if (selectedRound === "latest") {
                            return Array.from({ length: 25 }, (_, i) => ({
                              id: 1000 + i + 1,
                              time: "2h ago",
                              status: "Active",
                              statusColor: "text-green-400"
                            }));
                          } else if (selectedRound === "46") {
                            return Array.from({ length: 18 }, (_, i) => ({
                              id: 4600 + i + 1,
                              time: "2 weeks ago",
                              status: "No Win",
                              statusColor: "text-red-400"
                            }));
                          } else {
                            return Array.from({ length: 22 }, (_, i) => ({
                              id: 4500 + i + 1,
                              time: "3 weeks ago",
                              status: "No Win",
                              statusColor: "text-red-400"
                            }));
                          }
                        };
                        
                        return getTicketsForRound().map((ticket) => (
                          <div key={ticket.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs">
                                🎫
                              </div>
                              <div>
                                <div className="text-white font-medium text-xs">#{ticket.id}</div>
                                <div className="text-gray-400 text-xs">{ticket.time}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-purple-300 font-bold text-xs">10 B3TR</div>
                              <div className={`text-xs ${ticket.statusColor}`}>{ticket.status}</div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                    
                    {/* Load More Indicator - Only for current round */}
                    {selectedRound === "latest" && (
                      <div className="p-3 text-center border-t border-purple-500/20">
                        <button className="text-purple-400 hover:text-purple-300 text-xs font-medium">
                          Load More...
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How It Works - Expanded */}
      <div className="relative z-10 bg-blue-900/20 backdrop-blur-sm border-t border-blue-500/30 py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              How Our Lottery Works
            </h2>
            <p className="text-blue-200 text-lg">Fully transparent, provably fair, blockchain-based lottery</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-900/30 border border-blue-500/30 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold text-white mb-3">Purchase Tickets</h3>
              <p className="text-blue-200">
                Buy lottery tickets for 10 B3TR each. Each ticket gives you a chance to win the entire jackpot. 
                More tickets = higher probability of winning.
              </p>
            </div>
            <div className="text-center p-6 bg-purple-900/30 border border-purple-500/30 rounded-2xl">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold text-white mb-3">Automated Draw</h3>
              <p className="text-purple-200">
                Winners are selected using cryptographically secure blockchain randomness. 
                The draw happens automatically at the scheduled time - no human intervention.
              </p>
            </div>
            <div className="text-center p-6 bg-green-900/30 border border-green-500/30 rounded-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Payouts</h3>
              <p className="text-green-200">
                If you win, the prize is automatically transferred to your wallet immediately after the draw. 
                No waiting, no manual claims required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Winners - Compact */}
      <div className="relative z-10 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm border-t border-emerald-500/30 py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-emerald-200">Recent Winners</h3>
            <select 
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="latest">{lotteryRounds.latest.name}</option>
              <option value="46">{lotteryRounds["46"].name}</option>
              <option value="45">{lotteryRounds["45"].name}</option>
            </select>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {(lotteryRounds as any)[selectedRound].winners.map((winner: any, index: number) => (
              <div key={index} className="bg-emerald-900/30 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xl">🏆</div>
                  <div className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full">{winner.time}</div>
                </div>
                <div className="text-lg font-bold text-emerald-300 mb-1">{winner.amount}</div>
                <div className="text-xs text-gray-400 font-mono mb-1">
                  {truncateAddress(winner.address, 6, 4)}
                </div>
                <div className="text-xs text-emerald-400">
                  {winner.tickets} ticket{winner.tickets > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
