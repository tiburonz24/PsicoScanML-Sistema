import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Rol, Semaforo, EstadoCita } from "@/lib/enums"
import Link from "next/link"
import GraficaSemaforos from "@/components/dashboard/GraficaSemaforos"
import GraficaTiposCaso from "@/components/dashboard/GraficaTiposCaso"
import { getResumenSemaforos, getResumenTiposCaso } from "@/lib/data/mock"

const SEMAFORO_LABEL: Record<Semaforo, string> = {
  VERDE:        "Sin riesgo",
  AMARILLO:     "En revisión",
  ROJO:         "Prioritario",
  ROJO_URGENTE: "URGENTE",
}

const ESTADO_STYLE: Record<EstadoCita, { label: string; bg: string; color: string }> = {
  CONFIRMADA:  { label: "Confirmada",  bg: "rgba(104,211,145,0.15)", color: "#276749" },
  PENDIENTE:   { label: "Pendiente",   bg: "rgba(246,173,85,0.15)",  color: "#975a16" },
  COMPLETADA:  { label: "Completada",  bg: "rgba(91,141,239,0.15)",  color: "#2b4acb" },
  CANCELADA:   { label: "Cancelada",   bg: "rgba(252,129,129,0.15)", color: "#9b2c2c" },
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.rol === Rol.ESTUDIANTE) redirect("/cuestionario/mi-sena")

  // Calcula el rango "hoy" en hora México (UTC-6, sin horario de verano desde 2022)
  // para que coincida tanto en local como en producción (Vercel corre en UTC)
  const MX_OFFSET = 6 * 3600000
  const mxNow = new Date(Date.now() - MX_OFFSET)
  const y = mxNow.getUTCFullYear(), mo = mxNow.getUTCMonth(), d = mxNow.getUTCDate()
  const hoy    = new Date(Date.UTC(y, mo, d,     6, 0, 0, 0))
  const manana = new Date(Date.UTC(y, mo, d + 1, 6, 0, 0, 0))

  const [semaforos, tiposCaso, totalEstudiantes, totalRespuestas, citasHoy, alertasML] = await Promise.all([
    getResumenSemaforos(),
    getResumenTiposCaso(),
    prisma.estudiante.count(),
    prisma.respuestasCuestionario.count(),
    prisma.cita.findMany({
      where: { fecha: { gte: hoy, lt: manana } },
      include: { estudiante: true },
      orderBy: { fecha: "asc" },
      take: 5,
    }),
    prisma.tamizaje.findMany({
      where: { semaforo: { in: [Semaforo.ROJO, Semaforo.ROJO_URGENTE] } },
      include: { estudiante: true },
      orderBy: { fecha: "desc" },
      take: 4,
      distinct: ["estudianteId"],
    }),
  ])

  const urgentes = alertasML.filter(t => t.semaforo === Semaforo.ROJO_URGENTE).length
  const totalTamizajes = semaforos.reduce((acc, s) => acc + s.total, 0)

  const nombre = session?.user?.name ?? "Usuario"
  const hora   = new Date().getHours()
  const saludo = hora < 13 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches"
  const fecha  = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  const STATS = [
    {
      label: "Estudiantes registrados",
      value: totalEstudiantes,
      sub: "en el sistema",
      accent: "#1A7A8A",
      href: "/estudiantes",
      icon: (
        <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#1A7A8A" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
    {
      label: "Tamizajes aplicados",
      value: totalTamizajes,
      sub: "cuestionarios SENA",
      accent: "#2ABFBF",
      href: "/estudiantes",
      icon: (
        <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#2ABFBF" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/>
        </svg>
      ),
    },
    {
      label: "Respuestas en portal",
      value: totalRespuestas,
      sub: "pendientes de procesar",
      accent: "#5B8DEF",
      href: "/respuestas",
      icon: (
        <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#5B8DEF" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
    },
    {
      label: urgentes > 0 ? "Casos urgentes" : "Sin alertas urgentes",
      value: urgentes,
      sub: urgentes > 0 ? "requieren atención inmediata" : "todo bajo control",
      accent: urgentes > 0 ? "#FC8181" : "#68D391",
      href: "/estudiantes",
      icon: (
        <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={urgentes > 0 ? "#FC8181" : "#68D391"} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
  ]

  const ACCENT_COLORS = ["#1A7A8A", "#2ABFBF", "#5B8DEF", urgentes > 0 ? "#FC8181" : "#68D391"]

  return (
    <div>
      <style>{`
        .stat-card:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,71,90,0.08); }
        .cita-item:hover  { border-color: #2ABFBF !important; }
        .alerta-item:hover { opacity: 0.85; }
        .dash-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; margin-bottom: 24px; }
        @media (max-width: 900px) { .dash-main-grid { grid-template-columns: 1fr; } }
      `}</style>
      {/* ── Topbar blanca ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 28, flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <p style={{ fontSize: 13, color: "#1A7A8A", margin: "0 0 2px", fontWeight: 500 }}>
            {saludo}, <strong style={{ color: "#0D475A" }}>{nombre}</strong>
          </p>
          <h1 style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: 22, fontWeight: 800, color: "#0D475A",
            margin: 0, letterSpacing: "-0.5px",
          }}>
            Dashboard clínico
          </h1>
        </div>
        <span style={{ fontSize: 12, color: "#4A5568" }}>{fecha}</span>
      </div>

      {/* ── Stats ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16, marginBottom: 24,
      }}>
        {STATS.map((s, i) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{
              background: "#fff", borderRadius: 16,
              border: "1px solid #dce8ec",
              padding: "20px 22px", position: "relative", overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}>
              {/* Accent bar top */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: ACCENT_COLORS[i] }} />
              <div style={{ position: "absolute", top: 16, right: 18, opacity: 0.12 }}>{s.icon}</div>
              <p style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: "0.8px",
                textTransform: "uppercase", color: "#4A5568", marginBottom: 10,
              }}>{s.label}</p>
              <p style={{
                fontFamily: "var(--font-syne), sans-serif",
                fontSize: 34, fontWeight: 800, color: "#0D475A",
                lineHeight: 1, margin: "0 0 6px",
              }}>{s.value}</p>
              <p style={{ fontSize: 11.5, color: "#4A5568", margin: 0 }}>{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main grid: Citas + Alertas ML ── */}
      <div className="dash-main-grid">
        {/* Citas del día */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #dce8ec", padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: 15, fontWeight: 700, color: "#0D475A" }}>
              Citas del día
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
              background: "#E8F4F6", color: "#1A7A8A",
            }}>
              {citasHoy.length} programadas
            </span>
          </div>

          {citasHoy.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#4A5568" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
              <p style={{ fontSize: 13, margin: 0 }}>Sin citas programadas para hoy</p>
              <Link href="/citas" style={{ fontSize: 12, color: "#1A7A8A", textDecoration: "none", marginTop: 8, display: "inline-block" }}>
                Agendar cita →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {citasHoy.map((cita) => {
                const est = ESTADO_STYLE[cita.estado as EstadoCita]
                const horaStr = cita.fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
                return (
                  <Link key={cita.id} href={`/expediente/${cita.estudianteId}`} style={{ textDecoration: "none" }}>
                    <div className="cita-item" style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "12px 14px", borderRadius: 12,
                      background: "#F4F8FA", border: "1px solid #dce8ec",
                      transition: "border-color 0.15s",
                      cursor: "pointer",
                    }}>
                      <div style={{
                        fontFamily: "var(--font-syne), sans-serif",
                        fontSize: 13, fontWeight: 700, color: "#1A7A8A",
                        minWidth: 48, textAlign: "center",
                      }}>{horaStr}</div>
                      <div style={{ width: 1, height: 32, background: "#dce8ec" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#0D475A", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {cita.estudiante.nombre}
                        </p>
                        <p style={{ fontSize: 11, color: "#4A5568", margin: 0 }}>Estudiante · {cita.notas ?? "Sin notas"}</p>
                      </div>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                        background: est.bg, color: est.color, whiteSpace: "nowrap",
                      }}>{est.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Alertas ML */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #dce8ec", padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: 15, fontWeight: 700, color: "#0D475A" }}>
              Alertas ML
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
              background: alertasML.length > 0 ? "rgba(252,129,129,0.15)" : "#E8F4F6",
              color: alertasML.length > 0 ? "#9b2c2c" : "#1A7A8A",
            }}>
              {alertasML.length} activas
            </span>
          </div>

          {alertasML.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#4A5568" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <p style={{ fontSize: 13, margin: 0 }}>Sin alertas de riesgo activas</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alertasML.map((t) => {
                const esUrgente = t.semaforo === Semaforo.ROJO_URGENTE
                const pct = esUrgente ? 85 : 55
                const accent = esUrgente ? "#FC8181" : "#F6AD55"
                const bgItem = esUrgente ? "rgba(252,129,129,0.05)" : "rgba(246,173,85,0.05)"
                return (
                  <Link key={t.id} href={`/expediente/${t.estudianteId}`} style={{ textDecoration: "none" }}>
                    <div className="alerta-item" style={{
                      padding: "13px 16px", borderRadius: 12,
                      background: bgItem, borderLeft: `4px solid ${accent}`,
                      transition: "opacity 0.15s",
                      cursor: "pointer",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0D475A" }}>
                          {t.estudiante.nombre}
                        </span>
                        <span style={{
                          fontFamily: "var(--font-syne), sans-serif",
                          fontSize: 14, fontWeight: 800, color: accent,
                        }}>{SEMAFORO_LABEL[t.semaforo as Semaforo]}</span>
                      </div>
                      <div style={{ height: 5, background: "rgba(0,0,0,0.07)", borderRadius: 10, overflow: "hidden", marginBottom: 5 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: accent, borderRadius: 10 }} />
                      </div>
                      <p style={{ fontSize: 10.5, color: "#4A5568", margin: 0 }}>
                        Grado {t.estudiante.grado} · Grupo {t.estudiante.grupo}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Gráficas ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 20,
      }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #dce8ec", padding: "22px 24px" }}>
          <p style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: 15, fontWeight: 700, color: "#0D475A", margin: "0 0 16px" }}>
            Distribución por semáforo
          </p>
          <GraficaSemaforos data={semaforos} />
        </div>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #dce8ec", padding: "22px 24px" }}>
          <p style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: 15, fontWeight: 700, color: "#0D475A", margin: "0 0 16px" }}>
            Tipos de caso
          </p>
          <GraficaTiposCaso data={tiposCaso} />
        </div>
      </div>
    </div>
  )
}
