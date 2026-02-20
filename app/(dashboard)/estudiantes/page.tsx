import BadgeSemaforo from "@/components/semaforo/BadgeSemaforo"
import Link from "next/link"
import { getEstudiantes } from "@/lib/data/mock"

export default function EstudiantesPage() {
  const estudiantes = getEstudiantes()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Estudiantes</h1>
        <span className="text-sm text-gray-500">{estudiantes.length} registrados</span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Grado / Grupo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ultimo tamizaje</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Semaforo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {estudiantes.map((est) => {
              const ultimo = est.tamizajes[0]
              return (
                <tr key={est.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{est.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {est.grado} &quot;{est.grupo}&quot;
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {ultimo
                      ? new Date(ultimo.fecha).toLocaleDateString("es-MX")
                      : "Sin tamizaje"}
                  </td>
                  <td className="px-4 py-3">
                    {ultimo ? (
                      <BadgeSemaforo semaforo={ultimo.semaforo} />
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/estudiantes/${est.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Ver expediente
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
