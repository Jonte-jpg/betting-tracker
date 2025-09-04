import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency } from '@/lib/format'
import { 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Target, 
  Calendar,
  Zap,
  Crown
} from 'lucide-react'
import { useMemo } from 'react'

export function EnhancedSummaryCards() {
  const { bets, users, settings } = useAppStore()
  
  const stats = useMemo(() => {
    const settledBets = bets.filter(bet => bet.result !== 'pending')
    const wonBets = settledBets.filter(bet => bet.result === 'won')
    const lostBets = settledBets.filter(bet => bet.result === 'lost')
    const pendingBets = bets.filter(bet => bet.result === 'pending')
    
    const totalStaked = settledBets.reduce((sum, bet) => sum + bet.stake, 0)
    const totalReturns = wonBets.reduce((sum, bet) => sum + (bet.stake * bet.odds), 0)
    const profit = totalReturns - totalStaked
    const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0
    const winRate = settledBets.length > 0 ? (wonBets.length / settledBets.length) * 100 : 0
    
    // Pending bets potential
    const pendingStake = pendingBets.reduce((sum, bet) => sum + bet.stake, 0)
    const pendingPotential = pendingBets.reduce((sum, bet) => sum + (bet.stake * bet.odds), 0)
    
    // Recent performance (last 10 bets)
    const recentBets = settledBets.slice(0, 10)
    const recentWins = recentBets.filter(bet => bet.result === 'won').length
    const recentWinRate = recentBets.length > 0 ? (recentWins / recentBets.length) * 100 : 0
    
    // Best user
    const userPerformance = users.map(user => {
      const userBets = settledBets.filter(bet => bet.userId === user.id)
      const userWins = userBets.filter(bet => bet.result === 'won')
      const userStaked = userBets.reduce((sum, bet) => sum + bet.stake, 0)
      const userReturns = userWins.reduce((sum, bet) => sum + (bet.stake * bet.odds), 0)
      const userProfit = userReturns - userStaked
      const userROI = userStaked > 0 ? (userProfit / userStaked) * 100 : 0
      
      return {
        ...user,
        profit: userProfit,
        roi: userROI,
        betsCount: userBets.length
      }
    }).sort((a, b) => b.roi - a.roi)
    
    const bestUser = userPerformance[0]
    
    // Best odds hit
    const bestWin = wonBets.length > 0 ? wonBets.reduce((best, bet) => 
      bet.odds > best.odds ? bet : best, wonBets[0]
    ) : null
    
    return {
      totalBets: bets.length,
      settledBets: settledBets.length,
      wonBets: wonBets.length,
      lostBets: lostBets.length,
      pendingBets: pendingBets.length,
      totalStaked,
      totalReturns,
      profit,
      roi,
      winRate,
      recentWinRate,
      pendingStake,
      pendingPotential,
      bestUser,
      bestWin
    }
  }, [bets, users])
  
  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600'
    if (profit < 0) return 'text-red-600'
    return 'text-gray-600'
  }
  
  const getWinRateColor = (rate: number) => {
    if (rate >= 60) return 'text-green-600'
    if (rate >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getROIBadgeVariant = (roi: number) => {
    if (roi > 10) return 'default'
    if (roi > 0) return 'secondary'
    return 'destructive'
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Profit Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-4 translate-x-4" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vinst</CardTitle>
          {stats.profit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getProfitColor(stats.profit)}`}>
            {formatCurrency(stats.profit, settings.currency)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getROIBadgeVariant(stats.roi)}>
              ROI: {stats.roi.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Av {formatCurrency(stats.totalStaked, settings.currency)} satsat
          </p>
        </CardContent>
      </Card>
      
      {/* Win Rate Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-4 translate-x-4" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Träffsäkerhet</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getWinRateColor(stats.winRate)}`}>
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Senaste 10: {stats.recentWinRate.toFixed(0)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.wonBets}/{stats.settledBets} vunna bets
          </p>
        </CardContent>
      </Card>
      
      {/* Pending Bets Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full -translate-y-4 translate-x-4" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pågående Bets</CardTitle>
          <Calendar className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pendingBets}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {formatCurrency(stats.pendingStake, settings.currency)} satsat
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Potential: {formatCurrency(stats.pendingPotential, settings.currency)}
          </p>
        </CardContent>
      </Card>
      
      {/* Best Performance Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-4 translate-x-4" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bästa Prestanda</CardTitle>
          <Crown className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          {stats.bestUser ? (
            <>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: stats.bestUser.color }}
                />
                <span className="font-bold">{stats.bestUser.name}</span>
              </div>
              <div className={`text-lg font-semibold ${getProfitColor(stats.bestUser.profit)}`}>
                ROI: {stats.bestUser.roi.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.bestUser.betsCount} bets, {formatCurrency(stats.bestUser.profit, settings.currency)}
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Ingen data</div>
          )}
        </CardContent>
      </Card>
      
      {/* Best Win Card */}
      {stats.bestWin && (
        <Card className="md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bästa Vinst</CardTitle>
            <Trophy className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xl font-bold text-amber-600">
                  @{stats.bestWin.odds.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Odds</p>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(stats.bestWin.stake * (stats.bestWin.odds - 1), settings.currency)}
                </div>
                <p className="text-xs text-muted-foreground">Vinst</p>
              </div>
              <div>
                <div className="text-sm font-medium truncate">{stats.bestWin.event}</div>
                <p className="text-xs text-muted-foreground">
                  Insats: {formatCurrency(stats.bestWin.stake, settings.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Stats */}
      <Card className={`${stats.bestWin ? 'md:col-span-2' : 'md:col-span-4'} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full -translate-y-8 translate-x-8" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            Snabbstatistik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalBets}</div>
              <div className="text-xs text-muted-foreground">Totala bets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.wonBets}</div>
              <div className="text-xs text-muted-foreground">Vunna</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.lostBets}</div>
              <div className="text-xs text-muted-foreground">Förlorade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingBets}</div>
              <div className="text-xs text-muted-foreground">Pågående</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
