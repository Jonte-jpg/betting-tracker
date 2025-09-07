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

export interface Transaction {
  id?: string
  userId: string
  type: 'deposit' | 'withdrawal' 
  amount: number
  bookmaker: string
  date: string
  notes?: string
  method?: string  // Betalningsmetod: Swish, bank, etc.
  status: 'completed' | 'pending' | 'failed'
  category?: string  // För kategorisering: "bonus", "regular", etc.
  tags?: string[]
  createdAt: string
  updatedAt?: string
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
