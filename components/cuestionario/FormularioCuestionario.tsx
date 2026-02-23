"use client"

import { useState, useTransition } from "react"
import { guardarTamizaje } from "@/lib/actions/tamizaje"
import {
  PAGINAS_REACTIVOS,
  TOTAL_REACTIVOS,
  TOTAL_PAGINAS,
} from "@/lib/data/reactivos"

type Props = {
  estudianteId: string
  nombreEstudiante: string
  esEstudiante?: boolean
}

const ESCALA = [
  { valor: 1, corto: "Nunca",    largo: "Nunca o casi nunca" },
  { valor: 2, corto: "Pocas",    largo: "Pocas veces" },
  { valor: 3, corto: "Algunas",  largo: "Algunas veces" },
  { valor: 4, corto: "Muchas",   largo: "Muchas veces" },
  { valor: 5, corto: "Siempre",  largo: "Siempre o casi siempre" },
]

export default function FormularioCuestionario({ estudianteId, nombreEstudiante, esEstudiante = false }: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})
  const [pagina, setPagina] = useState(0)
  const [erroresPagina, setErroresPagina] = useState<number[]>([])
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
      const result = await guardarTamizaje(estudianteId, arr, esEstudiante)
      if (result?.error) setErrorGlobal(result.error)
    })
  }

  return (
    <div className="space-y-4">

      {/* Encabezado con progreso */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-700">{nombreEstudiante}</p>
            <p className="text-xs text-gray-400">Cuestionario SENA — Autoinforme Secundaria</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">
              Página {pagina + 1} de {TOTAL_PAGINAS}
            </p>
            <p className="text-xs text-gray-400">{totalRespondidos} / {TOTAL_REACTIVOS} respondidos</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">{progreso}% completado</p>
      </div>

      {/* Instrucción */}
      <p className="text-sm text-gray-500 px-1">
        Lee cada frase y marca la opción que mejor describa con qué frecuencia te ocurre.
      </p>

      {/* Tabla de reactivos */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-full">
                Reactivo
              </th>
              {ESCALA.map((e) => (
                <th
                  key={e.valor}
                  className="px-3 py-3 text-center font-medium text-gray-500 min-w-[72px] text-xs"
                >
                  {e.corto}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reactivosPagina.map((reactivo) => {
              const sinResponder = erroresPagina.includes(reactivo.id)
              return (
                <tr
                  key={reactivo.id}
                  className={sinResponder ? "bg-red-50" : "hover:bg-gray-50"}
                >
                  <td className="px-4 py-3 text-gray-800">
                    <span className="text-gray-400 text-xs mr-2">{reactivo.id}.</span>
                    {reactivo.texto}
                    {sinResponder && (
                      <span className="ml-2 text-xs text-red-500">← obligatorio</span>
                    )}
                  </td>
                  {ESCALA.map((e) => (
                    <td key={e.valor} className="px-3 py-3 text-center">
                      <label className="cursor-pointer" title={e.largo}>
                        <input
                          type="radio"
                          name={`reactivo-${reactivo.id}`}
                          value={e.valor}
                          checked={respuestas[reactivo.id] === e.valor}
                          onChange={() => handleRespuesta(reactivo.id, e.valor)}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </label>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Error de validación */}
      {erroresPagina.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Faltan {erroresPagina.length} reactivo(s) por responder en esta página.
        </div>
      )}

      {/* Error global */}
      {errorGlobal && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {errorGlobal}
        </div>
      )}

      {/* Navegación */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleAnterior}
          disabled={pagina === 0}
          className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600
                     hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        {esPaginaFinal ? (
          <button
            onClick={handleEnviar}
            disabled={isPending}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Guardando…" : "Enviar cuestionario"}
          </button>
        ) : (
          <button
            onClick={handleSiguiente}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium
                       hover:bg-blue-700"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  )
}
