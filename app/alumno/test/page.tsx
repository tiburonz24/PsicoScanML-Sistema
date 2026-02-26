import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { guardarRespuestasAlumno } from "@/lib/actions/alumno"
import FormularioCuestionario from "@/components/cuestionario/FormularioCuestionario"

export default async function TestAlumnoPage() {
  // Verificar sesión por cookie
  const jar = await cookies()
  const alumnoId = jar.get("alumno_id")?.value
  if (!alumnoId) redirect("/alumno/login")

  let estudiante: { id: string; nombre: string; grado: string; grupo: string } | null = null
  try {
    estudiante = await prisma.estudiante.findUnique({
      where: { id: alumnoId },
      select: { id: true, nombre: true, grado: true, grupo: true },
    })
  } catch {
    redirect("/alumno/login")
  }

  if (!estudiante) redirect("/alumno/login")

  const accionGuardar = guardarRespuestasAlumno.bind(null, estudiante.id)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Encabezado */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
               style={{ background: "linear-gradient(135deg, #0d9488, #4f46e5)" }}>
            <span className="text-white text-xs font-bold">PS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {estudiante.nombre}
            </p>
            <p className="text-xs text-gray-400">
              {estudiante.grado} &quot;{estudiante.grupo}&quot; · CECyTEN Plantel Tepic
            </p>
          </div>
          <span className="text-xs text-teal-600 bg-teal-50 border border-teal-200
                           px-2.5 py-1 rounded-full font-medium shrink-0">
            En curso
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-4">
        {/* Aviso de confidencialidad */}
        <div className="rounded-xl px-4 py-3 text-sm"
             style={{ background: "#eff6ff", borderLeft: "4px solid #3b82f6" }}>
          <p className="font-medium text-blue-800">Tus respuestas son completamente confidenciales.</p>
          <p className="text-blue-700 mt-0.5">
            Solo el equipo de orientación y psicología de tu plantel tendrá acceso.
            Responde con sinceridad — no hay respuestas correctas ni incorrectas.
          </p>
        </div>

        <FormularioCuestionario
          nombreEstudiante={estudiante.nombre}
          onGuardar={accionGuardar}
        />
      </main>
    </div>
  )
}
