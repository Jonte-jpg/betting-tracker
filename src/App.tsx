import { useMemo, useState } from 'react'
import { Container } from './components/layout/Container'
import { Header } from './components/layout/Header'
import { SummaryCards } from './components/summary/SummaryCards'
import { AddBetForm } from './components/bets/AddBetForm'
import { BetsTable } from './components/bets/BetsTable'
import { Leaderboard } from './components/leaderboard/Leaderboard'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { useAppStore } from './store/useAppStore'
import { summaryForBets } from './lib/calc'

export default function App() {
  const { bets, filters } = useAppStore()
  const [tab, setTab] = useState<'bets' | 'leaderboard' | 'settings'>('bets')

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

  const summary = useMemo(() => summaryForBets(visibleBets), [visibleBets])

  return (
    <div>
      <Header />
      <Container>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="bets">Bets</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="settings">Inställningar</TabsTrigger>
          </TabsList>
          <TabsContent value="bets" className="space-y-6">
            <SummaryCards summary={summary} />
            <div className="grid gap-6 md:grid-cols-2">
              <AddBetForm />
              <BetsTable bets={visibleBets} />
            </div>
          </TabsContent>
          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  )
}