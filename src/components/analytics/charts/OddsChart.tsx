import React from 'react'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

interface OddsDatum { range: string; winRate: number }
interface Props { data: OddsDatum[] }

export default function OddsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Träffsäkerhet']} />
        <Bar dataKey="winRate" fill="#a78bfa" />
      </BarChart>
    </ResponsiveContainer>
  )
}
