import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { FirebaseBet } from '@/types/Firebase'

export function useBets(userId: string | null) {
  const [bets, setBets] = useState<FirebaseBet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setBets([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const betsRef = collection(db, 'bets')
    const q = query(
      betsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const betsData: FirebaseBet[] = []
        querySnapshot.forEach((doc) => {
          betsData.push({ id: doc.id, ...doc.data() } as FirebaseBet)
        })
        setBets(betsData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching bets:', error)
        setError('Kunde inte hämta bets')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [userId])

  return { bets, loading, error }
}
