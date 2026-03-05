"use client"

import { useActionState } from "react"
import { loginConCurp } from "@/lib/actions/alumno"

export default function LoginAlumnoPage() {
  const [state, action, isPending] = useActionState(loginConCurp, undefined)

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Panel izquierdo — Identidad institucional ── */}
      <div
        className="hidden md:flex"
        style={{
          flex: "0 0 45%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 44px",
          background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Círculos decorativos de fondo */}
        <div style={{
          position: "absolute", top: -120, right: -80,
          width: 340, height: 340, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -60,
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,212,191,0.12), transparent)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {/* Ícono cerebro / bienestar */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="#2dd4bf" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: 15, lineHeight: 1, margin: 0 }}>
              PsicoScan ML
            </p>
            <p style={{ color: "#a5b4fc", fontSize: 11, margin: "3px 0 0" }}>
              CECyTEN · Plantel Tepic
            </p>
          </div>
        </div>

        {/* Centro — mensaje para alumnos */}
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(45,212,191,0.15)",
            border: "1px solid rgba(45,212,191,0.3)",
            borderRadius: 6,
            padding: "5px 12px",
            marginBottom: 22,
          }}>
            <span style={{
              color: "#2dd4bf", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              Cuestionario SENA
            </span>
          </div>

          <h1 style={{
            color: "white", fontSize: 28, fontWeight: 800,
            lineHeight: 1.25, margin: "0 0 16px",
          }}>
            Tu bienestar emocional nos importa
          </h1>

          <p style={{ color: "#c7d2fe", fontSize: 14, lineHeight: 1.75, margin: 0 }}>
            Este cuestionario nos ayuda a identificar cómo te sientes y brindarte
            el apoyo que necesitas. Es confidencial y solo lo verá el personal de orientación.
          </p>

          <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "32px 0" }} />

          {/* Indicadores del cuestionario */}
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              { valor: "188", label: "Reactivos" },
              { valor: "~20", label: "Minutos" },
              { valor: "100%", label: "Confidencial" },
            ].map(({ valor, label }) => (
              <div key={label}>
                <p style={{ color: "white", fontSize: 24, fontWeight: 800, margin: 0 }}>{valor}</p>
                <p style={{ color: "#818cf8", fontSize: 11, margin: "3px 0 0" }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "32px 0" }} />

          {/* Pasos rápidos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { n: "1", txt: "Ingresa tu CURP para identificarte" },
              { n: "2", txt: "Responde el cuestionario con honestidad" },
              { n: "3", txt: "Recibirás orientación personalizada" },
            ].map(({ n, txt }) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(99,102,241,0.35)",
                  border: "1px solid rgba(165,180,252,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#a5b4fc",
                }}>
                  {n}
                </div>
                <p style={{ color: "#cbd5e1", fontSize: 13, margin: 0 }}>{txt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <p style={{ color: "#4f46e5", fontSize: 11, position: "relative" }}>
          © {new Date().getFullYear()} CECyTEN — Información protegida y confidencial
        </p>
      </div>

      {/* ── Panel derecho — Formulario ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        padding: "40px 24px",
      }}>

        {/* Logo visible solo en móvil */}
        <div className="md:hidden" style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: "0 auto 12px",
            background: "linear-gradient(135deg, #1e1b4b, #312e81)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                 stroke="#2dd4bf" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 18, margin: 0 }}>PsicoScan ML</p>
          <p style={{ color: "#6366f1", fontSize: 12, margin: "4px 0 0" }}>CECyTEN · Plantel Tepic</p>
        </div>

        {/* Tarjeta del formulario */}
        <div style={{
          width: "100%",
          maxWidth: 400,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 40px rgba(0,0,0,0.08)",
          padding: "36px 32px",
          border: "1px solid #e2e8f0",
        }}>

          {/* Encabezado del formulario */}
          <div style={{ marginBottom: 28 }}>
            {/* Ícono alumno */}
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #0d9488, #0f766e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18,
              boxShadow: "0 4px 12px rgba(13,148,136,0.3)",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
              Acceso para alumnos
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              Ingresa tu CURP para acceder al cuestionario SENA
            </p>
          </div>

          {/* Formulario */}
          <form action={action}>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block", fontSize: 13, fontWeight: 600,
                color: "#374151", marginBottom: 8,
              }}>
                CURP
              </label>
              <input
                name="curp"
                type="text"
                maxLength={18}
                placeholder="BADD110313HCMLNS09"
                required
                autoCapitalize="characters"
                style={{
                  textTransform: "uppercase",
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 16px",
                  fontSize: 15, fontFamily: "monospace",
                  letterSpacing: "0.12em", textAlign: "center",
                  border: "1.5px solid #e2e8f0", borderRadius: 10,
                  outline: "none", background: "#f8fafc",
                  color: "#0f172a", transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0d9488"
                  e.target.style.boxShadow = "0 0 0 3px rgba(13,148,136,0.12)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0"
                  e.target.style.boxShadow = "none"
                }}
              />
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "6px 0 0", textAlign: "center" }}>
                18 caracteres · tal como aparece en tu credencial
              </p>
            </div>

            {/* Error */}
            {state?.error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 8, marginBottom: 16,
                background: "#fef2f2", border: "1px solid #fecaca",
                fontSize: 13, color: "#dc2626",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                     style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {state.error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={isPending}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 10,
                border: "none", cursor: isPending ? "not-allowed" : "pointer",
                background: isPending
                  ? "#5eead4"
                  : "linear-gradient(90deg, #0d9488, #0f766e)",
                color: "white", fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.15s, transform 0.1s",
                opacity: isPending ? 0.75 : 1,
                boxShadow: isPending ? "none" : "0 4px 12px rgba(13,148,136,0.3)",
              }}
            >
              {isPending ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="white" strokeWidth="2"
                       style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Verificando…
                </>
              ) : (
                <>
                  Acceder al cuestionario
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Nota confidencialidad */}
          <div style={{
            marginTop: 20, padding: "10px 14px", borderRadius: 8,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                 style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p style={{ fontSize: 12, color: "#15803d", margin: 0, lineHeight: 1.5 }}>
              Tus respuestas son <strong>confidenciales</strong> y solo las verá el personal de orientación del plantel.
            </p>
          </div>
        </div>

        <p style={{ marginTop: 20, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
          ¿Tienes problemas para acceder? Acude con tu orientador/a
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
