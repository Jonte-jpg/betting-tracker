import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { subscribeToBets, calculateBetStats, updateBet, deleteBet } from '@/lib/firestore'
import type { FirebaseBet } from '@/types/Firebase'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Trash2, TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react'

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
      await updateBet(betId, { result })
    } catch (error) {
      console.error('Error updating bet:', error)
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

  const getResultVariant = (result: FirebaseBet['result']) => {
    switch (result) {
      case 'won': return 'default'
      case 'lost': return 'destructive'
      case 'void': return 'secondary'
      default: return 'outline'
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

  return (
    <div className="space-y-6">
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
              {bets.map((bet) => (
                <div
                  key={bet.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium">{bet.event}</h3>
                      <p className="text-sm text-muted-foreground">{bet.market}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span>{bet.bookmaker}</span>
                        <Badge variant="outline">{bet.currency}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getResultVariant(bet.result)}>
                        {(() => {
                          if (bet.result === 'pending') return 'Pågående'
                          if (bet.result === 'won') return 'Vunnen'
                          if (bet.result === 'lost') return 'Förlorad'
                          return 'Avbruten'
                        })()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBet(bet.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Insats:</span>
                      <div className="font-medium">
                        {formatCurrency(bet.stake, bet.currency)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Odds:</span>
                      <div className="font-medium">{bet.odds.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Potentiell vinst:</span>
                      <div className="font-medium text-green-600">
                        {formatCurrency(bet.stake * (bet.odds - 1), bet.currency)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Faktisk utbetalning:</span>
                      <div className={`font-medium ${getResultColor(bet.result)}`}>
                        {bet.payout ? formatCurrency(bet.payout, bet.currency) : '-'}
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
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
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

                  <div className="text-xs text-muted-foreground">
                    {format(new Date(bet.createdAt), 'PPp', { locale: sv })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
