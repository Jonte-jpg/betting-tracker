import type { Bet } from '../types/Bet'
import type { User } from '../types/User'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { profitForBet } from './calc'

export function exportToCSV(bets: Bet[], users: User[]): void {
  const headers = [
    'Datum',
    'Användare', 
    'Event',
    'Insats (SEK)',
    'Odds',
    'Resultat',
    'Vinst/Förlust (SEK)',
    'Skapad'
  ]

  const rows = bets.map(bet => {
    const user = users.find(u => u.id === bet.userId)
    const profit = profitForBet(bet)
    
    return [
      format(new Date(bet.date), 'yyyy-MM-dd HH:mm', { locale: sv }),
      user?.name || 'Okänd',
      `"${bet.event.replace(/"/g, '""')}"`,
      bet.stake.toString(),
      bet.odds.toString(),
      bet.result.toUpperCase(),
      profit.toString(),
      format(new Date(bet.createdAt), 'yyyy-MM-dd HH:mm', { locale: sv })
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `betting-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function betsToCSV(bets: Bet[]): string {
  const headers = ['id', 'userId', 'date', 'event', 'stake', 'odds', 'result', 'createdAt']
  const rows = bets.map((b) => [
    b.id,
    b.userId,
    b.date,
    b.event.replace(/"/g, '""'),
    String(b.stake),
    String(b.odds),
    b.result,
    b.createdAt
  ])
  const csv =
    [headers.join(',')]
      .concat(
        rows.map(
          (r) =>
            `${r[0]},${r[1]},"${r[2]}","${r[3]}",${r[4]},${r[5]},${r[6]},"${r[7]}"`
        )
      )
      .join('\n') + '\n'
  return csv
}

export function download(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsText(file, 'utf-8')
  })
}