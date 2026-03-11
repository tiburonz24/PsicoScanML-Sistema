"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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
      setError("Usuario o contraseña incorrectos.")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>

      {/* ── Panel izquierdo — Identidad institucional ── */}
      <div
        style={{
          flex: "0 0 42%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 40px",
          background: "linear-gradient(160deg, #0D475A 0%, #1A7A8A 60%, #2ABFBF 100%)",
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Image
            src="/logo.png"
            alt="PsicoScan ML"
            width={56}
            height={56}
            style={{ borderRadius: 12, background: "white", padding: 3, flexShrink: 0 }}
          />
          <div>
            <p style={{ color: "white", fontWeight: 800, fontSize: 18, lineHeight: 1.1, fontFamily: "var(--font-syne), sans-serif" }}>
              Psico<span style={{ color: "#A7F3F3" }}>Scan</span> ML
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 3 }}>CECyTEN · Plantel Tepic</p>
          </div>
        </div>

        {/* Centro — mensaje principal */}
        <div>
          <div style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 6,
            padding: "4px 12px",
            marginBottom: 20,
          }}>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Sistema de Bienestar Estudiantil
            </span>
          </div>

          <h1 style={{ color: "white", fontSize: 30, fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", fontFamily: "var(--font-syne), sans-serif" }}>
            Acompañando el bienestar emocional del plantel
          </h1>

          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Plataforma de tamizaje SENA con clasificación por inteligencia artificial
            para la detección temprana de riesgos en estudiantes de bachillerato.
          </p>

          {/* Separador */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "32px 0" }} />

          {/* Stats */}
          <div style={{ display: "flex", gap: 32 }}>
            {[
              { valor: "188", label: "Reactivos SENA" },
              { valor: "4",   label: "Niveles de riesgo" },
              { valor: "ML",  label: "Clasificación IA" },
            ].map(({ valor, label }) => (
              <div key={label}>
                <p style={{ color: "white", fontSize: 22, fontWeight: 800, margin: 0, fontFamily: "var(--font-syne), sans-serif" }}>{valor}</p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, margin: "2px 0 0" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pie del panel */}
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
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
        background: "#F4F8FA",
        padding: "40px 24px",
      }}>

        {/* Logo visible solo en móvil */}
        <div className="md:hidden" style={{ marginBottom: 32, textAlign: "center" }}>
          <Image
            src="/logo.png"
            alt="PsicoScan ML"
            width={72}
            height={72}
            style={{ borderRadius: 14, margin: "0 auto 10px", display: "block" }}
          />
          <p style={{ fontWeight: 800, color: "#0D475A", fontSize: 18, fontFamily: "var(--font-syne), sans-serif" }}>
            Psico<span style={{ color: "#2ABFBF" }}>Scan</span> ML
          </p>
          <p style={{ color: "#1A7A8A", fontSize: 12, marginTop: 2 }}>CECyTEN · Plantel Tepic</p>
        </div>

        {/* Tarjeta del formulario */}
        <div style={{
          width: "100%",
          maxWidth: 380,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.08)",
          padding: "36px 32px",
          border: "1px solid #dce8ec",
        }}>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0D475A", margin: "0 0 6px", fontFamily: "var(--font-syne), sans-serif" }}>
              Iniciar sesión
            </h2>
            <p style={{ fontSize: 13, color: "#4A5568", margin: 0 }}>
              Ingresa tus credenciales de acceso al sistema
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Campo usuario */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Usuario
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="Tu nombre de usuario"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 14px", fontSize: 14,
                  border: "1.5px solid #dce8ec", borderRadius: 8,
                  outline: "none", background: "#F4F8FA",
                  color: "#0D475A", transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2ABFBF")}
                onBlur={(e) => (e.target.style.borderColor = "#dce8ec")}
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
                    border: "1.5px solid #dce8ec", borderRadius: 8,
                    outline: "none", background: "#F4F8FA",
                    color: "#0D475A", transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2ABFBF")}
                  onBlur={(e) => (e.target.style.borderColor = "#dce8ec")}
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
                background: loading ? "#1A7A8A" : "linear-gradient(90deg, #0D475A, #1A7A8A)",
                color: "white", fontSize: 14, fontWeight: 600,
                transition: "opacity 0.15s",
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
