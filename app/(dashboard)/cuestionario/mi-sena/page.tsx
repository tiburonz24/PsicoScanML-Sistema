import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getEstudianteById } from "@/lib/data/mock"
import FormularioCuestionario from "@/components/cuestionario/FormularioCuestionario"
import { redirect } from "next/navigation"

export default async function MiSenaPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.estudianteId) redirect("/dashboard")

  const estudiante = await getEstudianteById(session.user.estudianteId)
  if (!estudiante) redirect("/dashboard")

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mi Cuestionario SENA</h1>
        <p className="text-sm text-gray-500 mt-1">
          Lee cada frase con atención y responde con honestidad. No hay respuestas
          correctas ni incorrectas.
        </p>
      </div>

      <FormularioCuestionario
        estudianteId={estudiante.id}
        nombreEstudiante={estudiante.nombre}
        esEstudiante={true}
      />
    </div>
  )
}
