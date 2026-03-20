"use client"

import { useState, useTransition } from "react"
import { guardarTamizaje } from "@/lib/actions/tamizaje"
import {
  PAGINAS_REACTIVOS,
  TOTAL_REACTIVOS,
  TOTAL_PAGINAS,
} from "@/lib/data/reactivos"

type Props = {
  nombreEstudiante: string
  estudianteId?: string
  esEstudiante?: boolean
  onGuardar?: (respuestas: number[]) => Promise<{ error: string } | undefined>
}

const ESCALA = [
  { valor: 1, corto: "Nunca",   largo: "Nunca o casi nunca" },
  { valor: 2, corto: "Pocas",   largo: "Pocas veces" },
  { valor: 3, corto: "Algunas", largo: "Algunas veces" },
  { valor: 4, corto: "Muchas",  largo: "Muchas veces" },
  { valor: 5, corto: "Siempre", largo: "Siempre o casi siempre" },
]

// Color por valor seleccionado — color del logo (teal/navy)
const COLOR_SELECCIONADO: Record<number, { bg: string; border: string; text: string; shadow: string }> = {
  1: { bg: "#0D475A", border: "#093848", text: "white", shadow: "0 3px 10px rgba(13,71,90,0.35)" },
  2: { bg: "#0D475A", border: "#093848", text: "white", shadow: "0 3px 10px rgba(13,71,90,0.35)" },
  3: { bg: "#0D475A", border: "#093848", text: "white", shadow: "0 3px 10px rgba(13,71,90,0.35)" },
  4: { bg: "#0D475A", border: "#093848", text: "white", shadow: "0 3px 10px rgba(13,71,90,0.35)" },
  5: { bg: "#0D475A", border: "#093848", text: "white", shadow: "0 3px 10px rgba(13,71,90,0.35)" },
}

