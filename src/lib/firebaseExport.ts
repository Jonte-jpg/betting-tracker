import { format } from 'date-fns'
import type { FirebaseBet } from '@/types/Firebase'

export function exportFirebaseBetsAsJSON(bets: FirebaseBet[], userEmail: string): void {
  const exportData = {
    user: userEmail,
    bets: bets,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }

  const jsonString = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `firebase-bets-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  // Save backup date to localStorage
  localStorage.setItem('lastBackupDate', new Date().toISOString())
}

export function exportFirebaseBetsAsCSV(bets: FirebaseBet[]): void {
  const headers = [
    'Datum',
    'Event', 
    'Marknad',
    'Insats',
    'Odds',
    'Bookmaker',
    'Resultat',
    'Utbetalning',
    'Vinst/Förlust',
    'Valuta',
    'Anteckningar',
    'Taggar'
  ]

  const csvRows = bets.map(bet => {
    let profit = 0
    if (bet.result === 'won') {
      profit = (bet.payout || 0) - bet.stake
    } else if (bet.result === 'lost') {
      profit = -bet.stake
    }
    // void and pending bets have 0 profit (default value)

    return [
      format(new Date(bet.createdAt), 'yyyy-MM-dd HH:mm'),
      bet.event,
      bet.market,
      bet.stake,
      bet.odds,
      bet.bookmaker,
      bet.result,
      bet.payout || '',
      profit,
      bet.currency,
      bet.notes || '',
      bet.tags?.join(', ') || ''
    ]
  })

  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => 
      row.map(field => 
        typeof field === 'string' && field.includes(',') 
          ? `"${field.replace(/"/g, '""')}"` 
          : field
      ).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `firebase-bets-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  // Save backup date to localStorage
  localStorage.setItem('lastBackupDate', new Date().toISOString())
}
