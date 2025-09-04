// src/store/useAppStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Bet, BetResult } from '../types/Bet'
import type { User } from '../types/User'
import { leaderboard as buildLeaderboard } from '../lib/calc'

export type Currency = 'SEK' | 'USD' | 'EUR' | 'NOK' | 'DKK' | 'GBP'

interface Filters {
  userId?: string | undefined
  result?: BetResult | undefined
  from?: string | undefined
  to?: string | undefined
  search?: string | undefined
}

interface Settings {
  currency: Currency
  minRankBets: number
}

interface StoreState {
  version: number
  users: User[]
  bets: Bet[]
  filters: Filters
  settings: Settings
  // Bets
  addBet: (data: Omit<Bet, 'id' | 'createdAt'>) => void
  updateBet: (id: string, patch: Partial<Omit<Bet, 'id'>>) => void
  deleteBet: (id: string) => void
  // Users
  addUser: (userData: Omit<User, 'id'>) => string
  renameUser: (id: string, name: string) => void
  deleteUser: (id: string) => void
  // Filters & settings
  setFilters: (f: Partial<Filters>) => void
  clearFilters: () => void
  setCurrency: (currency: Currency) => void
  setMinRankBets: (min: number) => void
  // Import / export / reset
  exportJSON: () => string
  importJSON: (raw: string) => void
  resetAll: () => void
  clearAllData: () => void
}

const STORAGE_VERSION = 1

