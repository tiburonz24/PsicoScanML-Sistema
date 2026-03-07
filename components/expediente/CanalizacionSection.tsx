"use client"

import { useActionState, useState } from "react"
import { crearCanalizacion, actualizarSeguimientoCanalizacion } from "@/lib/actions/canalizacion"
import { DIRECTORIO_CANALIZACIONES } from "@/lib/data/directorio"

type CanalizacionDto = {
  id:                string
  fecha:             string
  institucion:       string
  tipoInstitucion:   string
  tipoAtencion:      string | null
  motivo:            string
  nivelRiesgo:       number | null
  urgente:           boolean
  estado:            string
  notas:             string | null
  firmaPadres:       boolean
  documentoRecibido: boolean
  tipoDocumento:     string | null
  fechaDocumento:    string | null
}

type Props = {
  estudianteId:  string
  canalizaciones: CanalizacionDto[]
}

const ESTADO_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDIENTE:       { label: "Pendiente",        color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  EN_PROCESO:      { label: "En proceso",       color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
  COMPLETADA:      { label: "Completada",       color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  SIN_SEGUIMIENTO: { label: "Sin seguimiento",  color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
}

export default function CanalizacionSection({ estudianteId, canalizaciones: init }: Props) {
  const [creando, setCreando]               = useState(false)
  const [seguimientoId, setSeguimientoId]   = useState<string | null>(null)
  const [directorioAbierto, setDirectorioAbierto] = useState(false)
  const [filtroDir, setFiltroDir]           = useState<"TODOS" | "PUBLICA" | "PRIVADA">("TODOS")
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState("")
  const [tipoInstSel, setTipoInstSel]       = useState("PUBLICA")

  const [stateCrear, actionCrear, pendingCrear]       = useActionState(crearCanalizacion, {})
  const [stateSeg, actionSeg, pendingSeg]             = useActionState(actualizarSeguimientoCanalizacion, {})

  const dirFiltrado = DIRECTORIO_CANALIZACIONES.filter(
    d => filtroDir === "TODOS" || d.tipo === filtroDir
  )

  function seleccionarInstitucion(nombre: string, tipo: string) {
    setInstitucionSeleccionada(nombre)
    setTipoInstSel(tipo)
    setDirectorioAbierto(false)
  }

  return (
    <div>
      {/* Lista de canalizaciones */}
      {init.length === 0 ? (
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px" }}>
          Sin canalizaciones registradas.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {init.map(c => {
            const est = ESTADO_STYLE[c.estado] ?? ESTADO_STYLE.PENDIENTE
            const enSeguimiento = seguimientoId === c.id
            return (
              <div key={c.id} style={{
                borderRadius: 12, overflow: "hidden",
                border: `1.5px solid ${c.urgente ? "#fca5a5" : "#e2e8f0"}`,
                background: c.urgente ? "#fff5f5" : "white",
              }}>
                {/* Cabecera */}
                <div style={{
                  padding: "12px 16px",
                  display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap",
                  borderBottom: enSeguimiento ? "1px solid #f1f5f9" : "none",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      {c.urgente && (
                        <span style={{
                          fontSize: 10, fontWeight: 800, background: "#fef2f2",
                          color: "#b91c1c", border: "1px solid #fecaca",
                          borderRadius: 4, padding: "1px 6px", letterSpacing: "0.05em",
                        }}>
                          URGENTE
                        </span>
                      )}
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                        {c.institucion}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        background: c.tipoInstitucion === "PUBLICA" ? "#eff6ff" : "#faf5ff",
                        color: c.tipoInstitucion === "PUBLICA" ? "#1e40af" : "#6d28d9",
                        border: `1px solid ${c.tipoInstitucion === "PUBLICA" ? "#bfdbfe" : "#ddd6fe"}`,
                        borderRadius: 4, padding: "1px 6px",
                      }}>
                        {c.tipoInstitucion === "PUBLICA" ? "Pública" : "Privada"}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px",
                        borderRadius: 20, background: est.bg, color: est.color, border: `1px solid ${est.border}`,
                      }}>
                        {est.label}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
                      {c.motivo}
                    </p>
                    {c.tipoAtencion && (
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                        Tipo: {c.tipoAtencion}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 6px" }}>
                      {new Date(c.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end" }}>
                      {c.firmaPadres && (
                        <span style={{ fontSize: 10, color: "#15803d", fontWeight: 600 }}>✓ Padres firmaron</span>
                      )}
                      {c.documentoRecibido && (
                        <span style={{ fontSize: 10, color: "#15803d", fontWeight: 600 }}>✓ Documento recibido</span>
                      )}
                    </div>
                    <button
                      onClick={() => setSeguimientoId(enSeguimiento ? null : c.id)}
                      style={{
                        marginTop: 8, background: "none",
                        border: "1px solid #e2e8f0", borderRadius: 6,
                        padding: "4px 10px", fontSize: 11, fontWeight: 600,
                        color: "#4f46e5", cursor: "pointer",
                      }}
                    >
                      {enSeguimiento ? "Cerrar" : "Seguimiento"}
                    </button>
                  </div>
                </div>

                {/* Panel de seguimiento */}
                {enSeguimiento && (
                  <form action={actionSeg} style={{ padding: "14px 16px", background: "#fafafa" }}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="estudianteId" value={estudianteId} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      {/* Estado */}
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                          Estado
                        </label>
                        <select name="estado" defaultValue={c.estado}
                          style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "7px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }}>
                          {Object.entries(ESTADO_STYLE).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Tipo documento */}
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                          Documento recibido
                        </label>
                        <input name="tipoDocumento" defaultValue={c.tipoDocumento ?? ""}
                          placeholder="Ej: Acuse IMSS, constancia consulta…"
                          style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "7px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                        <input type="checkbox" name="firmaPadres" defaultChecked={c.firmaPadres} />
                        Padres firmaron de enterado
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                        <input type="checkbox" name="documentoRecibido" defaultChecked={c.documentoRecibido} />
                        Documento de seguimiento recibido
                      </label>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                        Notas de seguimiento
                      </label>
                      <textarea name="notas" rows={2} defaultValue={c.notas ?? ""}
                        placeholder="Observaciones…"
                        style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "8px 10px", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" as const }} />
                    </div>

                    {stateSeg?.error && (
                      <p style={{ fontSize: 12, color: "#dc2626", margin: "0 0 8px" }}>{stateSeg.error}</p>
                    )}
                    <button type="submit" disabled={pendingSeg} style={{
                      background: "#4f46e5", color: "white", border: "none",
                      borderRadius: 7, padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>
                      {pendingSeg ? "Guardando…" : "Guardar seguimiento"}
                    </button>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Directorio consultable */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setDirectorioAbierto(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: directorioAbierto ? "#eff6ff" : "none",
            border: "1.5px solid #bfdbfe", borderRadius: 8,
            padding: "7px 14px", fontSize: 12, fontWeight: 600,
            color: "#1e40af", cursor: "pointer",
          }}
        >
          <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Directorio de canalizaciones
          <svg width={11} height={11} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            style={{ transform: directorioAbierto ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {directorioAbierto && (
          <div style={{
            marginTop: 8, borderRadius: 12, border: "1px solid #e2e8f0",
            background: "white", overflow: "hidden",
          }}>
            {/* Filtro tipo */}
            <div style={{
              padding: "10px 14px", borderBottom: "1px solid #f1f5f9",
              display: "flex", gap: 8, background: "#fafafa", alignItems: "center",
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Filtrar:
              </span>
              {(["TODOS", "PUBLICA", "PRIVADA"] as const).map(f => (
                <button key={f} onClick={() => setFiltroDir(f)} style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
                  border: "1px solid",
                  borderColor: filtroDir === f ? "#6366f1" : "#e2e8f0",
                  background: filtroDir === f ? "#eef2ff" : "white",
                  color: filtroDir === f ? "#4f46e5" : "#64748b",
                  cursor: "pointer",
                }}>
                  {f === "TODOS" ? "Todas" : f === "PUBLICA" ? "Públicas" : "Privadas"}
                </button>
              ))}
            </div>

            {/* Instituciones */}
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {dirFiltrado.map((inst, i) => (
                <div key={i} style={{
                  padding: "12px 14px",
                  borderBottom: i < dirFiltrado.length - 1 ? "1px solid #f8fafc" : "none",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{inst.nombre}</span>
                      {inst.urgente && (
                        <span style={{ fontSize: 9, fontWeight: 800, background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 3, padding: "1px 5px" }}>
                          URGENCIAS
                        </span>
                      )}
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        background: inst.tipo === "PUBLICA" ? "#eff6ff" : "#faf5ff",
                        color: inst.tipo === "PUBLICA" ? "#1e40af" : "#6d28d9",
                        border: `1px solid ${inst.tipo === "PUBLICA" ? "#bfdbfe" : "#ddd6fe"}`,
                        borderRadius: 4, padding: "1px 6px",
                      }}>
                        {inst.tipo === "PUBLICA" ? "Pública" : "Privada"}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, margin: "0 0 2px" }}>
                      {inst.atencion}
                    </p>
                    <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{inst.direccion}</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
                      {inst.telefono  && <span style={{ fontSize: 11, color: "#475569" }}>📞 {inst.telefono}</span>}
                      {inst.horario   && <span style={{ fontSize: 11, color: "#475569" }}>🕐 {inst.horario}</span>}
                      {inst.costo     && <span style={{ fontSize: 11, color: "#475569" }}>💲 {inst.costo}</span>}
                      {inst.responsable && <span style={{ fontSize: 11, color: "#94a3b8" }}>👤 {inst.responsable}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => seleccionarInstitucion(inst.nombre, inst.tipo)}
                    style={{
                      flexShrink: 0, fontSize: 11, fontWeight: 600,
                      background: "#4f46e5", color: "white", border: "none",
                      borderRadius: 6, padding: "5px 12px", cursor: "pointer",
                    }}
                  >
                    Seleccionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Formulario nueva canalización */}
      {!creando ? (
        <button
          onClick={() => setCreando(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "1.5px dashed #cbd5e1",
            borderRadius: 8, padding: "8px 14px",
            fontSize: 12, fontWeight: 600, color: "#64748b", cursor: "pointer",
          }}
        >
          <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva canalización
        </button>
      ) : (
        <form action={actionCrear} style={{
          background: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: 10, padding: 16,
        }}>
          <input type="hidden" name="estudianteId" value={estudianteId} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {/* Institución */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Institución
              </label>
              <input
                name="institucion" required
                value={institucionSeleccionada}
                onChange={e => setInstitucionSeleccionada(e.target.value)}
                placeholder="Nombre de la institución…"
                style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }}
              />
              {institucionSeleccionada && (
                <p style={{ fontSize: 10, color: "#6366f1", margin: "3px 0 0", fontWeight: 600 }}>
                  Seleccionada del directorio
                </p>
              )}
            </div>

            {/* Tipo institución */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Tipo
              </label>
              <select name="tipoInstitucion" value={tipoInstSel} onChange={e => setTipoInstSel(e.target.value)}
                style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }}>
                <option value="PUBLICA">Pública</option>
                <option value="PRIVADA">Privada</option>
              </select>
            </div>

            {/* Tipo atención */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Tipo de atención
              </label>
              <input name="tipoAtencion" placeholder="Ej: Psicología, Psiquiatría…"
                style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
            </div>

            {/* Nivel de riesgo */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Nivel de riesgo (1-10)
              </label>
              <input name="nivelRiesgo" type="number" min={1} max={10} placeholder="Ej: 8"
                style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
            </div>
          </div>

          {/* Motivo */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Motivo de canalización *
            </label>
            <textarea name="motivo" required rows={2}
              placeholder="Describe el motivo de la canalización…"
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "8px 10px", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" as const }} />
          </div>

          {/* Notas */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Notas adicionales
            </label>
            <textarea name="notas" rows={2}
              placeholder="Observaciones, instrucciones para padres…"
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "8px 10px", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" as const }} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
            <input type="checkbox" name="urgente" />
            <span style={{ fontWeight: 600, color: "#b91c1c" }}>Marcar como URGENTE</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>(ideación suicida / autolesión)</span>
          </label>

          {stateCrear?.error && (
            <p style={{ fontSize: 12, color: "#dc2626", margin: "0 0 10px" }}>{stateCrear.error}</p>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={pendingCrear} style={{
              background: "#4f46e5", color: "white", border: "none",
              borderRadius: 7, padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              {pendingCrear ? "Guardando…" : "Registrar canalización"}
            </button>
            <button type="button" onClick={() => { setCreando(false); setInstitucionSeleccionada("") }} style={{
              background: "none", color: "#64748b", border: "1px solid #e2e8f0",
              borderRadius: 7, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
