import { getEstudianteById } from "@/lib/data/mock"
import { notFound } from "next/navigation"
import Link from "next/link"

type Props = { params: Promise<{ estudianteId: string }> }

export default async function CuestionarioCompletadoPage({ params }: Props) {
  const { estudianteId } = await params
  const estudiante = await getEstudianteById(estudianteId)
  if (!estudiante) notFound()

  return (
    <div className="max-w-lg mx-auto mt-10 text-center space-y-6">
      <div className="bg-white rounded-2xl shadow p-10 space-y-4">
        {/* Ícono de éxito */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">Cuestionario completado</h1>
          <p className="text-sm text-gray-500 mt-1">
            Las respuestas de <span className="font-medium text-gray-700">{estudiante.nombre}</span> fueron registradas.
          </p>
        </div>

        {/* Estado pendiente ML */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 text-left">
          <p className="font-medium">Clasificación pendiente</p>
          <p className="text-xs mt-1 text-yellow-700">
            Las respuestas serán procesadas por el modelo ML cuando esté disponible.
            El expediente se actualizará automáticamente con los resultados.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href={`/estudiantes/${estudianteId}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                       hover:bg-blue-700 transition"
          >
            Ver expediente del estudiante
          </Link>
          <Link
            href="/cuestionario"
            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg
                       hover:bg-gray-50 transition"
          >
            Aplicar otro cuestionario
          </Link>
        </div>
      </div>
    </div>
  )
}
