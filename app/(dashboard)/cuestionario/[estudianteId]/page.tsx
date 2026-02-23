import { notFound } from "next/navigation"
import { getEstudianteById } from "@/lib/data/mock"
import FormularioCuestionario from "@/components/cuestionario/FormularioCuestionario"
import Link from "next/link"

type Props = { params: Promise<{ estudianteId: string }> }

export default async function AplicarCuestionarioPage({ params }: Props) {
  const { estudianteId } = await params
  const estudiante = await getEstudianteById(estudianteId)
  if (!estudiante) notFound()

  return (
    <div className="max-w-4xl space-y-4">
      {/* Navegación */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/cuestionario" className="hover:underline">
          Cuestionario
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{estudiante.nombre}</span>
      </div>

      <FormularioCuestionario
        estudianteId={estudiante.id}
        nombreEstudiante={estudiante.nombre}
      />
    </div>
  )
}
