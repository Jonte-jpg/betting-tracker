import { useMemo } from 'react'
import { Trophy, Medal, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency } from '@/lib/format'
import { leaderboard } from '@/lib/calc'

export function Leaderboard() {
  const { users, bets } = useAppStore()
  
  const leaderboardData = useMemo(() => {
    return leaderboard(users, bets)
  }, [users, bets])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number, isProvisional: boolean) => {
    if (isProvisional) {
      return <Badge variant="secondary">Provisorisk</Badge>
    }
    
    if (rank <= 3) {
      return <Badge variant="default">#{rank}</Badge>
    }
    
    return <Badge variant="outline">#{rank}</Badge>
  }

  if (leaderboardData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Inga användare att visa</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Minst 5 bets krävs för officiell ranking
        </p>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Användare</TableHead>
              <TableHead className="text-right">Antal Bets</TableHead>
              <TableHead className="text-right">Total Insats</TableHead>
              <TableHead className="text-right">Netto</TableHead>
              <TableHead className="text-right">ROI</TableHead>
              <TableHead className="text-right">Träffprocent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((entry) => (
              <TableRow key={entry.user.id} className={entry.rank <= 3 ? 'bg-muted/50' : ''}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                    {getRankBadge(entry.rank, entry.isProvisional)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span 
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.user.color || '#gray' }}
                    />
                    <span className="font-medium">{entry.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {entry.count}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(entry.totalStake)}
                </TableCell>
                <TableCell className={`text-right font-medium ${
                  entry.net >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(entry.net)}
                </TableCell>
                <TableCell className={`text-right font-bold ${
                  entry.roi >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {entry.roi.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {entry.winRate.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