function seed(): Pick<StoreState, 'users' | 'bets'> {
  const users: User[] = [
    { id: uuidv4(), name: 'Anna', color: '#ef4444' },
    { id: uuidv4(), name: 'Björn', color: '#3b82f6' },
    { id: uuidv4(), name: 'Carla', color: '#22c55e' }
  ]
  const pick = (i: number) => users[i % users.length].id
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 3600 * 1000).toISOString()

  const bets: Bet[] = [
    { id: uuidv4(), userId: pick(0), date: daysAgo(1), event: 'Allsvenskan: MFF - AIK', stake: 200, odds: 1.9, result: 'won', createdAt: daysAgo(1) },
    { id: uuidv4(), userId: pick(1), date: daysAgo(2), event: 'La Liga: Real - Barca', stake: 150, odds: 2.3, result: 'lost', createdAt: daysAgo(2) },
    { id: uuidv4(), userId: pick(2), date: daysAgo(3), event: 'Premier League: City - Arsenal', stake: 250, odds: 1.7, result: 'won', createdAt: daysAgo(3) },
    { id: uuidv4(), userId: pick(0), date: daysAgo(4), event: 'NHL: Rangers - Bruins', stake: 100, odds: 2.1, result: 'lost', createdAt: daysAgo(4) },
    { id: uuidv4(), userId: pick(1), date: daysAgo(5), event: 'NBA: Lakers - Celtics', stake: 300, odds: 1.8, result: 'won', createdAt: daysAgo(5) },
    { id: uuidv4(), userId: pick(2), date: daysAgo(6), event: 'Tennis: Alcaraz - Sinner', stake: 120, odds: 2.05, result: 'won', createdAt: daysAgo(6) },
    { id: uuidv4(), userId: pick(0), date: daysAgo(7), event: 'CS:GO: NaVi - G2', stake: 80, odds: 1.95, result: 'lost', createdAt: daysAgo(7) },
    { id: uuidv4(), userId: pick(1), date: daysAgo(8), event: 'Allsvenskan: Djurgården - Hammarby', stake: 180, odds: 2.2, result: 'won', createdAt: daysAgo(8) },
    { id: uuidv4(), userId: pick(2), date: daysAgo(9), event: 'MLB: Yankees - Red Sox', stake: 90, odds: 2.4, result: 'lost', createdAt: daysAgo(9) },
    { id: uuidv4(), userId: pick(0), date: daysAgo(10), event: 'UFC: Fighter A - Fighter B', stake: 220, odds: 1.75, result: 'void', createdAt: daysAgo(10) },
    { id: uuidv4(), userId: pick(1), date: daysAgo(11), event: 'Serie A: Inter - Milan', stake: 160, odds: 1.88, result: 'won', createdAt: daysAgo(11) },
    { id: uuidv4(), userId: pick(2), date: daysAgo(12), event: 'Ligue 1: PSG - OM', stake: 130, odds: 1.6, result: 'lost', createdAt: daysAgo(12) },
    { id: uuidv4(), userId: pick(0), date: daysAgo(13), event: 'Golf: Spelare X topp 10', stake: 70, odds: 3.5, result: 'won', createdAt: daysAgo(13) },
    { id: uuidv4(), userId: pick(1), date: daysAgo(14), event: 'Handboll: Sävehof - Ystads IF', stake: 110, odds: 2.0, result: 'lost', createdAt: daysAgo(14) },
    { id: uuidv4(), userId: pick(2), date: daysAgo(15), event: 'Ishockey: Skellefteå - Frölunda', stake: 140, odds: 2.15, result: 'pending', createdAt: daysAgo(15) },
    { id: uuidv4(), userId: pick(0), date: daysAgo(16), event: 'F1: Vinnare GP', stake: 50, odds: 4.0, result: 'lost', createdAt: daysAgo(16) },
    { id: uuidv4(), userId: pick(1), date: daysAgo(17), event: 'Darts: MVG - Price', stake: 95, odds: 1.9, result: 'won', createdAt: daysAgo(17) },
    { id: uuidv4(), userId: pick(2), date: daysAgo(18), event: 'E-sport: LOL final', stake: 60, odds: 2.8, result: 'won', createdAt: daysAgo(18) },
    { id: uuidv4(), userId: pick(0), date: daysAgo(19), event: 'Friidrott: 100m final', stake: 85, odds: 2.6, result: 'lost', createdAt: daysAgo(19) },
    { id: uuidv4(), userId: pick(1), date: daysAgo(20), event: 'Allsvenskan: IFK - Elfsborg', stake: 210, odds: 1.95, result: 'won', createdAt: daysAgo(20) }
  ]
  return { users, bets }
}

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => {
      const { users, bets } = seed()
      return {
        version: STORAGE_VERSION,
        users,
        bets,
        filters: {},
        settings: { currency: 'SEK', minRankBets: 5 },
        addBet: (data) =>
          set((s) => ({
            bets: [
              {
                ...data,
                id: uuidv4(),
                createdAt: new Date().toISOString()
              },
              ...s.bets
            ]
          })),
        updateBet: (id, patch) =>
          set((s) => ({
            bets: s.bets.map((b) => (b.id === id ? { ...b, ...patch } : b))
          })),
        deleteBet: (id) =>
          set((s) => ({
            bets: s.bets.filter((b) => b.id !== id)
          })),
        addUser: (userData) => {
          const id = uuidv4()
          set((s) => ({ users: [...s.users, { id, ...userData }] }))
          return id
        },
        renameUser: (id, name) =>
          set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, name } : u)) })),
        deleteUser: (id) =>
          set((s) => ({
            users: s.users.filter((u) => u.id !== id),
            bets: s.bets.filter((b) => b.userId !== id)
          })),
        setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
        clearFilters: () => set({ filters: {} }),
        setCurrency: (currency) => set((s) => ({ settings: { ...s.settings, currency } })),
        setMinRankBets: (min) => set((s) => ({ settings: { ...s.settings, minRankBets: min } })),
        exportJSON: () => {
          const { users, bets, settings, version } = get()
          return JSON.stringify({ version, users, bets, settings }, null, 2)
        },
        importJSON: (raw) => {
          const data = JSON.parse(raw) as Partial<StoreState> & {
            users?: User[]
            bets?: Bet[]
          }
          const goodUsers = Array.isArray(data.users) ? data.users : []
          const goodBets = Array.isArray(data.bets) ? data.bets : []
          set({
            users: goodUsers,
            bets: goodBets,
            settings: {
              currency: data.settings?.currency ?? 'SEK',
              minRankBets: data.settings?.minRankBets ?? 5
            },
            filters: {},
            version: STORAGE_VERSION
          })
        },
        resetAll: () => {
          const seeded = seed()
          set({
            users: seeded.users,
            bets: seeded.bets,
            filters: {},
            settings: { currency: 'SEK', minRankBets: 5 },
            version: STORAGE_VERSION
          })
        },
        clearAllData: () => {
          set({
            users: [],
            bets: [],
            filters: {},
            settings: { currency: 'SEK', minRankBets: 5 },
            version: STORAGE_VERSION
          })
        }
      }
    },
    {
      name: 'betting-tracker:v1',
      version: STORAGE_VERSION,
      partialize: (s) => ({
        version: s.version,
        users: s.users,
        bets: s.bets,
        settings: s.settings
      }),
      migrate: (persistedState: any, version) => {
        if (!persistedState) return persistedState
        if (version < STORAGE_VERSION) {
          // Future migrations here
          return { ...persistedState, version: STORAGE_VERSION }
        }
        return persistedState
      }
    }
  )
)

export const selectUserById = (id?: string) =>
  useAppStore.getState().users.find((u) => u.id === id)

export const selectLeaderboard = () => {
  const { users, bets } = useAppStore.getState()
  return buildLeaderboard(users, bets)
}