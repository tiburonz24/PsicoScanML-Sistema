"use client"

import { useActionState } from "react"
import { crearSesion } from "@/lib/actions/sesion"
import { TipoSesion } from "@/lib/enums"

type Props = {
  estudianteId: string
  onClose:      () => void
}

const OVERLAY: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 50,
}
const CARD: React.CSSProperties = {
  background: "white", borderRadius: 16,
  padding: "28px 32px", width: "100%", maxWidth: 480,
  maxHeight: "90vh", overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
}
const LABEL: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 5,
}
const INPUT: React.CSSProperties = {
  width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, color: "#0f172a",
  outline: "none", boxSizing: "border-box",
}

const LABELS_TIPO: Record<string, string> = {
  EVALUACION_INICIAL: "Evaluación inicial",
  SEGUIMIENTO:        "Seguimiento",
  INTERVENCION:       "Intervención",
  CRISIS:             "Crisis",
  CIERRE:             "Cierre",
  DEVOLUCION:         "Devolución",
}

export default function ModalNuevaSesion({ estudianteId, onClose }: Props) {
  const [state, action, isPending] = useActionState(crearSesion, {})

  // Close after successful save
  if (state?.ok) {
    onClose()
    return null
  }

  return (
    <div style={OVERLAY} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Nueva sesión</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94a3b8" }}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input type="hidden" name="estudianteId" value={estudianteId} />

          {/* Tipo */}
          <div>
            <label style={LABEL}>Tipo de sesión</label>
            <select name="tipo" defaultValue="SEGUIMIENTO" style={INPUT}>
              {Object.entries(TipoSesion).map(([k, v]) => (
                <option key={k} value={v}>{LABELS_TIPO[v] ?? v}</option>
              ))}
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label style={LABEL}>Motivo de consulta</label>
            <input name="motivo" placeholder="Razón por la que acude…" style={INPUT} />
          </div>

          {/* Notas — obligatorio */}
          <div>
            <label style={LABEL}>
              Notas de sesión <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <textarea
              name="notas"
              rows={4}
              required
              placeholder="Descripción de la sesión, observaciones clínicas…"
              style={{ ...INPUT, resize: "vertical" }}
            />
          </div>

          {/* Acuerdos */}
          <div>
            <label style={LABEL}>Acuerdos / tareas</label>
            <textarea
              name="acuerdos"
              rows={2}
              placeholder="Compromisos para la próxima sesión…"
              style={{ ...INPUT, resize: "vertical" }}
            />
          </div>

          {/* Plan actualizado */}
          <div>
            <label style={LABEL}>Plan de intervención actualizado</label>
            <textarea
              name="planActualizado"
              rows={2}
              placeholder="Ajustes al plan de intervención…"
              style={{ ...INPUT, resize: "vertical" }}
            />
          </div>

          {state?.error && (
            <p style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", margin: 0 }}>
              {state.error}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button
              type="button" onClick={onClose}
              style={{ background: "none", color: "#64748b", border: "1.5px solid #e2e8f0",
                borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ background: "#4f46e5", color: "white", border: "none",
                borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              disabled={isPending}
            >
              {isPending ? "Guardando…" : "Guardar sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
