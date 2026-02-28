"use client"

import { useState } from "react"
import ModalNuevaSesion from "@/components/expediente/ModalNuevaSesion"

type SesionDto = {
  id:              string
  fecha:           string
  tipo:            string
  motivo:          string | null
  notas:           string
  acuerdos:        string | null
  planActualizado: string | null
}

const LABELS_TIPO: Record<string, string> = {
  EVALUACION_INICIAL: "Evaluación inicial",
  SEGUIMIENTO:        "Seguimiento",
  INTERVENCION:       "Intervención",
  CRISIS:             "Crisis",
  CIERRE:             "Cierre",
  DEVOLUCION:         "Devolución",
}

const TIPO_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  EVALUACION_INICIAL: { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
  SEGUIMIENTO:        { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  INTERVENCION:       { bg: "#faf5ff", color: "#6b21a8", border: "#e9d5ff" },
  CRISIS:             { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3" },
  CIERRE:             { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
  DEVOLUCION:         { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export default function ExpedienteAcciones({
  estudianteId,
  sesiones,
}: {
  estudianteId: string
  sesiones:     SesionDto[]
}) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div style={{
        background: "white", borderRadius: 14,
        border: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 24px", borderBottom: "1px solid #f1f5f9",
          background: "#fafafa",
        }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
            Sesiones ({sesiones.length})
          </p>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: "#4f46e5", color: "white", border: "none",
              borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <svg width={11} height={11} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva sesión
          </button>
        </div>

        {/* Lista de sesiones */}
        {sesiones.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, margin: 0 }}>
              Sin sesiones registradas. Registra la primera sesión con el botón de arriba.
            </p>
          </div>
        ) : (
          <div style={{ padding: "8px 0" }}>
            {sesiones.map((s, idx) => {
              const tc = TIPO_COLORS[s.tipo] ?? TIPO_COLORS.SEGUIMIENTO
              const isLast = idx === sesiones.length - 1
              return (
                <div
                  key={s.id}
                  style={{
                    padding: "16px 24px",
                    borderBottom: isLast ? "none" : "1px solid #f8fafc",
                    display: "flex", gap: 16,
                  }}
                >
                  {/* Línea de tiempo */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: tc.color, border: `2px solid ${tc.border}`,
                      marginTop: 3,
                    }} />
                    {!isLast && (
                      <div style={{ flex: 1, width: 2, background: "#f1f5f9", minHeight: 24 }} />
                    )}
                  </div>

                  {/* Contenido */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                        {formatFecha(s.fecha)}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                        background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                        textTransform: "uppercase", letterSpacing: "0.04em",
                      }}>
                        {LABELS_TIPO[s.tipo] ?? s.tipo}
                      </span>
                      {s.motivo && (
                        <span style={{ fontSize: 11, color: "#64748b" }}>· {s.motivo}</span>
                      )}
                    </div>

                    <p style={{ fontSize: 13, color: "#374151", margin: "0 0 6px", lineHeight: 1.6 }}>
                      {s.notas}
                    </p>

                    {s.acuerdos && (
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8",
                          textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Acuerdos:
                        </span>
                        <p style={{ fontSize: 12, color: "#475569", margin: "3px 0 0", lineHeight: 1.5 }}>
                          {s.acuerdos}
                        </p>
                      </div>
                    )}

                    {s.planActualizado && (
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8",
                          textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Plan actualizado:
                        </span>
                        <p style={{ fontSize: 12, color: "#475569", margin: "3px 0 0", lineHeight: 1.5 }}>
                          {s.planActualizado}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal nueva sesión */}
      {modalOpen && (
        <ModalNuevaSesion
          estudianteId={estudianteId}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
