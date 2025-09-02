"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { Card } from "@/components/ui/card"

export function ApyComparisonChart({ oldApy, newApy }: { oldApy: number; newApy: number }) {
  const data = [
    { name: "Old", apy: +(oldApy * 100).toFixed(2) },
    { name: "New", apy: +(newApy * 100).toFixed(2) },
  ]
  return (
    <Card className="p-3">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis unit="%" />
            <Tooltip />
            <Bar dataKey="apy" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
