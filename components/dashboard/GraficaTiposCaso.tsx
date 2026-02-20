"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { LABELS_TIPO_CASO } from "@/lib/types"
import { TipoCaso } from "@/lib/enums"

type Props = {
  data: {
    tipoCaso: TipoCaso
    total: number
  }[]
}

export default function GraficaTiposCaso({ data }: Props) {
  const formatted = data.map((d) => ({
    name: LABELS_TIPO_CASO[d.tipoCaso],
    total: d.total,
  }))

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        Distribucion por Tipo de Caso
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            angle={-30}
            textAnchor="end"
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
