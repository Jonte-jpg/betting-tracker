import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/store/useAppStore'
import { format } from 'date-fns'

const betSchema = z.object({
  date: z.string().min(1, 'Datum krävs'),
  event: z.string().min(1, 'Event krävs'),
  stake: z.number().min(0.01, 'Insats måste vara större än 0'),
  odds: z.number().min(1.01, 'Odds måste vara minst 1.01'),
  result: z.enum(['pending', 'won', 'lost', 'void']),
  userId: z.string().min(1, 'Användare krävs'),
})

type BetFormData = z.infer<typeof betSchema>

export function AddBetForm() {
  const { users, addBet } = useAppStore()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BetFormData>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      result: 'pending',
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  })

  const watchedStake = watch('stake')
  const watchedOdds = watch('odds')
  
  const potentialReturn = watchedStake && watchedOdds ? watchedStake * watchedOdds : 0
  const potentialProfit = watchedStake && watchedOdds ? watchedStake * (watchedOdds - 1) : 0

  const onSubmit = (data: BetFormData) => {
    const bet = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    }
    
    addBet(bet)
    reset({
      result: 'pending',
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    })
    toast.success('Bet tillagt!')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lägg till nytt bet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Datum
            </label>
            <Input
              id="date"
              type="datetime-local"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="event" className="block text-sm font-medium mb-1">
              Event
            </label>
            <Input
              id="event"
              placeholder="t.ex. Chelsea vs Arsenal"
              {...register('event')}
            />
            {errors.event && (
              <p className="text-sm text-red-600 mt-1">{errors.event.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stake" className="block text-sm font-medium mb-1">
                Insats (SEK)
              </label>
              <Input
                id="stake"
                type="number"
                step="0.01"
                placeholder="100"
                {...register('stake', { valueAsNumber: true })}
              />
              {errors.stake && (
                <p className="text-sm text-red-600 mt-1">{errors.stake.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="odds" className="block text-sm font-medium mb-1">
                Odds
              </label>
              <Input
                id="odds"
                type="number"
                step="0.01"
                placeholder="2.50"
                {...register('odds', { valueAsNumber: true })}
              />
              {errors.odds && (
                <p className="text-sm text-red-600 mt-1">{errors.odds.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="result" className="block text-sm font-medium mb-1">
                Resultat
              </label>
              <Select onValueChange={(value) => setValue('result', value as 'pending' | 'won' | 'lost' | 'void')}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj resultat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
              {errors.result && (
                <p className="text-sm text-red-600 mt-1">{errors.result.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="userId" className="block text-sm font-medium mb-1">
                Användare
              </label>
              <Select onValueChange={(value) => setValue('userId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj användare" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-sm text-red-600 mt-1">{errors.userId.message}</p>
              )}
            </div>
          </div>

          {potentialReturn > 0 && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                Potentiell återbäring: <span className="font-medium">{potentialReturn.toFixed(2)} SEK</span>
              </p>
              <p className="text-sm text-gray-600">
                Potentiell vinst: <span className="font-medium">{potentialProfit.toFixed(2)} SEK</span>
              </p>
            </div>
          )}

          <Button type="submit" className="w-full">
            Lägg till bet
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
