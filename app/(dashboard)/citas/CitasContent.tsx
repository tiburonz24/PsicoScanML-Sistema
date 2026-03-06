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

const ESTADO_CAL: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  PENDIENTE:  { bg: "#fef3c7", color: "#92400e", border: "#fcd34d", dot: "#f59e0b" },
  CONFIRMADA: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd", dot: "#3b82f6" },
  COMPLETADA: { bg: "#dcfce7", color: "#15803d", border: "#86efac", dot: "#22c55e" },
  CANCELADA:  { bg: "#f1f5f9", color: "#94a3b8", border: "#e2e8f0", dot: "#cbd5e1" },
}

const HORAS    = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
const DIAS_ES  = ["Lun", "Mar", "Mié", "Jue", "Vie"]
const HORA_PX  = 64

function inicioSemana(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay()
  r.setDate(r.getDate() - (day === 0 ? 6 : day - 1))
  r.setHours(0, 0, 0, 0)
  return r
}

function fmtHora(h: number) {
  if (h === 12) return "12:00 pm"
  return h < 12 ? `${h}:00 am` : `${h - 12}:00 pm`
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function semanaLabel(inicio: Date): string {
  const fin = new Date(inicio)
  fin.setDate(fin.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  return `${inicio.toLocaleDateString("es-MX", opts)} – ${fin.toLocaleDateString("es-MX", { ...opts, year: "numeric" })}`
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
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
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
  citas:       CitaDto[]
  estudiantes: EstudianteDto[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalNueva, setModalNueva]           = useState(false)
  const [citaACompletar, setCitaACompletar]   = useState<CitaDto | null>(null)
  const [view, setView]                       = useState<"semana" | "lista">("semana")
  const [semanaOffset, setSemanaOffset]       = useState(0)
  const [citaPopup, setCitaPopup]             = useState<string | null>(null)

  function handleEstado(citaId: string, estado: "CONFIRMADA" | "CANCELADA") {
    startTransition(async () => {
      await actualizarEstadoCita(citaId, estado)
      router.refresh()
    })
  }

  const hoyStr      = new Date().toDateString()
  const pendientes  = citas.filter(c => c.estado === "PENDIENTE").length
  const confirmadas = citas.filter(c => c.estado === "CONFIRMADA").length
  const completadasHoy = citas.filter(
    c => c.estado === "COMPLETADA" && new Date(c.fecha).toDateString() === hoyStr
  ).length

  const prioridad: Record<string, number> = { PENDIENTE: 0, CONFIRMADA: 1, COMPLETADA: 2, CANCELADA: 3 }
  const ordenadas = [...citas].sort((a, b) => {
    const pa = prioridad[a.estado] ?? 4
    const pb = prioridad[b.estado] ?? 4
    if (pa !== pb) return pa - pb
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  })

  // ── Calendario ──────────────────────────────────────────────────────────────
  const inicioW = inicioSemana(new Date())
  inicioW.setDate(inicioW.getDate() + semanaOffset * 7)

  const diasSemana = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(inicioW)
    d.setDate(d.getDate() + i)
    return d
  })

  function citasEnCelda(dia: Date, hora: number): CitaDto[] {
    return citas.filter(c => {
      const f = new Date(c.fecha)
      return (
        f.getFullYear() === dia.getFullYear() &&
        f.getMonth()    === dia.getMonth()    &&
        f.getDate()     === dia.getDate()     &&
        f.getHours()    === hora
      )
    })
  }

  const esHoy = (d: Date) => d.toDateString() === hoyStr

  return (
    <div style={{ paddingTop: 8 }}>

      {/* ── Encabezado ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 2px" }}>Citas</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Gestión de agenda · CECyTEN Tepic
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Tabs */}
          <div style={{
            display: "flex", background: "#f1f5f9", borderRadius: 8,
            padding: 3, gap: 2,
          }}>
            {(["semana", "lista"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 14px", borderRadius: 6, border: "none",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: view === v ? "white" : "transparent",
                color: view === v ? "#0f172a" : "#64748b",
                boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s",
              }}>
                {v === "semana" ? "Semana" : "Lista"}
              </button>
            ))}
          </div>
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
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Pendientes"      count={pendientes}     color="#f59e0b" />
        <StatCard label="Confirmadas"     count={confirmadas}    color="#3b82f6" />
        <StatCard label="Completadas hoy" count={completadasHoy} color="#22c55e" />
      </div>

      {/* ══════════════════════════════════════════════
          VISTA SEMANA
      ══════════════════════════════════════════════ */}
      {view === "semana" && (
        <div style={{
          background: "white", borderRadius: 14,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>
          {/* Navegación semana */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #f1f5f9",
            background: "#fafafa",
          }}>
            <button
              onClick={() => setSemanaOffset(o => o - 1)}
              style={{
                border: "1px solid #e2e8f0", background: "white",
                borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                fontSize: 16, color: "#374151", lineHeight: 1,
              }}
            >‹</button>

            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {semanaLabel(inicioW)}
              </p>
              {semanaOffset !== 0 && (
                <button
                  onClick={() => setSemanaOffset(0)}
                  style={{
                    fontSize: 11, color: "#6366f1", background: "none",
                    border: "none", cursor: "pointer", padding: 0, fontWeight: 600,
                  }}
                >
                  Volver a hoy
                </button>
              )}
            </div>

            <button
              onClick={() => setSemanaOffset(o => o + 1)}
              style={{
                border: "1px solid #e2e8f0", background: "white",
                borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                fontSize: 16, color: "#374151", lineHeight: 1,
              }}
            >›</button>
          </div>

          {/* Grid calendario */}
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 700 }}>

              {/* Encabezado de días */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "56px repeat(5, 1fr)",
                borderBottom: "1px solid #e2e8f0",
                position: "sticky", top: 0, background: "white", zIndex: 1,
              }}>
                <div /> {/* espacio hora */}
                {diasSemana.map((dia, i) => {
                  const hoyDia = esHoy(dia)
                  return (
                    <div key={i} style={{
                      padding: "10px 4px",
                      textAlign: "center",
                      borderLeft: "1px solid #f1f5f9",
                    }}>
                      <p style={{
                        fontSize: 11, fontWeight: 700,
                        color: hoyDia ? "#4f46e5" : "#94a3b8",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        margin: "0 0 4px",
                      }}>
                        {DIAS_ES[i]}
                      </p>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: hoyDia ? "#4f46e5" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto",
                      }}>
                        <span style={{
                          fontSize: 14, fontWeight: hoyDia ? 800 : 600,
                          color: hoyDia ? "white" : "#374151",
                        }}>
                          {dia.getDate()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Filas por hora */}
              {HORAS.map((hora, hi) => (
                <div
                  key={hora}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px repeat(5, 1fr)",
                    borderBottom: hi < HORAS.length - 1 ? "1px solid #f8fafc" : "none",
                    minHeight: HORA_PX,
                  }}
                >
                  {/* Etiqueta hora */}
                  <div style={{
                    padding: "4px 8px 0",
                    fontSize: 10, fontWeight: 600,
                    color: "#94a3b8", textAlign: "right",
                    borderRight: "1px solid #f1f5f9",
                    userSelect: "none",
                  }}>
                    {fmtHora(hora)}
                  </div>

                  {/* Celdas de cada día */}
                  {diasSemana.map((dia, di) => {
                    const celdaCitas = citasEnCelda(dia, hora)
                    const hoyDia = esHoy(dia)
                    return (
                      <div key={di} style={{
                        borderLeft: "1px solid #f1f5f9",
                        padding: "3px 4px",
                        minHeight: HORA_PX,
                        background: hoyDia ? "rgba(79,70,229,0.02)" : "transparent",
                        position: "relative",
                      }}>
                        {celdaCitas.map(c => {
                          const cal   = ESTADO_CAL[c.estado] ?? ESTADO_CAL.PENDIENTE
                          const open  = citaPopup === c.id
                          const badge = ESTADO_BADGE[c.estado] ?? ESTADO_BADGE.PENDIENTE
                          return (
                            <div key={c.id} style={{ position: "relative", marginBottom: 2 }}>
                              {/* Tarjeta de cita */}
                              <button
                                onClick={() => setCitaPopup(open ? null : c.id)}
                                style={{
                                  width: "100%", textAlign: "left",
                                  background: cal.bg,
                                  border: `1px solid ${cal.border}`,
                                  borderLeft: `3px solid ${cal.dot}`,
                                  borderRadius: 4, padding: "4px 6px",
                                  cursor: "pointer",
                                  display: "block",
                                }}
                              >
                                <p style={{
                                  fontSize: 11, fontWeight: 700, color: cal.color,
                                  margin: "0 0 1px",
                                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                }}>
                                  {c.estudiante.nombre.split(" ").slice(0, 2).join(" ")}
                                </p>
                                <p style={{ fontSize: 10, color: cal.color, margin: 0, opacity: 0.8 }}>
                                  {new Date(c.fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} · {badge.label}
                                </p>
                              </button>

                              {/* Popup de acciones */}
                              {open && (
                                <div style={{
                                  position: "absolute", top: "calc(100% + 4px)", left: 0,
                                  zIndex: 50, width: 220,
                                  background: "white",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 10,
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                  padding: 12,
                                }}>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>
                                    {c.estudiante.nombre}
                                  </p>
                                  <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 10px" }}>
                                    {new Date(c.fecha).toLocaleDateString("es-MX", {
                                      weekday: "long", day: "numeric", month: "long",
                                      hour: "2-digit", minute: "2-digit",
                                    })}
                                  </p>

                                  {c.notas && (
                                    <p style={{ fontSize: 11, color: "#475569", margin: "0 0 10px", fontStyle: "italic" }}>
                                      "{c.notas}"
                                    </p>
                                  )}

                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                                    {c.estado === "PENDIENTE" && (<>
                                      <button onClick={() => { handleEstado(c.id, "CONFIRMADA"); setCitaPopup(null) }}
                                        style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6, cursor: "pointer", background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                                        Confirmar
                                      </button>
                                      <button onClick={() => { handleEstado(c.id, "CANCELADA"); setCitaPopup(null) }}
                                        style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6, cursor: "pointer", background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3" }}>
                                        Cancelar
                                      </button>
                                    </>)}
                                    {c.estado === "CONFIRMADA" && (<>
                                      <button onClick={() => { setCitaACompletar(c); setCitaPopup(null) }}
                                        style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6, cursor: "pointer", background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                                        Completar
                                      </button>
                                      <button onClick={() => { handleEstado(c.id, "CANCELADA"); setCitaPopup(null) }}
                                        style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6, cursor: "pointer", background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3" }}>
                                        Cancelar
                                      </button>
                                    </>)}
                                  </div>

                                  <Link href={`/expediente/${c.estudianteId}`}
                                    onClick={() => setCitaPopup(null)}
                                    style={{ fontSize: 11, fontWeight: 600, color: "#4f46e5", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                                    Ver expediente →
                                  </Link>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Leyenda */}
          <div style={{
            padding: "10px 16px", borderTop: "1px solid #f1f5f9",
            display: "flex", gap: 16, flexWrap: "wrap", background: "#fafafa",
          }}>
            {Object.entries(ESTADO_BADGE).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: ESTADO_CAL[k].bg,
                  border: `1.5px solid ${ESTADO_CAL[k].dot}`,
                }} />
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          VISTA LISTA
      ══════════════════════════════════════════════ */}
      {view === "lista" && (
        ordenadas.length === 0 ? (
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
                  {["Estudiante", "Fecha y hora", "Estado", "Notas", "Acciones"].map(h => (
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
                {ordenadas.map(cita => {
                  const badge = ESTADO_BADGE[cita.estado] ?? ESTADO_BADGE.PENDIENTE
                  return (
                    <tr key={cita.id} style={{ borderBottom: "1px solid #f8fafc" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "white")}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <Link href={`/expediente/${cita.estudianteId}`}
                          style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5", textDecoration: "none" }}>
                          {cita.estudiante.nombre}
                        </Link>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>
                        {formatFecha(cita.fecha)}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                          whiteSpace: "nowrap",
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b", maxWidth: 220 }}>
                        {cita.notas ? (
                          <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {cita.notas}
                          </span>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                        {cita.estado === "PENDIENTE" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleEstado(cita.id, "CONFIRMADA")} disabled={isPending}
                              style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 6, cursor: "pointer", background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                              Confirmar
                            </button>
                            <button onClick={() => handleEstado(cita.id, "CANCELADA")} disabled={isPending}
                              style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 6, cursor: "pointer", background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3" }}>
                              Cancelar
                            </button>
                          </div>
                        )}
                        {cita.estado === "CONFIRMADA" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setCitaACompletar(cita)}
                              style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 6, cursor: "pointer", background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                              Completar
                            </button>
                            <button onClick={() => handleEstado(cita.id, "CANCELADA")} disabled={isPending}
                              style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 6, cursor: "pointer", background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3" }}>
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
        )
      )}

      {/* ── Modales ── */}
      {modalNueva && (
        <ModalNuevaCita estudiantes={estudiantes} onClose={() => setModalNueva(false)} />
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
