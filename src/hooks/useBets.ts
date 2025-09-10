import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { FirebaseBet } from '@/types/Firebase'
import type { Bet } from '@/types/Bet'
import { useOfflineStorage } from './useOfflineStorage'

// Konverteringsfunktioner mellan Bet och FirebaseBet
const betToFirebaseBet = (bet: Bet): FirebaseBet => ({
  id: bet.id,
  userId: bet.userId,
  event: bet.event,
  market: '', // Default värde
  stake: bet.stake,
  odds: bet.odds,
  bookmaker: '', // Default värde
  result: bet.result,
  currency: 'SEK', // Default värde
  createdAt: bet.createdAt,
  updatedAt: new Date().toISOString()
})

const firebaseBetToBet = (firebaseBet: FirebaseBet): Bet => ({
  id: firebaseBet.id || '',
  userId: firebaseBet.userId,
  date: firebaseBet.createdAt.split('T')[0], // Konvertera till date string
  event: firebaseBet.event,
  stake: firebaseBet.stake,
  odds: firebaseBet.odds,
  result: firebaseBet.result,
  createdAt: firebaseBet.createdAt
})

export function useBets(userId: string | null) {
  const [bets, setBets] = useState<FirebaseBet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  
  const {
    isOnline,
    saveBetsOffline,
    addBetOffline,
    updateBetOffline,
    deleteBetOffline,
    getOfflineBets,
    getPendingChanges,
    clearPendingChanges
  } = useOfflineStorage()

  // Synkronisera pending changes när vi kommer online
  const syncPendingChanges = useCallback(async () => {
    const pendingChanges = getPendingChanges()
    const hasChanges = 
      pendingChanges.add.length > 0 || 
      pendingChanges.update.length > 0 || 
      pendingChanges.delete.length > 0

    if (!hasChanges) return

    setSyncing(true)
    
    try {
      const betsRef = collection(db, 'bets')

      // Lägg till nya bets
      for (const bet of pendingChanges.add) {
        const firebaseBet = betToFirebaseBet(bet)
        const { id: _omitId, ...betData } = {
          ...firebaseBet,
          userId,
          createdAt: new Date(bet.date || Date.now()),
          updatedAt: new Date(),
        }
        await addDoc(betsRef, betData)
      }

      // Uppdatera befintliga bets
      for (const bet of pendingChanges.update) {
        const betRef = doc(db, 'bets', bet.id)
        const firebaseBet = betToFirebaseBet(bet)
        const { id: _omitId, ...betData } = {
          ...firebaseBet,
          updatedAt: new Date(),
        }
        await updateDoc(betRef, betData)
      }

      // Ta bort bets
      for (const betId of pendingChanges.delete) {
        const betRef = doc(db, 'bets', betId)
        await deleteDoc(betRef)
      }

      clearPendingChanges()
    } catch (error) {
      console.error('Error syncing changes:', error)
      setError('Kunde inte synkronisera ändringar')
    } finally {
      setSyncing(false)
    }
  }, [getPendingChanges, clearPendingChanges, userId])

  useEffect(() => {
    if (isOnline && userId) {
      syncPendingChanges()
    }
  }, [isOnline, userId, syncPendingChanges])

  useEffect(() => {
    if (!userId) {
      setBets([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    if (!isOnline) {
      // Använd offline data
      const offlineBets = getOfflineBets()
      const firebaseBets = offlineBets.map(betToFirebaseBet)
      setBets(firebaseBets)
      setLoading(false)
      return
    }

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
        
        // Spara offline för framtida användning
        const offlineBets = betsData.map(firebaseBetToBet)
        saveBetsOffline(offlineBets)
        
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching bets:', error)
        setError('Kunde inte hämta bets')
        
        // Fallback till offline data
        const offlineBets = getOfflineBets()
        const firebaseBets = offlineBets.map(betToFirebaseBet)
        setBets(firebaseBets)
        
        setLoading(false)
      }
    )

    return unsubscribe
  }, [userId, isOnline, getOfflineBets, saveBetsOffline])

  // Offline-aware CRUD operations
  const addBet = async (betData: Partial<Bet>) => {
    const newBet: Bet = {
      id: crypto.randomUUID(),
      userId: userId || '',
      date: betData.date || new Date().toISOString().split('T')[0],
      event: betData.event || '',
      stake: betData.stake || 0,
      odds: betData.odds || 1,
      result: betData.result || 'pending',
      createdAt: new Date().toISOString()
    }

    if (isOnline && userId) {
      try {
        const betsRef = collection(db, 'bets')
        const firebaseBet = betToFirebaseBet(newBet)
        const { id: _omitId, ...firebaseBetData } = {
          ...firebaseBet,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await addDoc(betsRef, firebaseBetData)
      } catch (error) {
        console.error('Error adding bet online:', error)
        // Fallback till offline
        addBetOffline(newBet)
        const firebaseBet = betToFirebaseBet(newBet)
        setBets(prev => [firebaseBet, ...prev])
      }
    } else {
      // Offline mode
      addBetOffline(newBet)
      const firebaseBet = betToFirebaseBet(newBet)
      setBets(prev => [firebaseBet, ...prev])
    }
  }

  const updateBet = async (betId: string, betData: Partial<Bet>) => {
    const existingBet = bets.find(bet => bet.id === betId)
    if (!existingBet) return

    const existingOfflineBet = firebaseBetToBet(existingBet)
    const updatedBet = { ...existingOfflineBet, ...betData }

    if (isOnline && userId) {
      try {
        const betRef = doc(db, 'bets', betId)
        const firebaseBet = betToFirebaseBet(updatedBet)
        const { id: _omitId, ...updateData } = {
          ...firebaseBet,
          updatedAt: new Date(),
        }
        await updateDoc(betRef, updateData)
      } catch (error) {
        console.error('Error updating bet online:', error)
        // Fallback till offline
        updateBetOffline(updatedBet)
        const firebaseBet = betToFirebaseBet(updatedBet)
        setBets(prev => prev.map(bet => bet.id === betId ? firebaseBet : bet))
      }
    } else {
      // Offline mode
      updateBetOffline(updatedBet)
      const firebaseBet = betToFirebaseBet(updatedBet)
      setBets(prev => prev.map(bet => bet.id === betId ? firebaseBet : bet))
    }
  }

  const deleteBet = async (betId: string) => {
    if (isOnline && userId) {
      try {
        const betRef = doc(db, 'bets', betId)
        await deleteDoc(betRef)
      } catch (error) {
        console.error('Error deleting bet online:', error)
        // Fallback till offline
        deleteBetOffline(betId)
        setBets(prev => prev.filter(bet => bet.id !== betId))
      }
    } else {
      // Offline mode
      deleteBetOffline(betId)
      setBets(prev => prev.filter(bet => bet.id !== betId))
    }
  }

  return { 
    bets, 
    loading, 
    error, 
    syncing,
    addBet,
    updateBet,
    deleteBet,
    syncPendingChanges
  }
}
