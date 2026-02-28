import { getEstudiantes } from "@/lib/data/mock"
import ModalNuevoEstudiante from "@/components/cuestionario/ModalNuevoEstudiante"
import BannerEnlace from "@/components/cuestionario/BannerEnlace"
import TablaEstudiantes from "@/components/cuestionario/TablaEstudiantes"
import type { FilaEstudiante } from "@/components/cuestionario/TablaEstudiantes"
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

  // Serializar datos para el componente cliente (sin Date objects)
  const filas: FilaEstudiante[] = estudiantes.map((est) => {
    const ultimo = est.tamizajes[0]
    return {
      id:             est.id,
      nombre:         est.nombre,
      gradoGrupo:     `${est.grado} "${est.grupo}"`,
      semaforo:       ultimo?.semaforo ?? null,
      fechaFormateada: ultimo
        ? new Date(ultimo.fecha).toLocaleDateString("es-MX")
        : null,
    }
  })

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

      <TablaEstudiantes filas={filas} />
    </div>
  )
}
