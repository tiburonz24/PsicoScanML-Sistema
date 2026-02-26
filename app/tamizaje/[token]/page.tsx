import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { guardarRespuestasPublico } from "@/lib/actions/respuestas"
import FormularioCuestionario from "@/components/cuestionario/FormularioCuestionario"

type Props = { params: Promise<{ token: string }> }

export default async function TamizajePublicoPage({ params }: Props) {
  const { token } = await params

  let estudiante: { id: string; nombre: string; grado: string; grupo: string } | null = null
  try {
    estudiante = await prisma.estudiante.findUnique({
      where: { tokenEncuesta: token },
      select: { id: true, nombre: true, grado: true, grupo: true },
    })
  } catch {
    // DB no disponible
  }

  if (!estudiante) notFound()

  const accionGuardar = guardarRespuestasPublico.bind(null, estudiante.id, token)

  return (
    <div className="min-h-screen bg-[#f5f3ff]">
      {/* Encabezado institucional */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">PS</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">PsicoScan ML</p>
            <p className="text-xs text-gray-400">CECyTEN — Cuestionario SENA</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Aviso de confidencialidad */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
          <strong>Este cuestionario es confidencial.</strong> Tus respuestas solo serán
          vistas por el equipo de orientación y psicología de tu plantel. Responde con
          sinceridad — no hay respuestas correctas ni incorrectas.
        </div>

        <FormularioCuestionario
          nombreEstudiante={`${estudiante.nombre} — ${estudiante.grado} "${estudiante.grupo}"`}
          onGuardar={accionGuardar}
        />
      </main>
    </div>
  )
}
