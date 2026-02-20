"use client"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { MockTamizaje } from "@/lib/data/mock"

type Props = { tamizaje: MockTamizaje }

export default function GraficaRadar({ tamizaje: t }: Props) {
  const data = [
    { escala: "Depresion",     valor: t.dep_t },
    { escala: "Ansiedad",      valor: t.ans_t },
    { escala: "Somatizacion",  valor: t.som_t },
    { escala: "Esquizotipia",  valor: t.esq_t },
    { escala: "Ira",           valor: t.ira_t },
    { escala: "Agresion",      valor: t.agr_t },
    { escala: "Familia",       valor: t.fam_t },
    { escala: "Contexto",      valor: t.com_t },
    { escala: "Autoestima",    valor: t.aut_t },
    { escala: "Social",        valor: t.soc_t },
  ]

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Perfil de escalas clinicas (puntuacion T)
      </h2>
      {/* Leyenda de referencia */}
      <div className="flex gap-4 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-gray-300 inline-block" /> Normal: 40–59
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-orange-400 inline-block" /> Elevado: 60–69
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-red-500 inline-block" /> Muy elevado: ≥70
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey="escala" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 110]}
            tick={{ fontSize: 9 }}
            tickCount={4}
          />
          <Radar
            name="Puntuacion T"
            dataKey="valor"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Tooltip
            formatter={(value) => [`T = ${value ?? "—"}`, "Puntuacion"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
