import { useState } from 'react'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Trash2, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { EditLocalBetDialog } from '@/components/bets/EditLocalBetDialog'
import { formatCurrency } from '@/lib/format'
import { profitForBet } from '@/lib/calc'
import { exportToCSV } from '@/lib/csv'
import type { Bet, BetResult } from '@/types/Bet'

interface BetsTableProps {
  readonly bets: Bet[]
}

export function BetsTable({ bets }: BetsTableProps) {
  const { users, setFilters, filters, deleteBet, updateBet } = useAppStore()
  const [sortField, setSortField] = useState<keyof Bet>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sortedBets = [...bets].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    const multiplier = sortDirection === 'asc' ? 1 : -1
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * multiplier
    }
    return 0
  })

  const handleSort = (field: keyof Bet) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleUpdateBetResult = (betId: string, result: Bet['result']) => {
    updateBet(betId, { result })
  }

  const handleExport = () => {
    exportToCSV(bets, users)
  }

  const getResultBadge = (result: Bet['result']) => {
    const variants = {
      pending: 'outline',
      won: 'default',
      lost: 'destructive',
      void: 'secondary',
    } as const

    const colors = {
      pending: 'bg-blue-100 text-blue-800 border-blue-200',
      won: 'bg-green-100 text-green-800 border-green-200',
      lost: 'bg-red-100 text-red-800 border-red-200',
      void: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    }

    return (
      <Badge variant={variants[result]} className={colors[result]}>
        {result.toUpperCase()}
      </Badge>
    )
  }

  const getProfitColorClass = (profit: number): string => {
    if (profit > 0) return 'text-green-600'
    if (profit < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getRowClasses = (result: Bet['result']) => {
    switch (result) {
      case 'won': 
        return 'bg-green-50 hover:bg-green-100 border-l-4 border-l-green-400 text-black'
      case 'lost': 
        return 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400 text-black'
      case 'void': 
        return 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-400 text-black'
      case 'pending':
      default: 
        return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-400 text-black'
    }
  }

  if (bets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Inga bets att visa</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bets ({bets.length})</span>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportera
            </Button>
          </div>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Sök event..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-48"
          />
          
          <Select
            value={filters.userId || 'all'}
            onValueChange={(value) => {
              const userId = value === 'all' ? undefined : value
              setFilters({ userId })
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Alla användare" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla användare</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.result || 'all'}
            onValueChange={(value) => {
              const result = value === 'all' ? undefined : value as BetResult
              setFilters({ result })
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Alla resultat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla resultat</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="void">Void</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('date')}
                >
                  Datum {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Användare</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('event')}
                >
                  Event {sortField === 'event' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted text-right"
                  onClick={() => handleSort('stake')}
                >
                  Insats {sortField === 'stake' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted text-right"
                  onClick={() => handleSort('odds')}
                >
                  Odds {sortField === 'odds' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Resultat</TableHead>
                <TableHead className="text-right">Vinst/Förlust</TableHead>
                <TableHead>Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBets.map((bet) => {
                const user = users.find(u => u.id === bet.userId)
                const profit = profitForBet(bet)
                
                return (
                  <TableRow key={bet.id} className={getRowClasses(bet.result)}>
                    <TableCell>
                      {format(new Date(bet.date), 'yyyy-MM-dd HH:mm', { locale: sv })}
                    </TableCell>
                    <TableCell>
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: user?.color || '#gray' }}
                      />
                      {user?.name || 'Okänd'}
                    </TableCell>
                    <TableCell className="max-w-48 truncate" title={bet.event}>
                      {bet.event}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(bet.stake)}
                    </TableCell>
                    <TableCell className="text-right">
                      {bet.odds.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {getResultBadge(bet.result)}
                        {bet.result === 'pending' && (
                          <div className="flex flex-wrap gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateBetResult(bet.id, 'won')}
                              className="text-green-600 border-green-600 hover:bg-green-50 text-xs"
                            >
                              Vunnen
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateBetResult(bet.id, 'lost')}
                              className="text-red-600 border-red-600 hover:bg-red-50 text-xs"
                            >
                              Förlorad
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateBetResult(bet.id, 'void')}
                              className="text-xs"
                            >
                              Avbruten
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getProfitColorClass(profit)}`}>
                      {formatCurrency(profit)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <EditLocalBetDialog bet={bet} />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Är du säker på att du vill ta bort detta bet?')) {
                              deleteBet(bet.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
