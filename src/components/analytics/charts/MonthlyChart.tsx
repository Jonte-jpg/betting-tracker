import React from 'react'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'

interface MonthlyDatum { month: string; profit: number }
interface Props { data: MonthlyDatum[] }

export default function MonthlyChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tickFormatter={(v: string) => format(new Date(v + '-01'), 'MMM yyyy', { locale: sv })} />
        <YAxis tickFormatter={(v: number) => new Intl.NumberFormat('sv-SE',{style:'currency',currency:'SEK'}).format(v)} />
        <Tooltip
          labelFormatter={(v: string) => format(new Date(v + '-01'), 'MMMM yyyy', { locale: sv })}
          formatter={(v: number) => [new Intl.NumberFormat('sv-SE',{style:'currency',currency:'SEK'}).format(v), 'Vinst']}
        />
        <Bar dataKey="profit" fill="#10b981" name="Vinst" />
      </BarChart>
    </ResponsiveContainer>
  )
}
