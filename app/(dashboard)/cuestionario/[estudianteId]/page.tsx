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
    <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Navegación */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Link href="/cuestionario" style={{ fontSize: 13, color: "#1A7A8A", textDecoration: "none", fontWeight: 500 }}>
          Cuestionario
        </Link>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <span style={{ fontSize: 13, color: "#0D475A", fontWeight: 600 }}>{estudiante.nombre}</span>
      </div>

      <FormularioCuestionario
        estudianteId={estudiante.id}
        nombreEstudiante={estudiante.nombre}
      />
    </div>
  )
}
