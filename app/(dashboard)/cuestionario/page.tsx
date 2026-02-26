import { getEstudiantes } from "@/lib/data/mock"
import BadgeSemaforo from "@/components/semaforo/BadgeSemaforo"
import ModalNuevoEstudiante from "@/components/cuestionario/ModalNuevoEstudiante"
import BannerEnlace from "@/components/cuestionario/BannerEnlace"
import Link from "next/link"
import { headers } from "next/headers"

type Props = { searchParams: Promise<{ registrado?: string; token?: string; nombre?: string }> }

export default async function CuestionarioPage({ searchParams }: Props) {
  const { registrado, token, nombre } = await searchParams
  const estudiantes = await getEstudiantes()

  // Construir URL base para el enlace público
  const hdrs = await headers()
  const host = hdrs.get("host") ?? "localhost:3000"
  const protocol = host.startsWith("localhost") ? "http" : "https"
  const baseUrl = `${protocol}://${host}`

  const enlace = token ? `${baseUrl}/tamizaje/${token}` : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cuestionario SENA</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registra estudiantes y genera su enlace de cuestionario
          </p>
        </div>
        <ModalNuevoEstudiante />
      </div>

      {/* Banner de enlace generado */}
      {registrado && enlace && nombre && (
        <BannerEnlace nombre={decodeURIComponent(nombre)} enlace={enlace} />
      )}

      {/* Banner simple sin token (por si acaso) */}
      {registrado && !enlace && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          Estudiante registrado correctamente.
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estudiante</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Grado / Grupo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Último tamizaje</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
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
                  <td className="px-4 py-3">
                    {ultimo ? (
                      <div className="flex items-center gap-2">
                        <BadgeSemaforo semaforo={ultimo.semaforo} />
                        <span className="text-xs text-gray-400">
                          {new Date(ultimo.fecha).toLocaleDateString("es-MX")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin tamizaje</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/cuestionario/${est.id}`}
                      className="inline-block px-3 py-1.5 bg-blue-600 text-white text-xs
                                 font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      Aplicar SENA
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
