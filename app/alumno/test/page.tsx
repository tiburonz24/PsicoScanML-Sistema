import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { guardarRespuestasAlumno } from "@/lib/actions/alumno"
import FormularioCuestionario from "@/components/cuestionario/FormularioCuestionario"

export default async function TestAlumnoPage() {
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
    <div style={{ minHeight: "100vh", background: "#f0f9ff", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Header sticky ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "#0c4a6e",
        borderBottom: "1px solid #075985",
        boxShadow: "0 2px 8px rgba(12,74,110,0.25)",
      }}>
        <div style={{
          maxWidth: 780, margin: "0 auto",
          padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          {/* Logo */}
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="#7dd3fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>

          {/* Info estudiante */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {estudiante.nombre}
            </p>
            <p style={{ fontSize: 12, color: "#7dd3fc", margin: "2px 0 0" }}>
              {estudiante.grado} &quot;{estudiante.grupo}&quot; · CECyTEN Plantel Tepic
            </p>
          </div>

          {/* Badge estado */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)",
            borderRadius: 99, padding: "5px 12px", flexShrink: 0,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 0 2px rgba(74,222,128,0.3)",
            }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4ade80" }}>En curso</span>
          </div>
        </div>
      </header>

      {/* ── Contenido principal ── */}
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "16px 10px 48px" }}
            className="test-main">

        {/* Aviso confidencialidad */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 12,
          background: "white",
          border: "1px solid #bae6fd",
          borderLeft: "4px solid #0ea5e9",
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 20,
          boxShadow: "0 1px 3px rgba(14,165,233,0.08)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0c4a6e", margin: "0 0 3px" }}>
              Tus respuestas son completamente confidenciales
            </p>
            <p style={{ fontSize: 13, color: "#0284c7", margin: 0, lineHeight: 1.5 }}>
              Solo el equipo de orientación y psicología de tu plantel tendrá acceso.
              Responde con sinceridad — no hay respuestas correctas ni incorrectas.
            </p>
          </div>
        </div>

        <FormularioCuestionario
          nombreEstudiante={estudiante.nombre}
          onGuardar={accionGuardar}
        />
      </main>

      <style>{`
        @media (min-width: 480px) {
          .test-main { padding: 24px 16px 48px !important; }
        }
        @media (min-width: 768px) {
          .test-main { padding: 28px 24px 64px !important; }
        }
      `}</style>
    </div>
  )
}
