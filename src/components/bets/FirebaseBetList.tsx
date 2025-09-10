import { useState, useEffect, useCallback, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { subscribeToBets, updateBet, deleteBet } from '@/lib/firestore'
import { BackupReminder } from '@/components/data/BackupReminder'
import { Bet365Import } from '@/components/data/Bet365Import'
import { CSVInstructions } from '@/components/data/CSVInstructions'
import { exportFirebaseBetsAsJSON, exportFirebaseBetsAsCSV } from '@/lib/firebaseExport'
import type { FirebaseBet } from '@/types/Firebase'
import { Download } from 'lucide-react'
import { PaginatedBetsList } from './PaginatedBetsList'
import { toast } from 'sonner'
import { deleteField, FieldValue } from 'firebase/firestore'
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog'

type BetUpdate = Omit<Partial<FirebaseBet>, 'payout'> & { payout?: number | FieldValue }

export function FirebaseBetList() {
  const { user } = useAuth()
  const [bets, setBets] = useState<FirebaseBet[]>([])
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // no currency formatting needed here; stats moved to Stats tab

  useEffect(() => {
    if (!user?.uid) {
      setBets([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeToBets(user.uid, (newBets) => {
      setBets(newBets)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user?.uid])

  const handleUpdateBetResult = useCallback(async (betId: string, result: FirebaseBet['result']) => {
    const prev = bets.find(b => b.id === betId)
    if (!prev) return

    // optimistic UI
    startTransition(() => {
      setBets((prev) => {
        const next = prev.slice()
        let idx = -1
        for (let i = 0; i < next.length; i++) {
          if (next[i].id === betId) { idx = i; break }
        }
        if (idx !== -1) {
          const b = next[idx]
          let payout: number | undefined
          if (result === 'won') payout = b.stake * b.odds
          else if (result === 'lost') payout = 0
          else if (result === 'void') payout = b.stake
          else payout = undefined
          next[idx] = { ...b, result, payout }
        }
        return next
      })
    })

    try {
      const updateData: BetUpdate = { result }
      if (result === 'won') updateData.payout = prev.stake * prev.odds
      else if (result === 'lost') updateData.payout = 0
      else if (result === 'void') updateData.payout = prev.stake
      else if (result === 'pending') updateData.payout = deleteField()

      await updateBet(betId, updateData)

      const messages = {
        won: 'Bet markerat som vunnet! 🎉',
        lost: 'Bet markerat som förlorat 😞',
        void: 'Bet markerat som avbrutet',
        pending: 'Bet markerat som pågående'
      }
      toast.success(messages[result])
    } catch (error) {
      // rollback
      setBets((list) => {
        const out: FirebaseBet[] = []
        for (const b of list) {
          out.push(prev && b.id === betId ? prev : b)
        }
        return out
      })
      console.error('Error updating bet:', error)
      toast.error('Kunde inte uppdatera bet')
    }
  }, [bets])

  const handleDeleteBet = useCallback(async (betId: string) => {
    try {
      await deleteBet(betId)
      toast.success('Bet borttagen')
    } catch (error) {
      console.error('Error deleting bet:', error)
      toast.error('Kunde inte ta bort bet')
    }
  }, [])

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

  return (
    <div className="space-y-6">
      {/* Backup Reminder */}
      <BackupReminder />
      
      {/* Bet365 CSV Import */}
      <Bet365Import />
      
      {/* CSV Instructions */}
      <CSVInstructions />

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
          <CardTitle className="text-base sm:text-lg">Dina Bets ({bets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <PaginatedBetsList 
            bets={bets}
            onUpdateResult={handleUpdateBetResult}
            onDelete={(id) => setDeleteTarget(id)}
          />
        </CardContent>
      </Card>

      {/* Confirm Delete */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await handleDeleteBet(deleteTarget)
            setDeleteTarget(null)
          }
        }}
        title="Ta bort bet"
        description="Är du säker på att du vill ta bort denna bet? Detta går inte att ångra."
        confirmLabel="Ta bort"
      />
    </div>
  )
}
