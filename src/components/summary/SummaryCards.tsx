import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'

interface Summary {
  totalStake: number
  totalReturn: number
  net: number
  roi: number
  count: number
  winRate: number
  avgOdds: number
}

interface SummaryCardsProps {
  summary: Summary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Insats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalStake)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Netto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.net)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ROI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.roi.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Träffprocent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.winRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {summary.count} bets, ∅ odds {summary.avgOdds.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
