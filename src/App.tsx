import { useMemo, useState } from 'react'
import { Container } from './components/layout/Container'
import { Header } from './components/layout/Header'
import { EnhancedSummaryCards } from './components/summary/EnhancedSummaryCards'
import { AddBetForm } from './components/bets/AddBetForm'
import { BetsTable } from './components/bets/BetsTable'
import { Leaderboard } from './components/leaderboard/Leaderboard'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { AdvancedStats } from './components/analytics/AdvancedStats'
import { ImportExport } from './components/data/ImportExport'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const { bets, filters } = useAppStore()
  const [tab, setTab] = useState<'bets' | 'analytics' | 'leaderboard' | 'data' | 'settings'>('bets')

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
            <AdvancedStats />
          </TabsContent>
          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
          <TabsContent value="data" className="space-y-6">
            <ImportExport />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  )
}