import { useState } from 'react'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { Edit2, Trash2, Download, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency } from '@/lib/format'
import { profitForBet } from '@/lib/calc'
import { exportToCSV } from '@/lib/csv'
import type { Bet, BetResult } from '@/types/Bet'

interface BetsTableProps {
  bets: Bet[]
}

export function BetsTable({ bets }: BetsTableProps) {
  const { users, setFilters, filters, deleteBet } = useAppStore()
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

  const handleExport = () => {
    exportToCSV(bets, users)
  }

  const getResultBadge = (result: Bet['result']) => {
    const variants = {
      pending: 'default',
      won: 'default',
      lost: 'destructive',
      void: 'secondary',
    } as const

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      void: 'bg-gray-100 text-gray-800',
    }

    return (
      <Badge variant={variants[result]} className={colors[result]}>
        {result.toUpperCase()}
      </Badge>
    )
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
                  <TableRow key={bet.id}>
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
                      {getResultBadge(bet.result)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {formatCurrency(profit)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
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
