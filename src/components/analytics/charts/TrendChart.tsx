import React from 'react'
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { format } from 'date-fns'

interface TrendDatum { date: string; cumulative: number }
interface Props { data: TrendDatum[] }

export default function TrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={(v: string) => format(new Date(v), 'MM/dd')} />
        <YAxis tickFormatter={(v: number) => new Intl.NumberFormat('sv-SE',{style:'currency',currency:'SEK'}).format(v)} />
        <Tooltip
          labelFormatter={(v: string) => format(new Date(v), 'yyyy-MM-dd')}
          formatter={(v: number) => [new Intl.NumberFormat('sv-SE',{style:'currency',currency:'SEK'}).format(v), 'Kumulativ vinst']}
        />
        <Area type="monotone" dataKey="cumulative" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.25} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
