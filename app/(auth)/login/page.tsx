"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("Correo o contraseña incorrectos.")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Panel izquierdo — Identidad institucional ── */}
      <div
        style={{
          flex: "0 0 42%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 40px",
          background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #1e40af 100%)",
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="#2dd4bf" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: 15, lineHeight: 1 }}>PsicoScan ML</p>
            <p style={{ color: "#a5b4fc", fontSize: 11, marginTop: 2 }}>CECyTEN · Plantel Tepic</p>
          </div>
        </div>

        {/* Centro — mensaje principal */}
        <div>
          <div style={{
            display: "inline-block",
            background: "rgba(99,102,241,0.3)",
            border: "1px solid rgba(165,180,252,0.3)",
            borderRadius: 6,
            padding: "4px 10px",
            marginBottom: 20,
          }}>
            <span style={{ color: "#a5b4fc", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Sistema de Bienestar Estudiantil
            </span>
          </div>

          <h1 style={{ color: "white", fontSize: 30, fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px" }}>
            Acompañando el bienestar emocional del plantel
          </h1>

          <p style={{ color: "#c7d2fe", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Plataforma de tamizaje SENA con clasificación por inteligencia artificial
            para la detección temprana de riesgos en estudiantes de bachillerato.
          </p>

          {/* Separador */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.12)", margin: "32px 0" }} />

          {/* Stats / indicadores */}
          <div style={{ display: "flex", gap: 32 }}>
            {[
              { valor: "188", label: "Reactivos SENA" },
              { valor: "4",   label: "Niveles de riesgo" },
              { valor: "ML",  label: "Clasificación IA" },
            ].map(({ valor, label }) => (
              <div key={label}>
                <p style={{ color: "white", fontSize: 22, fontWeight: 800, margin: 0 }}>{valor}</p>
                <p style={{ color: "#818cf8", fontSize: 11, margin: "2px 0 0" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pie del panel */}
        <p style={{ color: "#6366f1", fontSize: 11 }}>
          © {new Date().getFullYear()} CECyTEN — Uso exclusivo del personal autorizado
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
            width: 48, height: 48, borderRadius: 12, margin: "0 auto 10px",
            background: "linear-gradient(135deg, #4f46e5, #3730a3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                 stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 18 }}>PsicoScan ML</p>
          <p style={{ color: "#6366f1", fontSize: 12 }}>CECyTEN · Plantel Tepic</p>
        </div>

        {/* Tarjeta del formulario */}
        <div style={{
          width: "100%",
          maxWidth: 380,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.08)",
          padding: "36px 32px",
          border: "1px solid #e2e8f0",
        }}>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
              Iniciar sesión
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Ingresa tus credenciales de acceso al sistema
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Campo correo */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="usuario@cecyten.edu.mx"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 14px", fontSize: 14,
                  border: "1.5px solid #e2e8f0", borderRadius: 8,
                  outline: "none", background: "#f8fafc",
                  color: "#0f172a", transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Campo contraseña */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "10px 40px 10px 14px", fontSize: 14,
                    border: "1.5px solid #e2e8f0", borderRadius: 8,
                    outline: "none", background: "#f8fafc",
                    color: "#0f172a", transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    color: "#94a3b8",
                  }}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 8, marginBottom: 16,
                background: "#fef2f2", border: "1px solid #fecaca",
                fontSize: 13, color: "#dc2626",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "11px 0", borderRadius: 8,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "#a5b4fc" : "linear-gradient(90deg, #4f46e5, #4338ca)",
                color: "white", fontSize: 14, fontWeight: 600,
                transition: "opacity 0.15s, transform 0.1s",
                opacity: loading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                       style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Verificando…
                </>
              ) : "Entrar al sistema"}
            </button>

          </form>
        </div>

        <p style={{ marginTop: 20, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
          Acceso exclusivo para personal autorizado · CECyTEN
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) { .hidden { display: none !important; } }
      `}</style>
    </div>
  )
}
