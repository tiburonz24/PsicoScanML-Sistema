import GraficaSemaforos from "@/components/dashboard/GraficaSemaforos"
import GraficaTiposCaso from "@/components/dashboard/GraficaTiposCaso"
import {
  getResumenSemaforos,
  getResumenTiposCaso,
  getTotalEstudiantes,
  getTotalUrgentes,
} from "@/lib/data/mock"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Rol } from "@/lib/enums"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.rol === Rol.ESTUDIANTE) redirect("/cuestionario/mi-sena")

  const [semaforos, tiposCaso, totalEstudiantes, urgentes, totalRespuestas] = await Promise.all([
    getResumenSemaforos(),
    getResumenTiposCaso(),
    getTotalEstudiantes(),
    getTotalUrgentes(),
    prisma.respuestasCuestionario.count(),
  ])
  const totalTamizajes = semaforos.reduce((acc, s) => acc + s.total, 0)

  const nombre = session?.user?.name ?? "Usuario"
  const hora   = new Date().getHours()
  const saludo = hora < 13 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches"

  const fecha = new Date().toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })

  const CARDS = [
    {
      label:   "Estudiantes registrados",
      valor:   totalEstudiantes,
      href:    "/estudiantes",
      color:   "#4f46e5",
      bg:      "#eef2ff",
      icono: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      label:   "Tamizajes aplicados",
      valor:   totalTamizajes,
      href:    "/estudiantes",
      color:   "#0891b2",
      bg:      "#ecfeff",
      icono: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      label:   "Respuestas del portal",
      valor:   totalRespuestas,
      href:    "/respuestas",
      color:   "#7c3aed",
      bg:      "#f5f3ff",
      icono: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      label:   "Casos urgentes",
      valor:   urgentes,
      href:    "/estudiantes",
      color:   urgentes > 0 ? "#dc2626" : "#16a34a",
      bg:      urgentes > 0 ? "#fef2f2" : "#f0fdf4",
      icono: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke={urgentes > 0 ? "#dc2626" : "#16a34a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ]

  return (
    <div style={{ paddingTop: 8 }}>

      {/* ── Cabecera ── */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        borderRadius: 16,
        padding: "28px 32px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <p style={{ color: "#a5b4fc", fontSize: 13, marginBottom: 4 }}>
            {saludo}, <strong style={{ color: "white" }}>{nombre}</strong>
          </p>
          <h1 style={{ color: "white", fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>
            Salud Mental del Plantel
          </h1>
          <p style={{ color: "#818cf8", fontSize: 13, margin: 0 }}>CECyTEN Tepic · {fecha}</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/cuestionario" style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8, padding: "8px 16px",
            color: "white", fontSize: 13, fontWeight: 600,
            textDecoration: "none", whiteSpace: "nowrap",
          }}>
            + Nuevo registro
          </Link>
          <Link href="/respuestas" style={{
            background: "#4f46e5",
            borderRadius: 8, padding: "8px 16px",
            color: "white", fontSize: 13, fontWeight: 600,
            textDecoration: "none", whiteSpace: "nowrap",
            border: "1px solid #4338ca",
          }}>
            Ver respuestas
          </Link>
        </div>
      </div>

      {/* ── Tarjetas de métricas ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}>
        {CARDS.map(({ label, valor, href, color, bg, icono }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "white",
              borderRadius: 14,
              padding: "20px 22px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              transition: "transform 0.15s, box-shadow 0.15s",
              cursor: "pointer",
            }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: bg, display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {icono}
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px", fontWeight: 500 }}>
                  {label}
                </p>
                <p style={{ fontSize: 30, fontWeight: 800, color, margin: 0, lineHeight: 1 }}>
                  {valor}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Alerta urgente ── */}
      {urgentes > 0 && (
        <Link href="/estudiantes" style={{ textDecoration: "none", display: "block", marginBottom: 24 }}>
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderLeft: "4px solid #dc2626",
            borderRadius: 12,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#991b1b" }}>
                {urgentes} {urgentes === 1 ? "caso requiere" : "casos requieren"} atención inmediata
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#b91c1c" }}>
                Haz clic para revisar los expedientes marcados como URGENTE
              </p>
            </div>
            <span style={{ color: "#dc2626", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
              Ver ahora →
            </span>
          </div>
        </Link>
      )}

      {/* ── Gráficas ── */}
      <div style={{ marginBottom: 8 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: "#94a3b8",
          letterSpacing: "0.08em", textTransform: "uppercase",
          marginBottom: 14,
        }}>
          Distribución del plantel
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}>
          <GraficaSemaforos data={semaforos} />
          <GraficaTiposCaso data={tiposCaso} />
        </div>
      </div>

    </div>
  )
}
