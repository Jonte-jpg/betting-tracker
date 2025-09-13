import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

interface ResultDatum { name: string; value: number; color: string }
interface Props { data: ResultDatum[] }

export default function ResultsPie({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
          outerRadius={80}
          dataKey="value"
        >
          {data.map(d => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
