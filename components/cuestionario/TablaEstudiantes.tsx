"use client"

import BadgeSemaforo from "@/components/semaforo/BadgeSemaforo"
import { Semaforo } from "@/lib/enums"

export type FilaEstudiante = {
  id: string
  nombre: string
  gradoGrupo: string
  semaforo: string | null
  fechaFormateada: string | null
}

export default function TablaEstudiantes({ filas }: { filas: FilaEstudiante[] }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Estudiante</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Grado / Grupo</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Último tamizaje</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filas.map((est) => (
            <tr key={est.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-900">{est.nombre}</td>
              <td className="px-4 py-3 text-gray-600">{est.gradoGrupo}</td>
              <td className="px-4 py-3">
                {est.semaforo && est.fechaFormateada ? (
                  <div className="flex items-center gap-2">
                    <BadgeSemaforo semaforo={est.semaforo as Semaforo} />
                    <span className="text-xs text-gray-400">{est.fechaFormateada}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Sin tamizaje</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
