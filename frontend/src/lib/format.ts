import { format as dfFormat } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { Currency } from '@/store/useAppStore'

export function formatCurrency(amount: number, currency: Currency = 'SEK'): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatNumber(n: number, digits = 2): string {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: digits }).format(n)
}

export function formatDate(iso: string): string {
  try {
    return dfFormat(new Date(iso), 'yyyy-MM-dd HH:mm', { locale: sv })
  } catch {
    return iso
  }
}