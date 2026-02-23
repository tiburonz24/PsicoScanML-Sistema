"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router   = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("Correo o contraseña incorrectos")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#1e1b4b" }}>

      {/* Panel izquierdo — solo desktop */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full opacity-30"
             style={{ backgroundColor: "#4f46e5" }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-72 h-72 rounded-full opacity-20"
             style={{ backgroundColor: "#0d9488" }} />

        <div className="relative z-10 text-center space-y-6 w-full max-w-sm">
          {/* Ícono */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-xl"
               style={{ backgroundColor: "#3730a3" }}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#2dd4bf" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white">PsicoScan ML</h1>
            <p className="mt-2 text-lg" style={{ color: "#a5b4fc" }}>
              Sistema de Bienestar Estudiantil
            </p>
          </div>

          <div className="rounded-2xl p-6 text-left space-y-3"
               style={{ backgroundColor: "rgba(49,46,129,0.6)" }}>
            {[
              "Tamizaje SENA automatizado",
              "Clasificación con inteligencia artificial",
              "Seguimiento de casos prioritarios",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                     style={{ backgroundColor: "#2dd4bf" }} />
                <p className="text-sm" style={{ color: "#c7d2fe" }}>{item}</p>
              </div>
            ))}
          </div>

          <p className="text-sm" style={{ color: "#6366f1" }}>CECyTEN · Plantel Tepic</p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12"
           style={{ backgroundColor: "#f5f3ff" }}>
        <div className="w-full max-w-sm">

          {/* Header mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: "#3730a3" }}>
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#2dd4bf" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#1e1b4b" }}>PsicoScan ML</h1>
            <p className="text-sm mt-1" style={{ color: "#4f46e5" }}>CECyTEN Plantel Tepic</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="hidden lg:block">
              <h2 className="text-xl font-bold" style={{ color: "#1e1b4b" }}>Iniciar sesión</h2>
              <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales institucionales</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="usuario@cecyten.edu.mx"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                             focus:outline-none transition placeholder:text-gray-300"
                  style={{ outline: "none" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #4f46e5")}
                  onBlur={(e)  => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                             focus:outline-none transition"
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #4f46e5")}
                  onBlur={(e)  => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white rounded-xl py-2.5 text-sm font-semibold
                           disabled:opacity-50 transition"
                style={{ backgroundColor: "#4f46e5" }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#4338ca")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#4f46e5")}
              >
                {loading ? "Verificando…" : "Entrar al sistema"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400">
              Sistema exclusivo para personal autorizado de CECyTEN
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
