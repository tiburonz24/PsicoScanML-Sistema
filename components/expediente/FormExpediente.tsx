"use client"

import { useActionState } from "react"
import { actualizarExpediente } from "@/lib/actions/sesion"
import { EstadoExpediente } from "@/lib/enums"

type Props = {
  estudianteId:          string
  motivoConsulta?:       string | null
  antecedentes?:         string | null
  diagnosticoPreliminar?: string | null
  planIntervencion?:     string | null
  estado?:               string
}

const LABEL: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 5,
}
const TEXTAREA: React.CSSProperties = {
  width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
  padding: "10px 12px", fontSize: 13, color: "#0f172a",
  outline: "none", resize: "vertical", boxSizing: "border-box",
  fontFamily: "inherit", lineHeight: 1.6,
}
const SELECT: React.CSSProperties = {
  border: "1.5px solid #e2e8f0", borderRadius: 8,
  padding: "8px 12px", fontSize: 13, color: "#0f172a",
  outline: "none", background: "white", cursor: "pointer",
}

const LABELS_ESTADO: Record<string, string> = {
  ACTIVO:    "Activo",
  CERRADO:   "Cerrado",
  DERIVADO:  "Derivado",
  EN_ESPERA: "En espera",
}
const COLORS_ESTADO: Record<string, { bg: string; color: string; border: string }> = {
  ACTIVO:    { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  CERRADO:   { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
  DERIVADO:  { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  EN_ESPERA: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
}

export default function FormExpediente({
  estudianteId,
  motivoConsulta,
  antecedentes,
  diagnosticoPreliminar,
  planIntervencion,
  estado = "ACTIVO",
}: Props) {
  const [state, action, isPending] = useActionState(actualizarExpediente, {})
  const estadoColors = COLORS_ESTADO[estado] ?? COLORS_ESTADO.ACTIVO

  return (
    <div style={{
      background: "white", borderRadius: 14,
      border: "1px solid #f1f5f9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px", borderBottom: "1px solid #f1f5f9",
        background: "#fafafa",
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Expediente clínico</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
            background: estadoColors.bg, color: estadoColors.color, border: `1px solid ${estadoColors.border}`,
          }}>
            {LABELS_ESTADO[estado] ?? estado}
          </span>
        </div>
      </div>

      <form action={action} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <input type="hidden" name="estudianteId" value={estudianteId} />

        {/* Estado */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ ...LABEL, margin: 0, flexShrink: 0 }}>Estado:</label>
          <select name="estado" defaultValue={estado} style={SELECT}>
            {Object.entries(EstadoExpediente).map(([k, v]) => (
              <option key={k} value={v}>{LABELS_ESTADO[v] ?? v}</option>
            ))}
          </select>
        </div>

        {/* Motivo consulta */}
        <div>
          <label style={LABEL}>Motivo de consulta</label>
          <textarea
            name="motivoConsulta"
            rows={2}
            defaultValue={motivoConsulta ?? ""}
            placeholder="¿Por qué fue derivado o acudió el estudiante?"
            style={TEXTAREA}
          />
        </div>

        {/* Antecedentes */}
        <div>
          <label style={LABEL}>Antecedentes relevantes</label>
          <textarea
            name="antecedentes"
            rows={3}
            defaultValue={antecedentes ?? ""}
            placeholder="Historial familiar, médico, situación actual…"
            style={TEXTAREA}
          />
        </div>

        {/* Diagnóstico preliminar */}
        <div>
          <label style={LABEL}>Diagnóstico preliminar</label>
          <textarea
            name="diagnosticoPreliminar"
            rows={2}
            defaultValue={diagnosticoPreliminar ?? ""}
            placeholder="Impresión clínica inicial (no final)…"
            style={TEXTAREA}
          />
        </div>

        {/* Plan intervención */}
        <div>
          <label style={LABEL}>Plan de intervención</label>
          <textarea
            name="planIntervencion"
            rows={3}
            defaultValue={planIntervencion ?? ""}
            placeholder="Objetivos, estrategias, frecuencia de sesiones…"
            style={TEXTAREA}
          />
        </div>

        {state?.error && (
          <p style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2",
            border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", margin: 0 }}>
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p style={{ fontSize: 13, color: "#15803d", background: "#f0fdf4",
            border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", margin: 0 }}>
            Expediente guardado correctamente.
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={isPending}
            style={{
              background: "#4f46e5", color: "white", border: "none",
              borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "Guardando…" : "Guardar expediente"}
          </button>
        </div>
      </form>
    </div>
  )
}
