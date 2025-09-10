import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateBet } from '@/lib/firestore'
import type { FirebaseBet } from '@/types/Firebase'
import { toast } from 'sonner'

const editBetSchema = z.object({
  event: z.string().min(1, 'Event krävs'),
  market: z.string().min(1, 'Market krävs'),
  stake: z.number().min(0.01, 'Insats måste vara positiv'),
  odds: z.number().min(1.01, 'Odds måste vara minst 1.01'),
  bookmaker: z.string().min(1, 'Bookmaker krävs'),
  result: z.enum(['pending', 'won', 'lost', 'void']),
  payout: z.number().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

type EditBetForm = z.infer<typeof editBetSchema>

interface EditBetDialogProps {
  readonly bet: FirebaseBet
}

export function EditBetDialog({ bet }: EditBetDialogProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const form = useForm<EditBetForm>({
    resolver: zodResolver(editBetSchema),
    defaultValues: {
      event: bet.event,
      market: bet.market,
      stake: bet.stake,
      odds: bet.odds,
      bookmaker: bet.bookmaker,
      result: bet.result,
      payout: bet.payout || undefined,
      notes: bet.notes || '',
      tags: bet.tags?.join(', ') || '',
    },
  })

  const onSubmit = async (data: EditBetForm) => {
    if (!bet.id) return

    setSaving(true)
    try {
      const updateData: Partial<FirebaseBet> = {
        event: data.event,
        market: data.market,
        stake: data.stake,
        odds: data.odds,
        bookmaker: data.bookmaker,
        result: data.result,
        notes: data.notes || '',
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      }

      // Add payout if result is won or void
      if (data.result === 'won' && data.payout) {
        updateData.payout = data.payout
      } else if (data.result === 'lost') {
        updateData.payout = 0
      } else if (data.result === 'void') {
        updateData.payout = data.stake // Return stake for void bets
      } else if (data.result === 'pending') {
        updateData.payout = undefined
      }

      await updateBet(bet.id, updateData)
      toast.success('Bet uppdaterat!')
      setOpen(false)
    } catch (error) {
      console.error('Error updating bet:', error)
      toast.error('Kunde inte uppdatera bet')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Redigera Bet</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="event">Event</Label>
            <Input
              id="event"
              {...form.register('event')}
              placeholder="t.ex. Arsenal vs Chelsea"
            />
            {form.formState.errors.event && (
              <p className="text-sm text-red-500">{form.formState.errors.event.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="market">Market</Label>
            <Input
              id="market"
              {...form.register('market')}
              placeholder="t.ex. 1X2, Over/Under"
            />
            {form.formState.errors.market && (
              <p className="text-sm text-red-500">{form.formState.errors.market.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stake">Insats ({bet.currency})</Label>
              <Input
                id="stake"
                type="number"
                step="0.01"
                {...form.register('stake', { valueAsNumber: true })}
              />
              {form.formState.errors.stake && (
                <p className="text-sm text-red-500">{form.formState.errors.stake.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="odds">Odds</Label>
              <Input
                id="odds"
                type="number"
                step="0.01"
                {...form.register('odds', { valueAsNumber: true })}
              />
              {form.formState.errors.odds && (
                <p className="text-sm text-red-500">{form.formState.errors.odds.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bookmaker">Bookmaker</Label>
            <Input
              id="bookmaker"
              {...form.register('bookmaker')}
              placeholder="t.ex. Bet365, Betsson"
            />
            {form.formState.errors.bookmaker && (
              <p className="text-sm text-red-500">{form.formState.errors.bookmaker.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="result">Resultat</Label>
              <Select
                value={form.watch('result')}
                onValueChange={(value) => form.setValue('result', value as 'pending' | 'won' | 'lost' | 'void')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(form.watch('result') === 'won' || form.watch('result') === 'void') && (
              <div>
                <Label htmlFor="payout">Utbetalning ({bet.currency})</Label>
                <Input
                  id="payout"
                  type="number"
                  step="0.01"
                  {...form.register('payout', { valueAsNumber: true })}
                  placeholder={form.watch('result') === 'void' ? bet.stake.toString() : ''}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="tags">Taggar (kommaseparerade)</Label>
            <Input
              id="tags"
              {...form.register('tags')}
              placeholder="t.ex. Premier League, Favorit"
            />
          </div>

          <div>
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Eventuella anteckningar..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Sparar...' : 'Spara'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
