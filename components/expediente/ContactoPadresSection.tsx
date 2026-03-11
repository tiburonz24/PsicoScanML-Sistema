"use client"

import { useActionState, useState } from "react"
import { registrarContacto, eliminarContacto } from "@/lib/actions/contacto"
import { useRouter } from "next/navigation"

type ContactoDto = {
  id:        string
  fecha:     string
  tipo:      string
  resultado: string
  notas:     string | null
}

type Props = {
  estudianteId: string
  contactos:    ContactoDto[]
}

const TIPO_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  LLAMADA:             { label: "Llamada telefónica",     icon: "📞", color: "#1A7A8A" },
  MENSAJE_TEXTO:       { label: "Mensaje de texto",        icon: "💬", color: "#0891b2" },
  CONTACTO_POR_ALUMNO: { label: "Contacto por el alumno", icon: "🎓", color: "#7c3aed" },
  CITA_PADRES:         { label: "Cita con padres",         icon: "👨‍👩‍👧", color: "#15803d" },
}

const RESULTADO_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  CONTESTO:        { label: "Contestó",          color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  NO_CONTESTO:     { label: "No contestó",       color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  MENSAJE_ENVIADO: { label: "Mensaje enviado",   color: "#1A7A8A", bg: "rgba(42,191,191,0.12)", border: "rgba(42,191,191,0.35)" },
  SIN_RESPUESTA:   { label: "Sin respuesta",     color: "#4A5568", bg: "#f8fafc", border: "#e2e8f0" },
  ACUDIO:          { label: "Acudió a la cita",  color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  NO_ACUDIO:       { label: "No acudió",         color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
}

const RESULTADO_POR_TIPO: Record<string, string[]> = {
  LLAMADA:             ["CONTESTO", "NO_CONTESTO"],
  MENSAJE_TEXTO:       ["MENSAJE_ENVIADO", "SIN_RESPUESTA"],
  CONTACTO_POR_ALUMNO: ["CONTESTO", "SIN_RESPUESTA"],
  CITA_PADRES:         ["ACUDIO", "NO_ACUDIO"],
}

export default function ContactoPadresSection({ estudianteId, contactos: init }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [tipo, setTipo]       = useState("LLAMADA")
  const [state, action, isPending] = useActionState(registrarContacto, {})

  const resultadosDisponibles = RESULTADO_POR_TIPO[tipo] ?? []

  async function handleEliminar(id: string) {
    await eliminarContacto(id, estudianteId)
    router.refresh()
  }

  return (
    <div>
      {/* Historial */}
      {init.length === 0 ? (
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px" }}>
          Sin intentos de contacto registrados.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {init.map(c => {
            const t = TIPO_LABELS[c.tipo]
            const r = RESULTADO_LABELS[c.resultado]
            return (
              <div key={c.id} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "10px 14px", borderRadius: 10,
                background: "#f8fafc", border: "1px solid #f1f5f9",
              }}>
                <span style={{ fontSize: 18, lineHeight: 1.4 }}>{t?.icon ?? "📋"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t?.color ?? "#0D475A" }}>
                      {t?.label ?? c.tipo}
                    </span>
                    {r && (
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        background: r.bg, color: r.color, border: `1px solid ${r.border}`,
                        borderRadius: 20, padding: "2px 8px",
                      }}>
                        {r.label}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
                      {new Date(c.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {c.notas && (
                    <p style={{ fontSize: 12, color: "#475569", margin: "4px 0 0", fontStyle: "italic" }}>
                      {c.notas}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleEliminar(c.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 2, flexShrink: 0 }}
                  title="Eliminar registro"
                >
                  <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Formulario nuevo contacto */}
      {!abierto ? (
        <button
          onClick={() => setAbierto(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "1.5px dashed #cbd5e1",
            borderRadius: 8, padding: "8px 14px",
            fontSize: 12, fontWeight: 600, color: "#4A5568", cursor: "pointer",
          }}
        >
          <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Registrar contacto
        </button>
      ) : (
        <form action={action} style={{
          background: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: 10, padding: 16,
        }}>
          <input type="hidden" name="estudianteId" value={estudianteId} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {/* Tipo */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#4A5568", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Tipo de contacto
              </label>
              <select
                name="tipo" value={tipo}
                onChange={e => setTipo(e.target.value)}
                style={{ width: "100%", border: "1.5px solid #dce8ec", borderRadius: 7, padding: "8px 10px", fontSize: 13, outline: "none", background: "#F4F8FA", color: "#0D475A", boxSizing: "border-box" as const }}
              >
                {Object.entries(TIPO_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>

            {/* Resultado */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#4A5568", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Resultado
              </label>
              <select
                name="resultado"
                style={{ width: "100%", border: "1.5px solid #dce8ec", borderRadius: 7, padding: "8px 10px", fontSize: 13, outline: "none", background: "#F4F8FA", color: "#0D475A", boxSizing: "border-box" as const }}
              >
                {resultadosDisponibles.map(r => (
                  <option key={r} value={r}>{RESULTADO_LABELS[r]?.label ?? r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notas */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#4A5568", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Notas (opcional)
            </label>
            <textarea
              name="notas" rows={2}
              placeholder="Observaciones del contacto…"
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 7, padding: "8px 10px", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" as const }}
            />
          </div>

          {state?.error && (
            <p style={{ fontSize: 12, color: "#dc2626", margin: "0 0 10px" }}>{state.error}</p>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={isPending} style={{
              background: "linear-gradient(90deg, #0D475A, #1A7A8A)", color: "white", border: "none",
              borderRadius: 7, padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              {isPending ? "Guardando…" : "Registrar"}
            </button>
            <button type="button" onClick={() => setAbierto(false)} style={{
              background: "none", color: "#4A5568", border: "1.5px solid #dce8ec",
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
