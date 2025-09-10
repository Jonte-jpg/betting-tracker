import { Container } from './components/layout/Container'
import { Header } from './components/layout/Header'
import { FirebaseBetForm } from './components/bets/FirebaseBetForm'
import { FirebaseBetList } from './components/bets/FirebaseBetList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { useAuth } from './hooks/useAuth'
import { Card, CardContent } from './components/ui/card'
import { useState, Suspense, lazy } from 'react'

// Lazy load the full transactions manager (CRUD, totals)
const TransactionsManager = lazy(() => import('./components/transactions/TransactionsManager').then(m => ({ default: m.TransactionsManager })))
const FirebaseStats = lazy(() => import('./components/analytics/FirebaseStats').then(m => ({ default: m.FirebaseStats })))

export default function FirebaseApp() {
  const { user, loading } = useAuth()
  const [tab, setTab] = useState<'bets' | 'add' | 'transactions' | 'stats'>('bets')

  if (loading) {
    return (
      <div>
        <Header />
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground">Laddar...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (!user) {
    return (
      <div>
        <Header />
        <Container>
          <Card className="max-w-md mx-auto mt-8">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Välkommen till Betting Tracker</h2>
              <p className="text-muted-foreground mb-6">
                Logga in med Google för att börja spåra dina bets
              </p>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  ✅ Spåra dina bets säkert i molnet<br/>
                  ✅ Detaljerad statistik och analys<br/>
                  ✅ Automatiska vinstberäkningar<br/>
                  ✅ Taggar och anteckningar
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <Container>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="bets">Mina Bets</TabsTrigger>
            <TabsTrigger value="add">Lägg till Bet</TabsTrigger>
            <TabsTrigger value="transactions">Transaktioner</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bets" className="space-y-6">
            <FirebaseBetList />
          </TabsContent>
          
          <TabsContent value="add" className="space-y-6">
            <FirebaseBetForm />
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-6">
            <Suspense fallback={<div className="text-center p-8">Laddar transaktioner...</div>}>
              <TransactionsManager />
            </Suspense>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <Suspense fallback={<div className="text-center p-8">Laddar statistik...</div>}>
              <FirebaseStats />
            </Suspense>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  )
}
