import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { EditBetDialog } from './EditBetDialog'
import { formatCurrency } from '@/lib/format'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { FirebaseBet } from '@/types/Firebase'
import type { Currency } from '@/store/useAppStore'

interface PaginatedBetsListProps {
  bets: FirebaseBet[]
  onUpdateResult: (betId: string, result: FirebaseBet['result']) => void
  onDelete: (betId: string) => void
}

const BETS_PER_PAGE = 20

// Helper function to safely convert string to Currency type
const toCurrency = (currency: string): Currency => {
  const validCurrencies: Currency[] = ['SEK', 'USD', 'EUR', 'NOK', 'DKK', 'GBP']
  return validCurrencies.includes(currency as Currency) ? (currency as Currency) : 'SEK'
}

export function PaginatedBetsList({ bets, onUpdateResult, onDelete }: PaginatedBetsListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [resultFilter, setResultFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date-desc')

  // Filter and sort bets
  const filteredAndSortedBets = useMemo(() => {
    let filtered = bets

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((bet) =>
        bet.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.bookmaker.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by result
    if (resultFilter !== 'all') {
      filtered = filtered.filter((bet) => bet.result === resultFilter)
    }

    // Sort bets
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'stake-desc':
          return b.stake - a.stake
        case 'stake-asc':
          return a.stake - b.stake
        case 'odds-desc':
          return b.odds - a.odds
        case 'odds-asc':
          return a.odds - b.odds
        default:
          return 0
      }
    })
  }, [bets, searchTerm, resultFilter, sortBy])

  // Paginate filtered bets
  const paginatedBets = useMemo(() => {
    const startIndex = (currentPage - 1) * BETS_PER_PAGE
    return filteredAndSortedBets.slice(startIndex, startIndex + BETS_PER_PAGE)
  }, [filteredAndSortedBets, currentPage])

  const totalPages = Math.ceil(filteredAndSortedBets.length / BETS_PER_PAGE)
  const startResult = ((currentPage - 1) * BETS_PER_PAGE) + 1
  const endResult = Math.min(currentPage * BETS_PER_PAGE, filteredAndSortedBets.length)

  // Reset page when filters change
  const handleFilterChange = (newSearchTerm?: string, newResultFilter?: string, newSortBy?: string) => {
    setCurrentPage(1)
    if (newSearchTerm !== undefined) setSearchTerm(newSearchTerm)
    if (newResultFilter !== undefined) setResultFilter(newResultFilter)
    if (newSortBy !== undefined) setSortBy(newSortBy)
  }

  const getBetCardClasses = (result: FirebaseBet['result']) => {
    const baseClasses = 'border-2 rounded-lg p-4 space-y-3 transition-colors text-black'
    switch (result) {
      case 'won': 
        return `${baseClasses} !border-green-400 !bg-green-50 hover:!bg-green-100`
      case 'lost': 
        return `${baseClasses} !border-red-400 !bg-red-50 hover:!bg-red-100`
      case 'void': 
        return `${baseClasses} !border-yellow-400 !bg-yellow-50 hover:!bg-yellow-100`
      case 'pending':
      default: 
        return `${baseClasses} !border-blue-400 !bg-blue-50 hover:!bg-blue-100`
    }
  }

  const getResultVariant = (result: FirebaseBet['result']) => {
    switch (result) {
      case 'won': return 'default'
      case 'lost': return 'destructive' 
      case 'void': return 'secondary'
      default: return 'outline'
    }
  }

  const getResultBadgeClasses = (result: FirebaseBet['result']) => {
    switch (result) {
      case 'won': 
        return 'bg-green-100 text-green-800 border-green-300 font-medium'
      case 'lost': 
        return 'bg-red-100 text-red-800 border-red-300 font-medium'
      case 'void': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 font-medium'
      case 'pending':
      default: 
        return 'bg-blue-100 text-blue-800 border-blue-300 font-medium'
    }
  }

  const getResultColor = (result: FirebaseBet['result']) => {
    switch (result) {
      case 'won': return 'text-green-600'
      case 'lost': return 'text-red-600'
      case 'void': return 'text-gray-600'
      default: return 'text-yellow-600'
    }
  }

  const getPayoutLabel = (result: FirebaseBet['result']) => {
    switch (result) {
      case 'won': return 'Total utbetalning:'
      case 'void': return 'Återbetalning:'
      case 'lost': return 'Förlust:'
      default: return 'Faktisk utbetalning:'
    }
  }

  if (bets.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Inga bets ännu. Lägg till din första bet!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Sök event, marknad eller bookmaker..."
          value={searchTerm}
          onChange={(e) => handleFilterChange(e.target.value, undefined, undefined)}
          className="col-span-1 md:col-span-2"
        />
        
        <Select 
          value={resultFilter} 
          onValueChange={(value) => handleFilterChange(undefined, value, undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrera resultat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla resultat</SelectItem>
            <SelectItem value="pending">Pågående</SelectItem>
            <SelectItem value="won">Vunna</SelectItem>
            <SelectItem value="lost">Förlorade</SelectItem>
            <SelectItem value="void">Avbrutna</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={sortBy} 
          onValueChange={(value) => handleFilterChange(undefined, undefined, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sortera" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Nyaste först</SelectItem>
            <SelectItem value="date-asc">Äldste först</SelectItem>
            <SelectItem value="stake-desc">Högsta insats först</SelectItem>
            <SelectItem value="stake-asc">Lägsta insats först</SelectItem>
            <SelectItem value="odds-desc">Högsta odds först</SelectItem>
            <SelectItem value="odds-asc">Lägsta odds först</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results summary */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <p>
          Visar {startResult}-{endResult} av {filteredAndSortedBets.length} bets
          {filteredAndSortedBets.length !== bets.length && (
            <span className="text-blue-600"> (filtrerat från {bets.length} totalt)</span>
          )}
        </p>
        
        {totalPages > 1 && (
          <p>Sida {currentPage} av {totalPages}</p>
        )}
      </div>

      {/* Bets List */}
      <div className="space-y-4">
        {paginatedBets.map((bet) => {
          const cardClasses = getBetCardClasses(bet.result)
          return (
            <div key={bet.id} className={cardClasses}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium text-black">{bet.event}</h3>
                  <p className="text-sm text-gray-700">{bet.market}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-800">{bet.bookmaker}</span>
                    <Badge variant="outline" className="text-black border-gray-400">
                      {bet.currency}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getResultVariant(bet.result)} className={getResultBadgeClasses(bet.result)}>
                    {(() => {
                      if (bet.result === 'pending') return 'Pågående'
                      if (bet.result === 'won') return 'Vunnen'
                      if (bet.result === 'lost') return 'Förlorad'
                      return 'Avbruten'
                    })()}
                  </Badge>
                  <div className="flex gap-1">
                    <EditBetDialog bet={bet} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(bet.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Insats:</span>
                  <div className="font-medium text-black">
                    {formatCurrency(bet.stake, toCurrency(bet.currency))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Odds:</span>
                  <div className="font-medium text-black">{bet.odds.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Potentiell vinst:</span>
                  <div className="font-medium text-green-600">
                    {formatCurrency(bet.stake * (bet.odds - 1), toCurrency(bet.currency))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">
                    {getPayoutLabel(bet.result)}
                  </span>
                  <div className={`font-medium ${getResultColor(bet.result)}`}>
                    {bet.payout !== undefined ? formatCurrency(bet.payout, toCurrency(bet.currency)) : '-'}
                  </div>
                </div>
              </div>

              {bet.tags && bet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bet.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {bet.notes && (
                <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                  {bet.notes}
                </p>
              )}

              {bet.result === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateResult(bet.id!, 'won')}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    Markera som vunnen
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateResult(bet.id!, 'lost')}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Markera som förlorad
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateResult(bet.id!, 'void')}
                  >
                    Markera som avbruten
                  </Button>
                </div>
              )}

              <div className="text-xs text-gray-600">
                {format(new Date(bet.createdAt), 'PPp', { locale: sv })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              Första
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Föregående
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Sida</span>
            <Select
              value={currentPage.toString()}
              onValueChange={(value) => setCurrentPage(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <SelectItem key={page} value={page.toString()}>
                    {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm">av {totalPages}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Nästa
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Sista
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
