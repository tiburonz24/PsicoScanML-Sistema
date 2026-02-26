"use client"

import { useState, useActionState } from "react"
import { registrarEstudiante } from "@/lib/actions/estudiante"

export default function ModalNuevoEstudiante() {
  const [abierto, setAbierto] = useState(false)
  const [state, action, isPending] = useActionState(registrarEstudiante, undefined)

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg
                   hover:bg-green-700 transition"
      >
        + Nuevo estudiante
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fondo oscuro */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAbierto(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Registrar estudiante</h2>
              <button
                onClick={() => setAbierto(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form action={action} className="space-y-4">
              {/* Nombre / ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre / ID del estudiante
                </label>
                <input
                  name="nombre"
                  type="text"
                  placeholder="Ej. A. B. C. o nombre completo"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CURP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CURP
                </label>
                <input
                  name="curp"
                  type="text"
                  maxLength={18}
                  placeholder="BADD110313HCMLNS09"
                  required
                  style={{ textTransform: "uppercase" }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                             font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">18 caracteres, se convierte a mayúsculas automáticamente.</p>
              </div>

              {/* Edad y Sexo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                  <input
                    name="edad"
                    type="number"
                    min={10}
                    max={20}
                    placeholder="15"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select
                    name="sexo"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              {/* Grado y Grupo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                  <select
                    name="grado"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="1°">1°</option>
                    <option value="2°">2°</option>
                    <option value="3°">3°</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                  <input
                    name="grupo"
                    type="text"
                    maxLength={2}
                    placeholder="A"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Escuela */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Escuela</label>
                <input
                  name="escuela"
                  type="text"
                  defaultValue="CECyTEN Plantel Tepic"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Error */}
              {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm
                             rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium
                             rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {isPending ? "Guardando…" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
