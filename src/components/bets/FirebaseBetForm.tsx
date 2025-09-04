import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { addBet } from '@/lib/firestore'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'

const CURRENCIES = ['SEK', 'USD', 'EUR', 'NOK', 'DKK', 'GBP'] as const
const BOOKMAKERS = [
  'Betsson', 'Bet365', 'Unibet', 'Svenska Spel', 'LeoVegas', 
  'Mr Green', 'Bwin', 'ComeOn', 'Betfair', 'Pinnacle', 'Coolbet'
] as const

const betSchema = z.object({
  event: z.string().min(1, 'Event krävs'),
  market: z.string().min(1, 'Marknad krävs'),
  stake: z.number().min(0.01, 'Insats måste vara större än 0'),
  odds: z.number().min(1.01, 'Odds måste vara minst 1.01'),
  bookmaker: z.string().min(1, 'Bookmaker krävs'),
  result: z.enum(['pending', 'won', 'lost', 'void']),
  notes: z.string().optional(),
  currency: z.enum(CURRENCIES)
})

type BetFormData = z.infer<typeof betSchema>

export function FirebaseBetForm() {
  const { user, userProfile } = useAuth()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
      currency: userProfile?.preferences.defaultCurrency as typeof CURRENCIES[number] || 'SEK',
      bookmaker: userProfile?.preferences.defaultBookmaker || ''
    },
  })

  const watchedStake = watch('stake')
  const watchedOdds = watch('odds')
  const watchedResult = watch('result')
  
  const potentialReturn = watchedStake && watchedOdds ? watchedStake * watchedOdds : 0
  const potentialProfit = watchedStake && watchedOdds ? watchedStake * (watchedOdds - 1) : 0
  const actualPayout = watchedResult === 'won' ? potentialReturn : 0

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const onSubmit = async (data: BetFormData) => {
    if (!user) {
      toast.error('Du måste vara inloggad för att lägga till bets')
      return
    }

    setIsSubmitting(true)
    try {
      await addBet({
        ...data,
        userId: user.uid,
        tags,
        payout: data.result === 'won' ? data.stake * data.odds : 0
      })
      
      toast.success('Bet tillagd!')
      reset()
      setTags([])
    } catch (error) {
      console.error('Error adding bet:', error)
      toast.error('Kunde inte lägga till bet')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Logga in för att lägga till bets
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lägg till ny bet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event" className="text-sm font-medium">Event</label>
              <Input
                id="event"
                {...register('event')}
                placeholder="t.ex. Real Madrid vs Barcelona"
              />
              {errors.event && (
                <p className="text-sm text-red-600">{errors.event.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="market" className="text-sm font-medium">Marknad</label>
              <Input
                id="market"
                {...register('market')}
                placeholder="t.ex. 1X2, Over/Under 2.5"
              />
              {errors.market && (
                <p className="text-sm text-red-600">{errors.market.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="stake" className="text-sm font-medium">Insats</label>
              <Input
                id="stake"
                {...register('stake', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="100"
              />
              {errors.stake && (
                <p className="text-sm text-red-600">{errors.stake.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="odds" className="text-sm font-medium">Odds</label>
              <Input
                id="odds"
                {...register('odds', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="2.50"
              />
              {errors.odds && (
                <p className="text-sm text-red-600">{errors.odds.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className="text-sm font-medium">Valuta</label>
              <Select
                value={watch('currency')}
                onValueChange={(value) => setValue('currency', value as typeof CURRENCIES[number])}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bookmaker" className="text-sm font-medium">Bookmaker</label>
              <Select
                value={watch('bookmaker')}
                onValueChange={(value) => setValue('bookmaker', value)}
              >
                <SelectTrigger id="bookmaker">
                  <SelectValue placeholder="Välj bookmaker" />
                </SelectTrigger>
                <SelectContent>
                  {BOOKMAKERS.map((bookmaker) => (
                    <SelectItem key={bookmaker} value={bookmaker}>
                      {bookmaker}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bookmaker && (
                <p className="text-sm text-red-600">{errors.bookmaker.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="result" className="text-sm font-medium">Resultat</label>
              <Select
                value={watch('result')}
                onValueChange={(value) => setValue('result', value as BetFormData['result'])}
              >
                <SelectTrigger id="result">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pågående</SelectItem>
                  <SelectItem value="won">Vunnen</SelectItem>
                  <SelectItem value="lost">Förlorad</SelectItem>
                  <SelectItem value="void">Avbruten</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-medium">Anteckningar</label>
            <Input
              id="notes"
              {...register('notes')}
              placeholder="Fritext om betet..."
            />
          </div>

          <div>
            <label htmlFor="tags" className="text-sm font-medium">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Lägg till tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Betting calculations */}
          {Boolean(watchedStake && watchedOdds) && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Potentiell avkastning:</span>
                <span className="font-medium">
                  {potentialReturn.toFixed(2)} {watch('currency')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Potentiell vinst:</span>
                <span className="font-medium text-green-600">
                  +{potentialProfit.toFixed(2)} {watch('currency')}
                </span>
              </div>
              {watchedResult === 'won' && (
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Faktisk utbetalning:</span>
                  <span className="font-bold text-green-600">
                    {actualPayout.toFixed(2)} {watch('currency')}
                  </span>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Lägger till...' : 'Lägg till bet'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
