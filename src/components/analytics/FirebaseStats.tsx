import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import type { FirebaseBet } from '@/types/Firebase'
import { subscribeToBets } from '@/lib/firestore'
import { useTransactions } from '@/hooks/useTransactions'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Target, Percent, DollarSign } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const formatCurrency = (amount: number, currency = 'SEK') =>
  new Intl.NumberFormat('sv-SE', { style: 'currency', currency }).format(amount)

export function FirebaseStats() {
  const { user } = useAuth()
  const [bets, setBets] = useState<FirebaseBet[]>([])
  const { totals } = useTransactions()
  const [bookmaker, setBookmaker] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToBets(user.uid, (list) => setBets(list))
    return () => unsub()
  }, [user])

  // Helpers to keep cognitive complexity low
  const computeDailyChart = (settled: FirebaseBet[]) => {
    const dailyMap: Record<string, { date: string; profit: number; cumulative: number }> = {}
    for (const b of settled) {
      const date = format(new Date(b.createdAt), 'yyyy-MM-dd')
      if (!dailyMap[date]) dailyMap[date] = { date, profit: 0, cumulative: 0 }
      if (b.result === 'won') dailyMap[date].profit += b.stake * (b.odds - 1)
      if (b.result === 'lost') dailyMap[date].profit -= b.stake
    }
    let cum = 0
    return Object.values(dailyMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => {
        cum += d.profit
        return { ...d, cumulative: cum }
      })
  }

  const computeMonthlyChart = (settled: FirebaseBet[]) => {
    const monthlyMap: Record<string, { month: string; profit: number; staked: number; count: number; won: number; lost: number }> = {}
    for (const b of settled) {
      const key = format(new Date(b.createdAt), 'yyyy-MM')
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, profit: 0, staked: 0, count: 0, won: 0, lost: 0 }
      monthlyMap[key].staked += b.stake
      monthlyMap[key].count += 1
      if (b.result === 'won') { monthlyMap[key].profit += b.stake * (b.odds - 1); monthlyMap[key].won += 1 }
      if (b.result === 'lost') { monthlyMap[key].profit -= b.stake; monthlyMap[key].lost += 1 }
    }
    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month))
  }

  const computeOddsData = (settled: FirebaseBet[]) => {
    const ranges = [
      { range: '1.0-1.5', min: 1.0, max: 1.5, count: 0, won: 0 },
      { range: '1.5-2.0', min: 1.5, max: 2.0, count: 0, won: 0 },
      { range: '2.0-3.0', min: 2.0, max: 3.0, count: 0, won: 0 },
      { range: '3.0-5.0', min: 3.0, max: 5.0, count: 0, won: 0 },
      { range: '5.0+', min: 5.0, max: Infinity, count: 0, won: 0 }
    ]
    settled.forEach((b) => {
      const r = ranges.find((r) => b.odds >= r.min && b.odds < r.max)
      if (!r) return
      r.count += 1
      if (b.result === 'won') r.won += 1
    })
    return ranges.map((r) => ({ ...r, winRate: r.count > 0 ? (r.won / r.count) * 100 : 0 }))
  }

  const stats = useMemo(() => {
    const byDate = (b: FirebaseBet) => {
      const ts = new Date(b.createdAt).getTime()
      if (startDate && ts < new Date(startDate).getTime()) return false
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (ts > end.getTime()) return false
      }
      return true
    }
    const byBookmaker = (b: FirebaseBet) => (bookmaker === 'all' ? true : b.bookmaker === bookmaker)
    const filtered = bets.filter((b) => byDate(b) && byBookmaker(b))
  const settled = filtered.filter((b) => b.result !== 'pending')
    const won = settled.filter((b) => b.result === 'won')
    const lost = settled.filter((b) => b.result === 'lost')
    const voids = filtered.filter((b) => b.result === 'void')

  // Total staked across ALL filtered bets (including pending)
  const totalStakedAll = filtered.reduce((s, b) => s + b.stake, 0)
    const totalStaked = settled.reduce((s, b) => s + b.stake, 0)
    const totalReturns = won.reduce((s, b) => s + b.stake * b.odds, 0)
    const profit = totalReturns - totalStaked
    const netDeposits = totals.balance
    const profitInclTransactions = profit - netDeposits
    const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0
    const winRate = settled.length > 0 ? (won.length / settled.length) * 100 : 0
    const avgStake = settled.length > 0 ? totalStaked / settled.length : 0
  const avgOdds = settled.length > 0 ? settled.reduce((s, b) => s + b.odds, 0) / settled.length : 0

  const dailyChartData = computeDailyChart(settled)
  const monthlyChartData = computeMonthlyChart(settled)
  const oddsData = computeOddsData(settled)

    return {
      settledCount: settled.length,
      wonCount: won.length,
      lostCount: lost.length,
      voidCount: voids.length,
  totalStakedAll,
  totalStaked,
      totalReturns,
      profit,
      profitInclTransactions,
      netDeposits,
      roi,
      winRate,
      avgStake,
      avgOdds,
      dailyChartData,
      monthlyChartData,
      oddsData
    }
  }, [bets, totals.balance, bookmaker, startDate, endDate])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt satsat</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalStakedAll)}</div>
            <p className="text-xs text-muted-foreground">Bets: {stats.settledCount + (stats.voidCount + (bets.filter(b => b.result === 'pending').length))}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Filter</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label htmlFor="bookmaker" className="text-xs text-muted-foreground">Spelbolag</label>
              <Select value={bookmaker} onValueChange={setBookmaker}>
                <SelectTrigger id="bookmaker" aria-label="Spelbolag">
                  <SelectValue placeholder="Välj spelbolag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla</SelectItem>
                  {Array.from(new Set(bets.map((b) => b.bookmaker))).map((bm) => (
                    <SelectItem key={bm} value={bm}>{bm}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor="start-date" className="text-xs text-muted-foreground">Från datum</label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label htmlFor="end-date" className="text-xs text-muted-foreground">Till datum</label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vinst (exkl. insättningar)</CardTitle>
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
            <p className="text-xs text-muted-foreground">ROI: {stats.roi.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vinst (inkl. insättningar)</CardTitle>
            {stats.profitInclTransactions >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.profitInclTransactions >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.profitInclTransactions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Nettoinsättningar: {formatCurrency(stats.netDeposits)}
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
              {stats.wonCount}/{stats.settledCount} vunna
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genomsnitt</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">∅ Insats: <b>{formatCurrency(stats.avgStake)}</b></div>
            <div className="text-sm">∅ Odds: <b>{stats.avgOdds.toFixed(2)}</b></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="monthly">Månad</TabsTrigger>
          <TabsTrigger value="odds">Odds</TabsTrigger>
          <TabsTrigger value="results">Resultat</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Vinsttrend över tid</CardTitle>
              <CardDescription>Kumulativ vinst per dag</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), 'MM/dd')} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    labelFormatter={(v) => format(new Date(v), 'yyyy-MM-dd')}
                    formatter={(v: number) => [formatCurrency(v), 'Kumulativ vinst']}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Månadsvis vinst</CardTitle>
              <CardDescription>Vinst/förlust per månad</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={(v) => format(new Date(v + '-01'), 'MMM yyyy', { locale: sv })} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    labelFormatter={(v) => format(new Date(v + '-01'), 'MMMM yyyy', { locale: sv })}
                    formatter={(v: number) => [formatCurrency(v), 'Vinst']}
                  />
                  <Bar dataKey="profit" fill="#10b981" name="Vinst" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="odds">
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
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Träffsäkerhet']} />
                  <Bar dataKey="winRate" fill="#a78bfa" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Resultatfördelning</CardTitle>
              <CardDescription>Andelar vunna/förlorade/avbrutna</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Vunna', value: stats.wonCount, color: '#22c55e' },
                      { name: 'Förlorade', value: stats.lostCount, color: '#ef4444' },
                      { name: 'Avbrutna', value: stats.voidCount, color: '#6b7280' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {[
                      { name: 'Vunna', value: stats.wonCount, color: '#22c55e' },
                      { name: 'Förlorade', value: stats.lostCount, color: '#ef4444' },
                      { name: 'Avbrutna', value: stats.voidCount, color: '#6b7280' }
                    ].map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FirebaseStats
