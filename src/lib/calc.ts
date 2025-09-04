import type { Bet } from '../types/Bet'
import type { User } from '../types/User'

export function profitForBet(bet: Bet): number {
  switch (bet.result) {
    case 'won':
      return bet.stake * (bet.odds - 1)
    case 'lost':
      return -bet.stake
    case 'void':
    case 'pending':
    default:
      return 0
  }
}

export function returnForBet(bet: Bet): number {
  // Return definieras som utbetalning (stake*odds) vid vinst, annars 0
  return bet.result === 'won' ? bet.stake * bet.odds : 0
}

export function summaryForBets(bets: Bet[]) {
  const count = bets.length
  const totalStake = bets.reduce((a, b) => a + b.stake, 0)
  const totalReturn = bets.reduce((a, b) => a + returnForBet(b), 0)
  const net = bets.reduce((a, b) => a + profitForBet(b), 0)
  const roi = totalStake > 0 ? (net / totalStake) * 100 : 0
  const wins = bets.filter((b) => b.result === 'won').length
  const hitRate = count > 0 ? (wins / count) * 100 : 0
  const avgOdds = count > 0 ? bets.reduce((a, b) => a + b.odds, 0) / count : 0
  return { totalStake, totalReturn, net, roi, count, winRate: hitRate, avgOdds }
}

export interface LeaderboardEntry {
  user: User
  rank: number
  count: number
  totalStake: number
  net: number
  roi: number
  winRate: number
  isProvisional: boolean
}

export function leaderboard(users: User[], bets: Bet[]): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = []
  
  for (const user of users) {
    const userBets = bets.filter(b => b.userId === user.id)
    const summary = summaryForBets(userBets)
    const isProvisional = summary.count < 5
    
    entries.push({
      user,
      rank: 0, // Will be set later
      count: summary.count,
      totalStake: summary.totalStake,
      net: summary.net,
      roi: summary.roi,
      winRate: summary.winRate,
      isProvisional,
    })
  }
  
  // Sort by ROI (desc), then net (desc), then count (desc)
  entries.sort((a, b) => {
    if (b.roi !== a.roi) return b.roi - a.roi
    if (b.net !== a.net) return b.net - a.net
    if (b.count !== a.count) return b.count - a.count
    return a.user.name.localeCompare(b.user.name, 'sv')
  })
  
  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1
  })
  
  return entries
}