import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Rol } from "@/lib/enums"
import FormNuevoEstudiante from "@/components/estudiantes/FormNuevoEstudiante"

const ROLES_PERMITIDOS: Rol[] = [Rol.ADMIN, Rol.PSICOLOGO, Rol.ORIENTADOR]

export default async function NuevoEstudiantePage() {
  const session = await getServerSession(authOptions)
  if (!session || !ROLES_PERMITIDOS.includes(session.user.rol as Rol)) redirect("/dashboard")

  return (
    <div style={{ maxWidth: 860 }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
        <Link href="/estudiantes" style={{ fontSize: 13, color: "#1A7A8A", textDecoration: "none", fontWeight: 500 }}>
          Estudiantes
        </Link>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
             stroke="#cbd5e1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span style={{ fontSize: 13, color: "#0D475A", fontWeight: 600 }}>Nuevo registro</span>
      </div>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #0D475A 0%, #1A7A8A 100%)",
        borderRadius: 14, padding: "22px 28px",
        display: "flex", alignItems: "center", gap: 16,
        marginBottom: 28,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
               stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx={12} cy={7} r={4} />
            <line x1={12} y1={12} x2={12} y2={18} />
            <line x1={9} y1={15} x2={15} y2={15} />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: "0 0 4px", fontFamily: "var(--font-syne), sans-serif" }}>
            Registrar nuevo estudiante
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0 }}>
            CECyTEN Plantel Tepic · Llena todos los campos marcados con *
          </p>
        </div>
      </div>

      {/* ── Formulario ── */}
      <div className="nuevo-form-card" style={{
        background: "white", borderRadius: 14,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        padding: "28px 32px",
      }}>
        <FormNuevoEstudiante />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nuevo-form-card { padding: 20px 16px !important; border-radius: 12px !important; }
        }
      `}</style>
    </div>
  )
}
