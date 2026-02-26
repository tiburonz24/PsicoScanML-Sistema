"use client"

import { useActionState } from "react"
import { loginConCurp } from "@/lib/actions/alumno"

export default function LoginAlumnoPage() {
  const [state, action, isPending] = useActionState(loginConCurp, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
         style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)" }}>

      {/* Círculos decorativos */}
      <div className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full opacity-15 pointer-events-none"
           style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-10 pointer-events-none"
           style={{ background: "radial-gradient(circle, #2dd4bf, transparent)" }} />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Franja superior */}
        <div className="h-2 w-full"
             style={{ background: "linear-gradient(90deg, #2dd4bf, #4f46e5)" }} />

        <div className="px-8 py-8 space-y-6">

          {/* Encabezado */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg"
                 style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}>
              <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24"
                   stroke="white" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#1e1b4b" }}>
                Acceso Alumnos
              </h1>
              <p className="text-sm font-medium mt-0.5" style={{ color: "#0d9488" }}>
                CECyTEN · Cuestionario SENA
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Ingresa tu CURP para continuar
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Formulario */}
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                CURP
              </label>
              <input
                name="curp"
                type="text"
                maxLength={18}
                placeholder="BADD110313HCMLNS09"
                required
                autoCapitalize="characters"
                style={{ textTransform: "uppercase" }}
                className="w-full px-4 py-3 text-sm font-mono tracking-widest border border-gray-200
                           rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400
                           focus:border-transparent placeholder:text-gray-300 placeholder:font-sans
                           placeholder:tracking-normal transition text-center"
              />
              <p className="text-xs text-gray-400 text-center">
                18 caracteres — tal como aparece en tu credencial
              </p>
            </div>

            {state?.error && (
              <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-sm
                              text-red-600 bg-red-50 border border-red-100">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white
                         disabled:opacity-60 transition-all active:scale-95"
              style={{ background: "linear-gradient(90deg, #0d9488, #0f766e)" }}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando…
                </span>
              ) : "Entrar al cuestionario →"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Tus respuestas son confidenciales y solo las verá el personal de orientación
          </p>
        </div>
      </div>
    </div>
  )
}
