import { useMemo, useState, Suspense, lazy } from 'react'
import { Container } from './components/layout/Container'
import { Header } from './components/layout/Header'
import { EnhancedSummaryCards } from './components/summary/EnhancedSummaryCards'
import { AddBetForm } from './components/bets/AddBetForm'
import { BetsTable } from './components/bets/BetsTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { useAppStore } from './store/useAppStore'

// Lazy load components that are not immediately visible
const AdvancedStats = lazy(() => import('./components/analytics/AdvancedStats').then(m => ({ default: m.AdvancedStats })))
const Leaderboard = lazy(() => import('./components/leaderboard/Leaderboard').then(m => ({ default: m.Leaderboard })))
const ImportExport = lazy(() => import('./components/data/ImportExport').then(m => ({ default: m.ImportExport })))
const SettingsPanel = lazy(() => import('./components/settings/SettingsPanel').then(m => ({ default: m.SettingsPanel })))
const TransactionsManager = lazy(() => import('./components/transactions/TransactionsManager').then(m => ({ default: m.TransactionsManager })))

export default function App() {
  const { bets, filters } = useAppStore()
  const [tab, setTab] = useState<'bets' | 'analytics' | 'leaderboard' | 'data' | 'settings' | 'transactions'>('bets')

  const visibleBets = useMemo(() => {
    return bets.filter((b) => {
      if (filters.userId && b.userId !== filters.userId) return false
      if (filters.result && b.result !== filters.result) return false
      if (filters.from && new Date(b.date) < new Date(filters.from)) return false
      if (filters.to && new Date(b.date) > new Date(filters.to)) return false
      if (filters.search && !b.event.toLowerCase().includes(filters.search.toLowerCase()))
        return false
      return true
    })
  }, [bets, filters])

  return (
    <div>
      <Header />
      <Container>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="bets">Bets</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analys</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="settings">Inställningar</TabsTrigger>
          </TabsList>
          <TabsContent value="bets" className="space-y-6">
            <EnhancedSummaryCards />
            <div className="grid gap-6 md:grid-cols-2">
              <AddBetForm />
              <BetsTable bets={visibleBets} />
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-6">
            <Suspense fallback={<div className="text-center p-8">Laddar analys...</div>}>
              <AdvancedStats />
            </Suspense>
          </TabsContent>
          <TabsContent value="transactions">
            <Suspense fallback={<div className="text-center p-8">Laddar transactions...</div>}>
              <TransactionsManager />
            </Suspense>
          </TabsContent>
          <TabsContent value="leaderboard">
            <Suspense fallback={<div className="text-center p-8">Laddar leaderboard...</div>}>
              <Leaderboard />
            </Suspense>
          </TabsContent>
          <TabsContent value="data" className="space-y-6">
            <Suspense fallback={<div className="text-center p-8">Laddar data...</div>}>
              <ImportExport />
            </Suspense>
          </TabsContent>
          <TabsContent value="settings">
            <Suspense fallback={<div className="text-center p-8">Laddar inställningar...</div>}>
              <SettingsPanel />
            </Suspense>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  )
}