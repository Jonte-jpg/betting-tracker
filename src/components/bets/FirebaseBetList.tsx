import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { subscribeToBets, calculateBetStats, updateBet, deleteBet } from '@/lib/firestore'
import { EditBetDialog } from '@/components/bets/EditBetDialog'
import { BackupReminder } from '@/components/data/BackupReminder'
import { exportFirebaseBetsAsJSON, exportFirebaseBetsAsCSV } from '@/lib/firebaseExport'
import type { FirebaseBet } from '@/types/Firebase'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Trash2, TrendingUp, TrendingDown, Target, DollarSign, Download } from 'lucide-react'
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

  const getBetCardClasses = (result: FirebaseBet['result']) => {
    const baseClasses = 'border-2 rounded-lg p-4 space-y-3 transition-colors text-black'
    switch (result) {
      case 'won': 
        return `${baseClasses} !border-green-400 !bg-green-50 hover:!bg-green-100`
      case 'lost': 
        return `${baseClasses} !border-red-400 !bg-red-50 hover:!bg-red-100`
      case 'void': 
        return `${baseClasses} !border-yellow-400 !bg-yellow-50 hover:!bg-yellow-100`
      case 'pending':
      default: 
        return `${baseClasses} !border-blue-400 !bg-blue-50 hover:!bg-blue-100`
    }
  }

  const getResultVariant = (result: FirebaseBet['result']) => {
    switch (result) {
      case 'won': return 'default'
      case 'lost': return 'destructive' 
      case 'void': return 'secondary'
      default: return 'outline'
    }
  }

  const getResultBadgeClasses = (result: FirebaseBet['result']) => {
    switch (result) {
      case 'won': 
        return 'bg-green-100 text-green-800 border-green-300 font-medium'
      case 'lost': 
        return 'bg-red-100 text-red-800 border-red-300 font-medium'
      case 'void': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 font-medium'
      case 'pending':
      default: 
        return 'bg-blue-100 text-blue-800 border-blue-300 font-medium'
    }
  }

  const getResultColor = (result: FirebaseBet['result']) => {
    switch (result) {
      case 'won': return 'text-green-600'
      case 'lost': return 'text-red-600'
      case 'void': return 'text-gray-600'
      default: return 'text-yellow-600'
    }
  }

  const getPayoutLabel = (result: FirebaseBet['result']) => {
    switch (result) {
      case 'won': return 'Total utbetalning:'
      case 'void': return 'Återbetalning:'
      case 'lost': return 'Förlust:'
      default: return 'Faktisk utbetalning:'
    }
  }

  return (
    <div className="space-y-6">
      {/* Backup Reminder */}
      <BackupReminder />
      
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
          <CardTitle>Dina Bets</CardTitle>
        </CardHeader>
        <CardContent>
          {bets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Inga bets ännu. Lägg till din första bet!
            </p>
          ) : (
            <div className="space-y-4">
              {bets.map((bet) => {
                const cardClasses = getBetCardClasses(bet.result)
                console.log(`Bet ${bet.id} has result: ${bet.result}, classes: ${cardClasses}`)
                return (
                <div
                  key={bet.id}
                  className={cardClasses}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium text-black">{bet.event}</h3>
                      <p className="text-sm text-gray-700">{bet.market}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-800">{bet.bookmaker}</span>
                        <Badge variant="outline" className="text-black border-gray-400">{bet.currency}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getResultVariant(bet.result)} className={getResultBadgeClasses(bet.result)}>
                        {(() => {
                          if (bet.result === 'pending') return 'Pågående'
                          if (bet.result === 'won') return 'Vunnen'
                          if (bet.result === 'lost') return 'Förlorad'
                          return 'Avbruten'
                        })()}
                      </Badge>
                      <div className="flex gap-1">
                        <EditBetDialog bet={bet} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBet(bet.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Insats:</span>
                      <div className="font-medium text-black">
                        {formatCurrency(bet.stake, bet.currency)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Odds:</span>
                      <div className="font-medium text-black">{bet.odds.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Potentiell vinst:</span>
                      <div className="font-medium text-green-600">
                        {formatCurrency(bet.stake * (bet.odds - 1), bet.currency)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {getPayoutLabel(bet.result)}
                      </span>
                      <div className={`font-medium ${getResultColor(bet.result)}`}>
                        {bet.payout !== undefined ? formatCurrency(bet.payout, bet.currency) : '-'}
                      </div>
                    </div>
                  </div>

                  {bet.tags && bet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bet.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {bet.notes && (
                    <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                      {bet.notes}
                    </p>
                  )}

                  {bet.result === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateBetResult(bet.id!, 'won')}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        Markera som vunnen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateBetResult(bet.id!, 'lost')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Markera som förlorad
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateBetResult(bet.id!, 'void')}
                      >
                        Markera som avbruten
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-gray-600">
                    {format(new Date(bet.createdAt), 'PPp', { locale: sv })}
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
