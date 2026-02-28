"use client"

import { useActionState, useState } from "react"
import { agendarCita } from "@/lib/actions/cita"

type EstudianteOpcion = { id: string; nombre: string }

type Props = {
  estudiantes:       EstudianteOpcion[]
  estudianteId?:     string
  nombreEstudiante?: string
  onClose:           () => void
}

const OVERLAY: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 50,
}
const CARD: React.CSSProperties = {
  background: "white", borderRadius: 16,
  padding: "28px 32px", width: "100%", maxWidth: 440,
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
const BTN_PRIMARY: React.CSSProperties = {
  background: "#4f46e5", color: "white", border: "none",
  borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
  cursor: "pointer",
}
const BTN_GHOST: React.CSSProperties = {
  background: "none", color: "#64748b", border: "1.5px solid #e2e8f0",
  borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
  cursor: "pointer",
}

export default function ModalNuevaCita({ estudiantes, estudianteId, nombreEstudiante, onClose }: Props) {
  const [state, action, isPending] = useActionState(agendarCita, undefined)
  const [filtro, setFiltro] = useState("")

  const opcionesFiltradas = estudiantes.filter(e =>
    e.nombre.toLowerCase().includes(filtro.toLowerCase())
  )

  const preSeleccionado = Boolean(estudianteId)

  return (
    <div style={OVERLAY} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Agendar cita</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94a3b8" }}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Estudiante */}
          <div>
            <label style={LABEL}>Estudiante</label>
            {preSeleccionado ? (
              <>
                <input type="hidden" name="estudianteId" value={estudianteId} />
                <div style={{
                  ...INPUT, background: "#f8fafc", color: "#475569",
                  display: "flex", alignItems: "center",
                }}>
                  {nombreEstudiante}
                </div>
              </>
            ) : (
              <>
                <input
                  placeholder="Buscar por nombre…"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  style={{ ...INPUT, marginBottom: 6 }}
                />
                <select name="estudianteId" required style={{ ...INPUT }}>
                  <option value="">— Selecciona —</option>
                  {opcionesFiltradas.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Fecha y hora */}
          <div>
            <label style={LABEL}>Fecha y hora</label>
            <input
              type="datetime-local"
              name="fecha"
              required
              style={INPUT}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Notas */}
          <div>
            <label style={LABEL}>Notas (opcional)</label>
            <textarea
              name="notas"
              rows={3}
              placeholder="Motivo de la cita, instrucciones…"
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
            <button type="button" onClick={onClose} style={BTN_GHOST} disabled={isPending}>
              Cancelar
            </button>
            <button type="submit" style={BTN_PRIMARY} disabled={isPending}>
              {isPending ? "Agendando…" : "Agendar cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
