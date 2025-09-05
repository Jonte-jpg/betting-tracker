import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { subscribeToBets, calculateBetStats, updateBet, deleteBet } from '@/lib/firestore'
import { BackupReminder } from '@/components/data/BackupReminder'
import { Bet365Import } from '@/components/data/Bet365Import'
import { CSVInstructions } from '@/components/data/CSVInstructions'
import { exportFirebaseBetsAsJSON, exportFirebaseBetsAsCSV } from '@/lib/firebaseExport'
import type { FirebaseBet } from '@/types/Firebase'
import { TrendingUp, TrendingDown, Target, DollarSign, Download } from 'lucide-react'
import { PaginatedBetsList } from './PaginatedBetsList'
import { toast } from 'sonner'
import { deleteField } from 'firebase/firestore'

export function FirebaseBetList() {
  const { user } = useAuth()
  const [bets, setBets] = useState<FirebaseBet[]>([])
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(amount)
  }

  useEffect(() => {
    if (!user) {
      setBets([])
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToBets(user.uid, (newBets) => {
      setBets(newBets)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleUpdateBetResult = async (betId: string, result: FirebaseBet['result']) => {
    try {
      const bet = bets.find(b => b.id === betId)
      if (!bet) return

      const updateData: Partial<FirebaseBet> = { result }

      // Calculate payout based on result
      if (result === 'won') {
        updateData.payout = bet.stake * bet.odds
      } else if (result === 'lost') {
        updateData.payout = 0
      } else if (result === 'void') {
        updateData.payout = bet.stake // Return stake for void bets
      } else if (result === 'pending') {
        // Remove payout field for pending bets using deleteField
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updateData as any).payout = deleteField()
      }

      await updateBet(betId, updateData)
      
      // Show success message
      const messages = {
        won: 'Bet markerat som vunnet! 🎉',
        lost: 'Bet markerat som förlorat 😞',
        void: 'Bet markerat som avbrutet',
        pending: 'Bet markerat som pågående'
      }
      toast.success(messages[result])
    } catch (error) {
      console.error('Error updating bet:', error)
      toast.error('Kunde inte uppdatera bet')
    }
  }

  const handleDeleteBet = async (betId: string) => {
    if (window.confirm('Är du säker på att du vill ta bort denna bet?')) {
      try {
        await deleteBet(betId)
      } catch (error) {
        console.error('Error deleting bet:', error)
      }
    }
  }

  const handleExportJSON = () => {
    try {
      exportFirebaseBetsAsJSON(bets, user?.email || 'unknown')
      toast.success('Data exporterad som JSON')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Kunde inte exportera data')
    }
  }

  const handleExportCSV = () => {
    try {
      exportFirebaseBetsAsCSV(bets)
      toast.success('Data exporterad som CSV')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Kunde inte exportera data')
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Logga in för att se dina bets
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Laddar bets...</p>
        </CardContent>
      </Card>
    )
  }

  const stats = calculateBetStats(bets)

  return (
    <div className="space-y-6">
      {/* Backup Reminder */}
      <BackupReminder />
      
      {/* Bet365 CSV Import */}
      <Bet365Import />
      
      {/* CSV Instructions */}
      <CSVInstructions />
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vinst</CardTitle>
            {stats.profit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.profit, 'SEK')}
            </div>
            <p className="text-xs text-muted-foreground">
              ROI: {stats.roi.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Träffsäkerhet</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.wonBets}/{stats.settledBets} vunna
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt Satsat</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalStaked, 'SEK')}</div>
            <p className="text-xs text-muted-foreground">
              Genomsnitt: {formatCurrency(stats.avgStake, 'SEK')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Antal Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBets}</div>
            <p className="text-xs text-muted-foreground">
              Pågående: {stats.pendingBets}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      {bets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exportera Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportJSON} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportera JSON
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportera CSV
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Exportera din data för backup eller analys i andra verktyg
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bets List */}
      <Card>
        <CardHeader>
          <CardTitle>Dina Bets ({bets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <PaginatedBetsList 
            bets={bets}
            onUpdateResult={handleUpdateBetResult}
            onDelete={handleDeleteBet}
          />
        </CardContent>
      </Card>
    </div>
  )
}
