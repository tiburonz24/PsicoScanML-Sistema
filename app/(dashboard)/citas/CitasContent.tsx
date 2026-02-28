"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { actualizarEstadoCita } from "@/lib/actions/cita"
import ModalNuevaCita from "@/components/citas/ModalNuevaCita"
import ModalCompletarCita from "@/components/citas/ModalCompletarCita"
import Link from "next/link"

type CitaDto = {
  id:           string
  fecha:        string
  estado:       string
  notas:        string | null
  estudianteId: string
  estudiante:   { id: string; nombre: string }
}

type EstudianteDto = { id: string; nombre: string }

const ESTADO_BADGE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  PENDIENTE:  { bg: "#fffbeb", color: "#92400e", border: "#fde68a", label: "Pendiente"  },
  CONFIRMADA: { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe", label: "Confirmada" },
  COMPLETADA: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "Completada" },
  CANCELADA:  { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", label: "Cancelada"  },
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{
      background: "white", borderRadius: 12,
      border: "1px solid #f1f5f9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      padding: "16px 20px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: color, flexShrink: 0,
      }} />
      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 2px" }}>{count}</p>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </p>
      </div>
    </div>
  )
}

export default function CitasContent({
  citas,
  estudiantes,
}: {
  citas:        CitaDto[]
  estudiantes:  EstudianteDto[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalNueva, setModalNueva] = useState(false)
  const [citaACompletar, setCitaACompletar] = useState<CitaDto | null>(null)

  function handleEstado(citaId: string, estado: "CONFIRMADA" | "CANCELADA") {
    startTransition(async () => {
      await actualizarEstadoCita(citaId, estado)
      router.refresh()
    })
  }

  const hoy = new Date().toDateString()
  const pendientes      = citas.filter((c) => c.estado === "PENDIENTE").length
  const confirmadas     = citas.filter((c) => c.estado === "CONFIRMADA").length
  const completadasHoy  = citas.filter(
    (c) => c.estado === "COMPLETADA" && new Date(c.fecha).toDateString() === hoy
  ).length

  // Ordenar: activas primero (PENDIENTE→CONFIRMADA→COMPLETADA→CANCELADA), luego por fecha
  const prioridad: Record<string, number> = { PENDIENTE: 0, CONFIRMADA: 1, COMPLETADA: 2, CANCELADA: 3 }
  const ordenadas = [...citas].sort((a, b) => {
    const pa = prioridad[a.estado] ?? 4
    const pb = prioridad[b.estado] ?? 4
    if (pa !== pb) return pa - pb
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  })

  return (
    <div style={{ paddingTop: 8, maxWidth: 1000 }}>

      {/* ── Encabezado ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Citas</h1>
        <button
          onClick={() => setModalNueva(true)}
          style={{
            background: "#4f46e5", color: "white", border: "none",
            borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Agendar cita
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Pendientes"      count={pendientes}     color="#f59e0b" />
        <StatCard label="Confirmadas"     count={confirmadas}    color="#3b82f6" />
        <StatCard label="Completadas hoy" count={completadasHoy} color="#22c55e" />
      </div>

      {/* ── Tabla ── */}
      {ordenadas.length === 0 ? (
        <div style={{
          background: "white", borderRadius: 14, padding: 48,
          textAlign: "center", border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <p style={{ color: "#94a3b8", fontWeight: 600, fontSize: 14, margin: 0 }}>
            No hay citas registradas aún.
          </p>
        </div>
      ) : (
        <div style={{
          background: "white", borderRadius: 14,
          border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                {["Estudiante", "Fecha y hora", "Estado", "Notas", "Acciones"].map((h) => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left",
                    fontSize: 11, fontWeight: 700, color: "#94a3b8",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordenadas.map((cita) => {
                const badge = ESTADO_BADGE[cita.estado] ?? ESTADO_BADGE.PENDIENTE
                return (
                  <tr key={cita.id} style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  >
                    {/* Estudiante */}
                    <td style={{ padding: "14px 16px" }}>
                      <Link
                        href={`/expediente/${cita.estudianteId}`}
                        style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5", textDecoration: "none" }}
                      >
                        {cita.estudiante.nombre}
                      </Link>
                    </td>

                    {/* Fecha */}
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>
                      {formatFecha(cita.fecha)}
                    </td>

                    {/* Estado */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                        background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                        whiteSpace: "nowrap",
                      }}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Notas */}
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b", maxWidth: 220 }}>
                      {cita.notas ? (
                        <span style={{
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {cita.notas}
                        </span>
                      ) : (
                        <span style={{ color: "#cbd5e1" }}>—</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      {cita.estado === "PENDIENTE" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleEstado(cita.id, "CONFIRMADA")}
                            disabled={isPending}
                            style={{
                              fontSize: 11, fontWeight: 600, padding: "5px 12px",
                              borderRadius: 6, cursor: "pointer",
                              background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe",
                            }}
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleEstado(cita.id, "CANCELADA")}
                            disabled={isPending}
                            style={{
                              fontSize: 11, fontWeight: 600, padding: "5px 12px",
                              borderRadius: 6, cursor: "pointer",
                              background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3",
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                      {cita.estado === "CONFIRMADA" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => setCitaACompletar(cita)}
                            style={{
                              fontSize: 11, fontWeight: 600, padding: "5px 12px",
                              borderRadius: 6, cursor: "pointer",
                              background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0",
                            }}
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => handleEstado(cita.id, "CANCELADA")}
                            disabled={isPending}
                            style={{
                              fontSize: 11, fontWeight: 600, padding: "5px 12px",
                              borderRadius: 6, cursor: "pointer",
                              background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3",
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modales ── */}
      {modalNueva && (
        <ModalNuevaCita
          estudiantes={estudiantes}
          onClose={() => setModalNueva(false)}
        />
      )}
      {citaACompletar && (
        <ModalCompletarCita
          citaId={citaACompletar.id}
          estudianteId={citaACompletar.estudianteId}
          estudianteNombre={citaACompletar.estudiante.nombre}
          fecha={citaACompletar.fecha}
          onClose={() => setCitaACompletar(null)}
        />
      )}
    </div>
  )
}
