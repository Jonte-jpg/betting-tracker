export type BetResult = 'pending' | 'won' | 'lost' | 'void'

export interface Bet {
  id: string
  userId: string
  date: string // ISO string
  event: string
  stake: number
  odds: number
  result: BetResult
  createdAt: string // ISO string
}