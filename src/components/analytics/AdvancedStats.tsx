import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/useAppStore'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Target, DollarSign, Calendar, Percent } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AdvancedStats() {
  const { bets, users, settings } = useAppStore()
  
  const stats = useMemo(() => {
    const filteredBets = bets.filter(bet => bet.result !== 'pending')
    const wonBets = filteredBets.filter(bet => bet.result === 'won')
    const lostBets = filteredBets.filter(bet => bet.result === 'lost')
    const voidBets = bets.filter(bet => bet.result === 'void')
    
    const totalStaked = filteredBets.reduce((sum, bet) => sum + bet.stake, 0)
    const totalReturns = wonBets.reduce((sum, bet) => sum + (bet.stake * bet.odds), 0)
    const profit = totalReturns - totalStaked
    const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0
    const winRate = filteredBets.length > 0 ? (wonBets.length / filteredBets.length) * 100 : 0
    const avgStake = filteredBets.length > 0 ? totalStaked / filteredBets.length : 0
    const avgOdds = filteredBets.length > 0 ? filteredBets.reduce((sum, bet) => sum + bet.odds, 0) / filteredBets.length : 0
    
    // Monthly data
    const monthlyData = filteredBets.reduce((acc, bet) => {
      const month = format(new Date(bet.date), 'yyyy-MM')
      if (!acc[month]) {
        acc[month] = { month, profit: 0, staked: 0, won: 0, lost: 0, count: 0 }
      }
      acc[month].staked += bet.stake
      acc[month].count += 1
      if (bet.result === 'won') {
        acc[month].profit += bet.stake * (bet.odds - 1)
        acc[month].won += 1
      } else if (bet.result === 'lost') {
        acc[month].profit -= bet.stake
        acc[month].lost += 1
      }
      return acc
    }, {} as Record<string, any>)
    
    const monthlyChartData = Object.values(monthlyData).sort((a: any, b: any) => 
      a.month.localeCompare(b.month)
    )
    
    // Daily profitability trend
    const dailyData = filteredBets.reduce((acc, bet) => {
      const date = format(new Date(bet.date), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = { date, profit: 0, cumulative: 0 }
      }
      if (bet.result === 'won') {
        acc[date].profit += bet.stake * (bet.odds - 1)
      } else if (bet.result === 'lost') {
        acc[date].profit -= bet.stake
      }
      return acc
    }, {} as Record<string, any>)
    
    let cumulativeProfit = 0
    const dailyChartData = Object.values(dailyData)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .map((day: any) => {
        cumulativeProfit += day.profit
        return { ...day, cumulative: cumulativeProfit }
      })
    
    // Odds distribution
    const oddsRanges = [
      { range: '1.0-1.5', min: 1.0, max: 1.5, count: 0, won: 0 },
      { range: '1.5-2.0', min: 1.5, max: 2.0, count: 0, won: 0 },
      { range: '2.0-3.0', min: 2.0, max: 3.0, count: 0, won: 0 },
      { range: '3.0-5.0', min: 3.0, max: 5.0, count: 0, won: 0 },
      { range: '5.0+', min: 5.0, max: Infinity, count: 0, won: 0 }
    ]
    
    filteredBets.forEach(bet => {
      const range = oddsRanges.find(r => bet.odds >= r.min && bet.odds < r.max)
      if (range) {
        range.count++
        if (bet.result === 'won') range.won++
      }
    })
    
    const oddsData = oddsRanges.map(range => ({
      ...range,
      winRate: range.count > 0 ? (range.won / range.count) * 100 : 0
    }))
    
    // User performance
    const userStats = users.map(user => {
      const userBets = filteredBets.filter(bet => bet.userId === user.id)
      const userWon = userBets.filter(bet => bet.result === 'won')
      const userStaked = userBets.reduce((sum, bet) => sum + bet.stake, 0)
      const userReturns = userWon.reduce((sum, bet) => sum + (bet.stake * bet.odds), 0)
      const userProfit = userReturns - userStaked
      const userWinRate = userBets.length > 0 ? (userWon.length / userBets.length) * 100 : 0
      
      return {
        name: user.name,
        color: user.color,
        bets: userBets.length,
        profit: userProfit,
        winRate: userWinRate,
        roi: userStaked > 0 ? (userProfit / userStaked) * 100 : 0
      }
    })
    
    return {
      totalBets: filteredBets.length,
      wonBets: wonBets.length,
      lostBets: lostBets.length,
      voidBets: voidBets.length,
      totalStaked,
      totalReturns,
      profit,
      roi,
      winRate,
      avgStake,
      avgOdds,
      monthlyChartData,
      dailyChartData,
      oddsData,
      userStats
    }
  }, [bets, users])
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: settings.currency
    }).format(amount)
  }
  
  return (
    <div className="space-y-6">
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
              {formatCurrency(stats.profit)}
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
              {stats.wonBets}/{stats.totalBets} vunna
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genomsnittlig Insats</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgStake)}</div>
            <p className="text-xs text-muted-foreground">
              Totalt satsat: {formatCurrency(stats.totalStaked)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genomsnittliga Odds</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOdds.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Högsta: {Math.max(...bets.map(b => b.odds)).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trender</TabsTrigger>
          <TabsTrigger value="distribution">Fördelning</TabsTrigger>
          <TabsTrigger value="users">Användare</TabsTrigger>
          <TabsTrigger value="monthly">Månadsvis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vinsttrend över tid</CardTitle>
              <CardDescription>Kumulativ vinst per dag</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'yyyy-MM-dd')}
                    formatter={(value: number) => [formatCurrency(value), 'Kumulativ vinst']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Träffsäkerhet per odds-intervall</CardTitle>
                <CardDescription>Hur bra är du på olika odds-nivåer?</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.oddsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Träffsäkerhet']} />
                    <Bar dataKey="winRate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resultatfördelning</CardTitle>
                <CardDescription>Fördelning av alla dina bets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Vunna', value: stats.wonBets, color: '#22c55e' },
                        { name: 'Förlorade', value: stats.lostBets, color: '#ef4444' },
                        { name: 'Avbrutna', value: stats.voidBets, color: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Vunna', value: stats.wonBets, color: '#22c55e' },
                        { name: 'Förlorade', value: stats.lostBets, color: '#ef4444' },
                        { name: 'Avbrutna', value: stats.voidBets, color: '#6b7280' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stats.userStats.map((user, index) => (
              <Card key={user.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: user.color }}
                    />
                    {user.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Antal bets:</span>
                      <Badge variant="secondary">{user.bets}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Vinst:</span>
                      <span className={user.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(user.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Träffsäkerhet:</span>
                      <span>{user.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className={user.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {user.roi.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Månadsvis prestanda</CardTitle>
              <CardDescription>Vinst/förlust per månad</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => format(new Date(value + '-01'), 'MMM yyyy', { locale: sv })}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value + '-01'), 'MMMM yyyy', { locale: sv })}
                    formatter={(value: number) => [formatCurrency(value), 'Vinst']}
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="#8884d8"
                    name="Vinst"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
