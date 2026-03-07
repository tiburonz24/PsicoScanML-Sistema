"use client"

import { useState, useTransition } from "react"
import { actualizarNivelRiesgo } from "@/lib/actions/canalizacion"

type Props = {
  estudianteId: string
  nivelRiesgo:  number | null
}

const NIVELES = [
  { min: 1, max: 5,  label: "Bajo / Preventivo",    color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", desc: "Orientación breve si es necesario. Sin intervención inmediata." },
  { min: 6, max: 8,  label: "Medio / Prioritario",   color: "#92400e", bg: "#fffbeb", border: "#fde68a", desc: "Entrevista rápida, contacto con padres, posible canalización." },
  { min: 9, max: 10, label: "Alto / Emergente",       color: "#991b1b", bg: "#fef2f2", border: "#fecaca", desc: "Canalización prioritaria. Si hay ideación suicida: urgencias." },
]

function getNivel(n: number | null) {
  if (!n) return null
  return NIVELES.find(l => n >= l.min && n <= l.max) ?? null
}

export default function NivelRiesgoCard({ estudianteId, nivelRiesgo }: Props) {
  const [valor, setValor]     = useState<number | null>(nivelRiesgo)
  const [editando, setEditando] = useState(false)
  const [draft, setDraft]     = useState<number>(nivelRiesgo ?? 5)
  const [isPending, start]    = useTransition()

  const nivel = getNivel(valor)

  function guardar() {
    start(async () => {
      await actualizarNivelRiesgo(estudianteId, draft)
      setValor(draft)
      setEditando(false)
    })
  }

  function limpiar() {
    start(async () => {
      await actualizarNivelRiesgo(estudianteId, null)
      setValor(null)
      setEditando(false)
    })
  }

  return (
    <div style={{
      background: nivel ? nivel.bg : "#f8fafc",
      border: `1.5px solid ${nivel ? nivel.border : "#e2e8f0"}`,
      borderRadius: 12, padding: "16px 20px",
      transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            {/* Indicador numérico */}
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: nivel ? nivel.color : "#e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: "white",
            }}>
              {valor ?? "—"}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: nivel ? nivel.color : "#94a3b8", margin: 0 }}>
                {nivel ? nivel.label : "Sin valorar"}
              </p>
              {nivel && (
                <p style={{ fontSize: 11, color: nivel.color, margin: "2px 0 0", opacity: 0.8 }}>
                  {nivel.desc}
                </p>
              )}
            </div>
          </div>

          {/* Escala visual */}
          {editando ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="range" min={1} max={10} value={draft}
                  onChange={e => setDraft(Number(e.target.value))}
                  style={{ flex: 1, accentColor: getNivel(draft)?.color ?? "#6366f1" }}
                />
                <span style={{
                  fontSize: 18, fontWeight: 800, minWidth: 28, textAlign: "center",
                  color: getNivel(draft)?.color ?? "#64748b",
                }}>
                  {draft}
                </span>
              </div>
              {/* Etiquetas del rango */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {NIVELES.map(n => (
                  <span key={n.min} style={{
                    fontSize: 10, color: n.color, fontWeight: 600,
                    background: n.bg, border: `1px solid ${n.border}`,
                    borderRadius: 4, padding: "1px 6px",
                  }}>
                    {n.min}–{n.max} {n.label.split(" / ")[0]}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={guardar} disabled={isPending} style={{
                  background: "#4f46e5", color: "white", border: "none",
                  borderRadius: 6, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  {isPending ? "Guardando…" : "Guardar"}
                </button>
                {valor && (
                  <button onClick={limpiar} disabled={isPending} style={{
                    background: "none", color: "#dc2626", border: "1px solid #fecaca",
                    borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>
                    Quitar valoración
                  </button>
                )}
                <button onClick={() => setEditando(false)} style={{
                  background: "none", color: "#64748b", border: "1px solid #e2e8f0",
                  borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* Barra fija de referencia */
            <div style={{ display: "flex", gap: 2, marginTop: 10 }}>
              {Array.from({ length: 10 }, (_, i) => {
                const n = i + 1
                const activo = valor !== null && n <= valor
                const niv = getNivel(n)
                return (
                  <div key={n} style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: activo ? (niv?.color ?? "#6366f1") : "#e2e8f0",
                    transition: "background 0.2s",
                  }} />
                )
              })}
            </div>
          )}
        </div>

        {!editando && (
          <button
            onClick={() => { setDraft(valor ?? 5); setEditando(true) }}
            style={{
              background: "none", border: "1px solid #e2e8f0",
              borderRadius: 6, padding: "5px 12px",
              fontSize: 11, fontWeight: 600, color: "#64748b",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            {valor ? "Editar" : "Valorar"}
          </button>
        )}
      </div>
    </div>
  )
}
