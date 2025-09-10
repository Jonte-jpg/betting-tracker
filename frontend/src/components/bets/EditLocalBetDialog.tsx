import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '@/store/useAppStore'
import type { Bet } from '@/types/Bet'
import { toast } from 'sonner'

const editBetSchema = z.object({
  event: z.string().min(1, 'Event krävs'),
  stake: z.number().min(0.01, 'Insats måste vara positiv'),
  odds: z.number().min(1.01, 'Odds måste vara minst 1.01'),
  result: z.enum(['pending', 'won', 'lost', 'void']),
  userId: z.string().min(1, 'Användare krävs'),
})

type EditBetForm = z.infer<typeof editBetSchema>

interface EditLocalBetDialogProps {
  readonly bet: Bet
}

export function EditLocalBetDialog({ bet }: EditLocalBetDialogProps) {
  const [open, setOpen] = useState(false)
  const { updateBet, users } = useAppStore()

  const form = useForm<EditBetForm>({
    resolver: zodResolver(editBetSchema),
    defaultValues: {
      event: bet.event,
      stake: bet.stake,
      odds: bet.odds,
      result: bet.result,
      userId: bet.userId,
    },
  })

  const onSubmit = async (data: EditBetForm) => {
    try {
      updateBet(bet.id, {
        event: data.event,
        stake: data.stake,
        odds: data.odds,
        result: data.result,
        userId: data.userId,
      })
      toast.success('Bet uppdaterat!')
      setOpen(false)
    } catch (error) {
      console.error('Error updating bet:', error)
      toast.error('Kunde inte uppdatera bet')
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
            <Label htmlFor="userId">Användare</Label>
            <Select
              value={form.watch('userId')}
              onValueChange={(value) => form.setValue('userId', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.userId && (
              <p className="text-sm text-red-500">{form.formState.errors.userId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stake">Insats (SEK)</Label>
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit">
              Spara
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
