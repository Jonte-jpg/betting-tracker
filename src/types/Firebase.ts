export interface FirebaseBet {
  id?: string
  userId: string
  event: string
  market: string
  stake: number
  odds: number
  bookmaker: string
  result: 'pending' | 'won' | 'lost' | 'void'
  payout?: number
  notes?: string
  tags?: string[]
  currency: string
  createdAt: string
  updatedAt: string
}

export interface FirebaseUser {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: string
  lastLoginAt: string
  preferences: {
    defaultCurrency: string
    defaultBookmaker?: string
  }
}
