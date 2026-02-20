"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { COLORES_SEMAFORO, LABELS_SEMAFORO } from "@/lib/types"
import { Semaforo } from "@/lib/enums"

type Props = {
  data: {
    semaforo: Semaforo
    total: number
  }[]
}

export default function GraficaSemaforos({ data }: Props) {
  const formatted = data.map((d) => ({
    name: LABELS_SEMAFORO[d.semaforo],
    value: d.total,
    color: COLORES_SEMAFORO[d.semaforo],
  }))

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        Distribucion por Semaforo
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={formatted}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {formatted.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
