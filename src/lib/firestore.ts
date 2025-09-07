import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { FirebaseBet, Transaction } from '@/types/Firebase'

export const addBet = async (betData: Omit<FirebaseBet, 'id'> | Omit<FirebaseBet, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString()
  
  const bet: Omit<FirebaseBet, 'id'> = {
    ...betData,
    createdAt: 'createdAt' in betData ? betData.createdAt : now,
    updatedAt: 'updatedAt' in betData ? betData.updatedAt : now
  }

  // Auto-calculate payout if not provided
  if (!bet.payout && bet.result === 'won') {
    bet.payout = bet.stake * bet.odds
  } else if (!bet.payout && bet.result === 'lost') {
    bet.payout = 0
  } else if (!bet.payout && bet.result === 'void') {
    bet.payout = bet.stake // Return stake for void bets
  }

  const docRef = await addDoc(collection(db, 'bets'), bet)
  return docRef.id
}

export const updateBet = async (betId: string, updates: Partial<Omit<FirebaseBet, 'id' | 'createdAt'>>) => {
  const betRef = doc(db, 'bets', betId)
  
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  // Recalculate payout if result or stake/odds changed
  if (updates.result || updates.stake || updates.odds) {
    if (updates.result === 'won') {
      updateData.payout = (updates.stake || 0) * (updates.odds || 0)
    } else {
      updateData.payout = 0
    }
  }

  await updateDoc(betRef, updateData)
}

export const deleteBet = async (betId: string) => {
  const betRef = doc(db, 'bets', betId)
  await deleteDoc(betRef)
}

export const subscribeToBets = (
  userId: string,
  callback: (bets: FirebaseBet[]) => void
) => {
  const q = query(
    collection(db, 'bets'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (querySnapshot) => {
    const bets: FirebaseBet[] = []
    querySnapshot.forEach((doc) => {
      bets.push({ id: doc.id, ...doc.data() } as FirebaseBet)
    })
    callback(bets)
  })
}

export const calculateBetStats = (bets: FirebaseBet[]) => {
  const settledBets = bets.filter(bet => bet.result !== 'pending')
  const wonBets = settledBets.filter(bet => bet.result === 'won')
  const lostBets = settledBets.filter(bet => bet.result === 'lost')
  const voidBets = bets.filter(bet => bet.result === 'void')
  
  const totalStaked = settledBets.reduce((sum, bet) => sum + bet.stake, 0)
  const totalPayout = wonBets.reduce((sum, bet) => sum + (bet.payout || 0), 0)
  const profit = totalPayout - totalStaked
  const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0
  const winRate = settledBets.length > 0 ? (wonBets.length / settledBets.length) * 100 : 0
  
  const pendingBets = bets.filter(bet => bet.result === 'pending')
  const pendingStake = pendingBets.reduce((sum, bet) => sum + bet.stake, 0)
  const pendingPotential = pendingBets.reduce((sum, bet) => sum + (bet.stake * bet.odds), 0)
  
  return {
    totalBets: bets.length,
    settledBets: settledBets.length,
    wonBets: wonBets.length,
    lostBets: lostBets.length,
    voidBets: voidBets.length,
    pendingBets: pendingBets.length,
    totalStaked,
    totalPayout,
    profit,
    roi,
    winRate,
    pendingStake,
    pendingPotential,
    avgStake: settledBets.length > 0 ? totalStaked / settledBets.length : 0,
    avgOdds: settledBets.length > 0 ? settledBets.reduce((sum, bet) => sum + bet.odds, 0) / settledBets.length : 0
  }
}

// Transaction Management Functions
export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const docRef = await addDoc(collection(db, 'transactions'), transaction)
  return docRef.id
}

export const updateTransaction = async (transactionId: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
  const transactionRef = doc(db, 'transactions', transactionId)
  
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString()
  }

  await updateDoc(transactionRef, updateData)
}

export const deleteTransaction = async (transactionId: string) => {
  const transactionRef = doc(db, 'transactions', transactionId)
  await deleteDoc(transactionRef)
}

export const subscribeToTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void
) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  )

  return onSnapshot(q, (querySnapshot) => {
    const transactions: Transaction[] = []
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction)
    })
    callback(transactions)
  })
}
