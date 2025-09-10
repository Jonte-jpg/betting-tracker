import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { FirebaseBet } from '@/types/Firebase'

interface LeaderboardEntry {
  userId: string
  displayName: string
  photoURL?: string
  totalStake: number
  totalPayout: number
  netProfit: number
  roi: number
  winRate: number
  totalBets: number
  provisionalStatus: boolean
}

function calculateUserStats(bets: FirebaseBet[]) {
  const settledBets = bets.filter(bet => bet.result === 'won' || bet.result === 'lost')
  
  const totalStake = settledBets.reduce((sum, bet) => sum + bet.stake, 0)
  const totalPayout = settledBets.reduce((sum, bet) => sum + (bet.payout || 0), 0)
  const netProfit = totalPayout - totalStake
  const roi = totalStake > 0 ? (netProfit / totalStake) * 100 : 0
  const winRate = settledBets.length > 0 
    ? (settledBets.filter(bet => bet.result === 'won').length / settledBets.length) * 100 
    : 0

  return {
    totalStake,
    totalPayout,
    netProfit,
    roi,
    winRate,
    totalBets: bets.length,
    provisionalStatus: settledBets.length < 5
  }
}

function createLeaderboardEntry(userId: string, userData: { displayName: string; photoURL?: string; bets: FirebaseBet[] }): LeaderboardEntry {
  const stats = calculateUserStats(userData.bets)
  
  return {
    userId,
    displayName: userData.displayName,
    photoURL: userData.photoURL,
    ...stats
  }
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const betsRef = collection(db, 'bets')
    
    const unsubscribe = onSnapshot(
      betsRef,
      (querySnapshot) => {
        const allBets: FirebaseBet[] = []
        querySnapshot.forEach((doc) => {
          allBets.push({ id: doc.id, ...doc.data() } as FirebaseBet)
        })

        // Calculate leaderboard statistics
        const userStats = new Map<string, {
          displayName: string
          photoURL?: string
          bets: FirebaseBet[]
        }>()

        allBets.forEach(bet => {
          if (!userStats.has(bet.userId)) {
            userStats.set(bet.userId, {
              displayName: 'Unknown User', // We'll need to get this from users collection
              photoURL: undefined,
              bets: []
            })
          }
          userStats.get(bet.userId)!.bets.push(bet)
        })

        const entries: LeaderboardEntry[] = Array.from(userStats.entries()).map(([userId, userData]) => 
          createLeaderboardEntry(userId, userData)
        )

        // Sort by ROI (descending), then by net profit, then by total bets
        entries.sort((a, b) => {
          if (b.roi !== a.roi) return b.roi - a.roi
          if (b.netProfit !== a.netProfit) return b.netProfit - a.netProfit
          return b.totalBets - a.totalBets
        })

        setLeaderboard(entries)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching leaderboard:', error)
        setError('Kunde inte hämta leaderboard')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  return { leaderboard, loading, error }
}
