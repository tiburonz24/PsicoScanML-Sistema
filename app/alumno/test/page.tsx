import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { guardarRespuestasAlumno } from "@/lib/actions/alumno"
import FormularioCuestionario from "@/components/cuestionario/FormularioCuestionario"
import Image from "next/image"

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

  // Segunda capa: si ya contestó, redirigir a gracias
  try {
    const tamizaje = await prisma.tamizaje.findFirst({
      where: { estudianteId: estudiante.id },
      select: { semaforo: true, itemsCriticos: true },
    })
    if (tamizaje) {
      const criticos = Array.isArray(tamizaje.itemsCriticos)
        ? (tamizaje.itemsCriticos as unknown[]).length
        : 0
      redirect(`/alumno/gracias?s=${tamizaje.semaforo}&c=${criticos}`)
    }
  } catch {
    // No bloqueante — si falla la verificación, dejamos continuar
  }

  const accionGuardar = guardarRespuestasAlumno.bind(null, estudiante.id)

  return (
    <div style={{ minHeight: "100vh", background: "#F4F8FA", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Header sticky ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "#0D475A",
        borderBottom: "1px solid #1A7A8A",
        boxShadow: "0 2px 8px rgba(13,71,90,0.25)",
      }}>
        <div style={{
          maxWidth: 780, margin: "0 auto",
          padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="PsicoScan ML"
            width={38}
            height={38}
            style={{ borderRadius: 8, background: "white", padding: 2, flexShrink: 0 }}
          />

          {/* Info estudiante */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {estudiante.nombre}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: "2px 0 0" }}>
              {estudiante.grado} &quot;{estudiante.grupo}&quot; · CECyTEN Plantel Tepic
            </p>
          </div>

          {/* Badge estado */}
          <div className="badge-encurso" style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)",
            borderRadius: 99, padding: "5px 12px", flexShrink: 0,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 0 2px rgba(74,222,128,0.3)",
              flexShrink: 0,
            }} />
            <span className="badge-texto" style={{ fontSize: 12, fontWeight: 600, color: "#4ade80" }}>En curso</span>
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
          border: "1px solid rgba(42,191,191,0.3)",
          borderLeft: "4px solid #2ABFBF",
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 20,
          boxShadow: "0 1px 3px rgba(13,71,90,0.06)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="#1A7A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0D475A", margin: "0 0 3px" }}>
              Tus respuestas son completamente confidenciales
            </p>
            <p style={{ fontSize: 13, color: "#1A7A8A", margin: 0, lineHeight: 1.5 }}>
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
        /* ── Contenido principal ── */
        @media (min-width: 480px) {
          .test-main { padding: 24px 16px 48px !important; }
        }
        @media (min-width: 768px) {
          .test-main { padding: 28px 24px 64px !important; }
        }

        /* ── Header: ocultar texto del badge en pantallas muy pequeñas ── */
        @media (max-width: 360px) {
          .badge-texto { display: none !important; }
          .badge-encurso { padding: 6px 8px !important; }
        }
      `}</style>
    </div>
  )
}
