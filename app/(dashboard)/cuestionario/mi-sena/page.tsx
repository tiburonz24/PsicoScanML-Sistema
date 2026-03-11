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
    <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: 22, fontWeight: 800, color: "#0D475A", margin: "0 0 4px" }}>
          Mi Cuestionario SENA
        </h1>
        <p style={{ fontSize: 13, color: "#4A5568", margin: 0 }}>
          Lee cada frase con atención y responde con honestidad. No hay respuestas correctas ni incorrectas.
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
