"use client"

import { useActionState, useEffect, useRef } from "react"
import { registrarEstudiante } from "@/lib/actions/estudiante"

const INPUT: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", fontSize: 14,
  border: "1.5px solid #dce8ec", borderRadius: 8,
  outline: "none", background: "#F4F8FA",
  color: "#0D475A", transition: "border-color 0.15s",
  fontFamily: "inherit",
}
const INPUT_ERR: React.CSSProperties = { ...INPUT, borderColor: "#fca5a5", background: "#fff5f5" }
const LABEL: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600,
  color: "#374151", marginBottom: 6,
}
const ERR_MSG: React.CSSProperties = {
  fontSize: 12, color: "#dc2626", marginTop: 4,
}

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
      {error && <p style={ERR_MSG}>{error}</p>}
    </div>
  )
}

const GRADOS = ["1°", "2°", "3°", "4°", "5°", "6°"]
const GRUPOS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default function FormNuevoEstudiante() {
  const [state, action, isPending] = useActionState(registrarEstudiante, undefined)
  const fe = state?.fieldErrors ?? {}

  // Calcular edad en tiempo real para mostrarla como referencia
  const fechaRef = useRef<HTMLInputElement>(null)

  function calcularEdad(fecha: string): number | null {
    if (!fecha) return null
    const hoy = new Date()
    const nac = new Date(fecha)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const m = hoy.getMonth() - nac.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad >= 0 && edad <= 30 ? edad : null
  }

  return (
    <form action={action}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 24,
      }}>

        {/* ── Columna izquierda ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <div style={{
            fontSize: 10, fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "1.2px",
            paddingBottom: 8, borderBottom: "1px solid #e2e8f0",
          }}>
            Identificación
          </div>

          <Field label="Nombre completo *" error={fe.nombre}>
            <input
              name="nombre"
              type="text"
              placeholder="Ej. García López Juan Carlos"
              autoCapitalize="words"
              style={fe.nombre ? INPUT_ERR : INPUT}
              onFocus={e => { if (!fe.nombre) e.target.style.borderColor = "#2ABFBF" }}
              onBlur={e => { if (!fe.nombre) e.target.style.borderColor = "#dce8ec" }}
            />
          </Field>

          <Field label="CURP *" error={fe.curp}>
            <input
              name="curp"
              type="text"
              maxLength={18}
              placeholder="BADD110313HCMLNS09"
              autoCapitalize="characters"
              style={{
                ...(fe.curp ? INPUT_ERR : INPUT),
                textTransform: "uppercase",
                fontFamily: "monospace",
                letterSpacing: "0.1em",
              }}
              onFocus={e => { if (!fe.curp) e.target.style.borderColor = "#2ABFBF" }}
              onBlur={e => { if (!fe.curp) e.target.style.borderColor = "#dce8ec" }}
            />
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              18 caracteres · tal como aparece en la credencial
            </p>
          </Field>

          <Field label="Fecha de nacimiento *" error={fe.fechaNac}>
            <div style={{ position: "relative" }}>
              <input
                ref={fechaRef}
                name="fechaNac"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                style={fe.fechaNac ? INPUT_ERR : INPUT}
                onFocus={e => { if (!fe.fechaNac) e.target.style.borderColor = "#2ABFBF" }}
                onBlur={e => {
                  if (!fe.fechaNac) e.target.style.borderColor = "#dce8ec"
                  const edad = calcularEdad(e.target.value)
                  const badge = e.target.parentElement?.querySelector(".edad-badge") as HTMLElement
                  if (badge) badge.textContent = edad !== null ? `${edad} años` : ""
                }}
              />
              <span
                className="edad-badge"
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  fontSize: 12, fontWeight: 700, color: "#1A7A8A",
                  pointerEvents: "none",
                }}
              />
            </div>
          </Field>

          <Field label="Sexo *" error={fe.sexo}>
            <select
              name="sexo"
              defaultValue=""
              style={fe.sexo ? INPUT_ERR : INPUT}
              onFocus={e => { if (!fe.sexo) e.target.style.borderColor = "#2ABFBF" }}
              onBlur={e => { if (!fe.sexo) e.target.style.borderColor = "#dce8ec" }}
            >
              <option value="" disabled>Selecciona…</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="OTRO">Otro / Prefiero no decir</option>
            </select>
          </Field>

        </div>

        {/* ── Columna derecha ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <div style={{
            fontSize: 10, fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "1.2px",
            paddingBottom: 8, borderBottom: "1px solid #e2e8f0",
          }}>
            Información escolar
          </div>

          <Field label="Grado *" error={fe.grado}>
            <select
              name="grado"
              defaultValue=""
              style={fe.grado ? INPUT_ERR : INPUT}
              onFocus={e => { if (!fe.grado) e.target.style.borderColor = "#2ABFBF" }}
              onBlur={e => { if (!fe.grado) e.target.style.borderColor = "#dce8ec" }}
            >
              <option value="" disabled>Selecciona…</option>
              {GRADOS.map(g => <option key={g} value={g}>{g} Semestre</option>)}
            </select>
          </Field>

          <Field label="Grupo *" error={fe.grupo}>
            <select
              name="grupo"
              defaultValue=""
              style={fe.grupo ? INPUT_ERR : INPUT}
              onFocus={e => { if (!fe.grupo) e.target.style.borderColor = "#2ABFBF" }}
              onBlur={e => { if (!fe.grupo) e.target.style.borderColor = "#dce8ec" }}
            >
              <option value="" disabled>Selecciona…</option>
              {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>

          <Field label="Plantel / Escuela" error={fe.escuela}>
            <input
              name="escuela"
              type="text"
              defaultValue="CECyTEN Plantel Tepic"
              readOnly
              style={{ ...INPUT, background: "#eef4f7", color: "#6b8fa0", cursor: "not-allowed" }}
            />
          </Field>

          {/* Tarjeta informativa */}
          <div style={{
            marginTop: 8,
            background: "rgba(42,191,191,0.06)",
            border: "1px solid rgba(42,191,191,0.25)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1A7A8A", margin: "0 0 6px" }}>
              ¿Qué pasa después del registro?
            </p>
            <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 12, color: "#4A5568", lineHeight: 1.7 }}>
              <li>Se crea el expediente del estudiante</li>
              <li>Se genera su token de acceso al cuestionario SENA</li>
              <li>Podrás agendarle una cita o aplicarle el cuestionario desde su perfil</li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Error global ── */}
      {state?.error && (
        <div style={{
          marginTop: 24, display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderRadius: 10,
          background: "#fef2f2", border: "1px solid #fecaca",
          fontSize: 13, color: "#dc2626",
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
               style={{ flexShrink: 0 }}>
            <circle cx={12} cy={12} r={10} />
            <line x1={12} y1={8} x2={12} y2={12} />
            <line x1={12} y1={16} x2="12.01" y2={16} />
          </svg>
          {state.error}
        </div>
      )}

      {/* ── Acciones ── */}
      <div style={{
        marginTop: 32, display: "flex", gap: 12,
        justifyContent: "flex-end", flexWrap: "wrap",
      }}>
        <a
          href="/cuestionario"
          style={{
            padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: "1.5px solid #dce8ec", background: "white",
            color: "#4A5568", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: "10px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: "none", cursor: isPending ? "not-allowed" : "pointer",
            background: isPending ? "#1A7A8A" : "linear-gradient(90deg, #0D475A, #1A7A8A)",
            color: "white", opacity: isPending ? 0.7 : 1,
            display: "flex", alignItems: "center", gap: 8,
            transition: "opacity 0.15s",
          }}
        >
          {isPending ? (
            <>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth={2}
                   style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Guardando…
            </>
          ) : (
            <>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Registrar estudiante
            </>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}
