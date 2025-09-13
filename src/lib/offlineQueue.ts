import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Bet } from '@/types/Bet'
import type { FirebaseBet } from '@/types/Firebase'

// Reuse same storage key as offline storage hook
const OFFLINE_STORAGE_KEY = 'betting-tracker-offline'

interface OfflineStorageShape {
  bets: Bet[]
  lastSync: string | null
  pendingChanges: {
    add: Bet[]
    update: Bet[]
    delete: string[]
  }
}

const getOfflineData = (): OfflineStorageShape => {
  try {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.warn('[offlineQueue] parse error', e)
  }
  return { bets: [], lastSync: null, pendingChanges: { add: [], update: [], delete: [] } }
}

const saveOfflineData = (data: OfflineStorageShape) => {
  try {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('[offlineQueue] kunde inte spara offline-data', e)
  }
}

const clearPendingChanges = () => {
  const data = getOfflineData()
  data.pendingChanges = { add: [], update: [], delete: [] }
  data.lastSync = new Date().toISOString()
  saveOfflineData(data)
}

const betToFirebaseBet = (bet: Bet): FirebaseBet => ({
  id: bet.id,
  userId: bet.userId,
  event: bet.event,
  market: '',
  stake: bet.stake,
  odds: bet.odds,
  bookmaker: '',
  result: bet.result,
  currency: 'SEK',
  createdAt: bet.createdAt,
  updatedAt: new Date().toISOString()
})

interface QueueConfig {
  userId: string
  setSyncing: (v: boolean) => void
  setError: (msg: string | null) => void
}

let attempt = 0
let timer: number | null = null
let flushing = false
let initialized = false
let currentConfig: QueueConfig | null = null
const BASE_DELAY = 1000
const MAX_DELAY = 30000

async function flushInternal() {
  if (!currentConfig) return
  const { userId, setSyncing, setError } = currentConfig
  if (!userId) return
  if (flushing) return

  const data = getOfflineData()
  const pending = data.pendingChanges
  const hasChanges = pending.add.length + pending.update.length + pending.delete.length > 0
  if (!hasChanges) {
    attempt = 0
    return
  }

  flushing = true
  setSyncing(true)
  setError(null)

  try {
    const betsRef = collection(db, 'bets')

    for (const bet of pending.add) {
      const fbBet = betToFirebaseBet(bet)
      const { id: _omit, ...payload } = { ...fbBet, userId, createdAt: new Date(bet.date || Date.now()), updatedAt: new Date() }
      await addDoc(betsRef, payload)
    }

    for (const bet of pending.update) {
      const betRef = doc(db, 'bets', bet.id)
      const fbBet = betToFirebaseBet(bet)
      const { id: _omit, ...payload } = { ...fbBet, updatedAt: new Date() }
      await updateDoc(betRef, payload)
    }

    for (const betId of pending.delete) {
      const betRef = doc(db, 'bets', betId)
      await deleteDoc(betRef)
    }

    clearPendingChanges()
    attempt = 0
  } catch (e) {
    console.warn('[offlineQueue] flush failed', e)
    attempt += 1
    const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1), MAX_DELAY)
    schedule(delay)
    setError('Kunde inte synkronisera – försöker igen...')
  } finally {
    flushing = false
    setSyncing(false)
  }
}

function schedule(delay = BASE_DELAY) {
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => flushInternal(), delay)
}

export function initOfflineQueue(config: QueueConfig) {
  currentConfig = config
  if (!initialized) {
    window.addEventListener('online', () => {
      attempt = 0
      schedule(200) // slight delay to allow network to stabilize
    })
    initialized = true
  }
  if (navigator.onLine) schedule(300)
  return {
    flushNow: () => flushInternal(),
    dispose: () => {
      if (timer) window.clearTimeout(timer)
      if (currentConfig === config) currentConfig = null
    }
  }
}
