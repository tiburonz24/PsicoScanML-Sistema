import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { guardarRespuestasPublico } from "@/lib/actions/respuestas"
import FormularioCuestionario from "@/components/cuestionario/FormularioCuestionario"
import Image from "next/image"

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
    <div style={{ minHeight: "100vh", background: "#F4F8FA", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── Header ── */}
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
          <Image
            src="/logo.png"
            alt="PsicoScan ML"
            width={36}
            height={36}
            style={{ borderRadius: 8, background: "white", padding: 2, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {estudiante.nombre}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: "2px 0 0" }}>
              {estudiante.grado} &quot;{estudiante.grupo}&quot; · CECyTEN Plantel Tepic
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)",
            borderRadius: 99, padding: "5px 12px",
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#4ade80",
              boxShadow: "0 0 0 2px rgba(74,222,128,0.3)",
            }} />
            <span className="header-badge-txt" style={{ fontSize: 12, fontWeight: 600, color: "#4ade80" }}>En curso</span>
          </div>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "16px 10px 48px" }} className="tamizaje-main">

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
          nombreEstudiante={`${estudiante.nombre} — ${estudiante.grado} "${estudiante.grupo}"`}
          onGuardar={accionGuardar}
        />
      </main>

      <style>{`
        @media (min-width: 480px) { .tamizaje-main { padding: 24px 16px 48px !important; } }
        @media (min-width: 768px) { .tamizaje-main { padding: 28px 24px 64px !important; } }
        @media (max-width: 360px) { .header-badge-txt { display: none !important; } }
      `}</style>
    </div>
  )
}