export default function FormularioCuestionario({
  estudianteId,
  nombreEstudiante,
  esEstudiante = false,
  onGuardar,
}: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})
  const [pagina, setPagina]         = useState(0)
  const [erroresPagina, setErroresPagina] = useState<number[]>([])
  const [errorGlobal, setErrorGlobal]     = useState<string | null>(null)
  const [isPending, startTransition]      = useTransition()

  const reactivosPagina = PAGINAS_REACTIVOS[pagina]
  const totalRespondidos = Object.keys(respuestas).length
  const progreso = Math.round((totalRespondidos / TOTAL_REACTIVOS) * 100)
  const esPaginaFinal = pagina === TOTAL_PAGINAS - 1

  function handleRespuesta(itemId: number, valor: number) {
    setRespuestas((prev) => ({ ...prev, [itemId]: valor }))
    setErroresPagina((prev) => prev.filter((id) => id !== itemId))
  }

  function validarPaginaActual(): boolean {
    const sinResponder = reactivosPagina
      .filter((r) => !respuestas[r.id])
      .map((r) => r.id)
    setErroresPagina(sinResponder)
    return sinResponder.length === 0
  }

  function handleSiguiente() {
    if (validarPaginaActual()) {
      setPagina((p) => p + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function handleAnterior() {
    setErroresPagina([])
    setPagina((p) => p - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleEnviar() {
    if (!validarPaginaActual()) return
    const arr = Array.from({ length: TOTAL_REACTIVOS }, (_, i) => respuestas[i + 1] ?? 0)
    startTransition(async () => {
      let result: { error: string } | undefined
      if (onGuardar) {
        result = await onGuardar(arr)
      } else {
        result = await guardarTamizaje(estudianteId!, arr, esEstudiante)
      }
      if (result?.error) setErrorGlobal(result.error)
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

      {/* ── Tarjeta de progreso ── */}
      <div style={{
        background: "white", borderRadius: 16,
        boxShadow: "0 1px 3px rgba(14,165,233,0.08), 0 4px 16px rgba(14,165,233,0.08)",
        padding: "20px 24px",
        border: "1px solid #bae6fd",
      }}>
        <div className="progreso-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {nombreEstudiante}
            </p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0" }}>
              Cuestionario SENA — Autoinforme Secundaria
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b", margin: 0 }}>
              Pág. {pagina + 1} <span style={{ fontWeight: 400, color: "#94a3b8" }}>/ {TOTAL_PAGINAS}</span>
            </p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "3px 0 0" }}>
              {totalRespondidos}/{TOTAL_REACTIVOS} resp.
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            width: `${progreso}%`,
            background: "linear-gradient(90deg, #0ea5e9, #0284c7)",
            transition: "width 0.4s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <p style={{ fontSize: 11, color: "#cbd5e1", margin: 0 }}>Progreso general</p>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#0284c7", margin: 0 }}>{progreso}% completado</p>
        </div>
      </div>

      {/* ── Instrucción ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        background: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: 12, padding: "12px 16px",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p style={{ fontSize: 14, color: "#1d4ed8", margin: 0, lineHeight: 1.5 }}>
          Lee cada frase y selecciona la opción que mejor describa <strong>con qué frecuencia te ocurre</strong>.
          No hay respuestas correctas ni incorrectas.
        </p>
      </div>

      {/* ── Tarjetas de reactivos ── */}
      {reactivosPagina.map((reactivo) => {
        const sinResponder = erroresPagina.includes(reactivo.id)
        const valorActual  = respuestas[reactivo.id]

        return (
          <div
            key={reactivo.id}
            style={{
              background: "white",
              borderRadius: 10,
              boxShadow: sinResponder
                ? "0 0 0 1.5px #fca5a5"
                : "0 1px 3px rgba(0,0,0,0.06)",
              border: sinResponder ? "1.5px solid #fca5a5" : "1px solid #bae6fd",
              padding: "10px 14px",
              transition: "box-shadow 0.2s, border-color 0.2s",
            }}
          >
            {/* Número + texto */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
              <div style={{
                minWidth: 24, height: 24, borderRadius: 6,
                background: sinResponder
                  ? "linear-gradient(135deg, #fca5a5, #f87171)"
                  : "linear-gradient(135deg, #0284c7, #0ea5e9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "white",
                flexShrink: 0,
              }}>
                {reactivo.id}
              </div>
              <p style={{
                fontSize: 14, color: "#1e293b", margin: 0,
                lineHeight: 1.45, fontWeight: 700,
              }}>
                {reactivo.texto}
                {sinResponder && (
                  <span style={{ marginLeft: 6, fontSize: 11, color: "#ef4444", fontWeight: 500 }}>
                    ⚠ obligatoria
                  </span>
                )}
              </p>
            </div>

            {/* Opciones */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 }}
                 className="opciones-grid">
              {ESCALA.map((e) => {
                const seleccionado = valorActual === e.valor
                const col = seleccionado ? COLOR_SELECCIONADO[e.valor] : null

                return (
                  <button
                    key={e.valor}
                    type="button"
                    onClick={() => handleRespuesta(reactivo.id, e.valor)}
                    title={e.largo}
                    style={{
                      padding: "6px 4px",
                      borderRadius: 8,
                      border: seleccionado ? `1.5px solid ${col!.border}` : "1.5px solid #e2e8f0",
                      background: seleccionado ? col!.bg : "#f8fafc",
                      color: seleccionado ? col!.text : "#64748b",
                      fontWeight: 700,
                      fontSize: 11,
                      cursor: "pointer",
                      textAlign: "center",
                      lineHeight: 1.3,
                      boxShadow: seleccionado ? col!.shadow : "none",
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: "50%",
                      border: seleccionado ? "2px solid rgba(255,255,255,0.6)" : "2px solid #cbd5e1",
                      background: seleccionado ? "rgba(255,255,255,0.25)" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {seleccionado && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                             stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span>{e.corto}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* ── Error de validación ── */}
      {erroresPagina.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 12, padding: "12px 16px",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p style={{ fontSize: 14, color: "#b91c1c", margin: 0, fontWeight: 500 }}>
            Faltan <strong>{erroresPagina.length}</strong> pregunta{erroresPagina.length > 1 ? "s" : ""} por responder en esta página.
          </p>
        </div>
      )}

      {/* ── Error global ── */}
      {errorGlobal && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 12, padding: "12px 16px",
          fontSize: 14, color: "#b91c1c",
        }}>
          {errorGlobal}
        </div>
      )}

      {/* ── Navegación ── */}
      <div className="nav-botones" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 0 24px",
      }}>
        <button
          onClick={handleAnterior}
          disabled={pagina === 0}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 20px", borderRadius: 10,
            border: "1.5px solid #e2e8f0", background: "white",
            fontSize: 14, fontWeight: 500, color: "#475569",
            cursor: pagina === 0 ? "not-allowed" : "pointer",
            opacity: pagina === 0 ? 0.35 : 1,
            transition: "opacity 0.15s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Anterior
        </button>

        {/* Indicador de página */}
        <div className="nav-dots" style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: TOTAL_PAGINAS }).map((_, i) => (
            <div key={i} style={{
              width: i === pagina ? 20 : 6,
              height: 6, borderRadius: 99,
              background: i === pagina ? "#0284c7" : i < pagina ? "#7dd3fc" : "#e2e8f0",
              transition: "all 0.25s ease",
            }} />
          ))}
        </div>

        {esPaginaFinal ? (
          <button
            onClick={handleEnviar}
            disabled={isPending}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 22px", borderRadius: 10, border: "none",
              background: isPending ? "#7dd3fc" : "linear-gradient(90deg, #0ea5e9, #0284c7)",
              color: "white", fontSize: 14, fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              boxShadow: isPending ? "none" : "0 4px 12px rgba(14,165,233,0.35)",
              transition: "all 0.15s",
            }}
          >
            {isPending ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="white" strokeWidth="2"
                     style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Guardando…
              </>
            ) : (
              <>
                Enviar cuestionario
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleSiguiente}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 22px", borderRadius: 10, border: "none",
              background: "linear-gradient(90deg, #0ea5e9, #0284c7)",
              color: "white", fontSize: 14, fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(14,165,233,0.35)",
              transition: "opacity 0.15s",
            }}
          >
            Siguiente
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Tablet (≤ 768px) ── */
        @media (max-width: 768px) {
          .nav-botones button {
            padding: 10px 16px !important;
            font-size: 13px !important;
          }
        }

        /* ── Móvil grande (≤ 480px) ── */
        @media (max-width: 480px) {
          .progreso-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .progreso-header > div:last-child {
            text-align: left !important;
            margin-left: 0 !important;
          }
          .opciones-grid {
            gap: 4px !important;
          }
          .opciones-grid button {
            padding: 5px 2px !important;
            font-size: 10px !important;
            border-radius: 6px !important;
          }
          .nav-botones {
            gap: 8px !important;
          }
          .nav-botones button {
            padding: 9px 12px !important;
            font-size: 12px !important;
          }
          .nav-dots {
            display: none !important;
          }
        }

        /* ── Móvil pequeño (≤ 360px) ── */
        @media (max-width: 360px) {
          .opciones-grid button {
            padding: 4px 1px !important;
            font-size: 9px !important;
          }
          .opciones-grid button > div {
            width: 10px !important;
            height: 10px !important;
          }
        }
      `}</style>
    </div>
  )
}
