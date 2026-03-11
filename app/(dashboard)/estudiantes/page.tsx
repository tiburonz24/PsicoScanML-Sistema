import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getEstudiantes } from "@/lib/data/mock"
import { prisma } from "@/lib/db"
import { Semaforo } from "@/lib/enums"
import FiltrosEstudiantes from "@/components/estudiantes/FiltrosEstudiantes"
import ImportarEstudiantes from "@/components/estudiantes/ImportarEstudiantes"
import ExportarParaSena from "@/components/estudiantes/ExportarParaSena"
import ImportarRespuestas from "@/components/estudiantes/ImportarRespuestas"

type SearchParams = Promise<{
  semaforo?: string
  grupo?: string
  grado?: string
  q?: string
  desde?: string
  hasta?: string
}>

type Props = { searchParams: SearchParams }

const SEMAFORO_STYLE: Record<Semaforo, { label: string; color: string; bg: string; dot: string; borde: string }> = {
  VERDE:        { label: "Sin riesgo",  color: "#15803d", bg: "#f0fdf4", dot: "#22c55e", borde: "#86efac" },
  AMARILLO:     { label: "Revisión",    color: "#92400e", bg: "#fffbeb", dot: "#f59e0b", borde: "#fde68a" },
  ROJO:         { label: "Prioritario", color: "#991b1b", bg: "#fef2f2", dot: "#ef4444", borde: "#fca5a5" },
  ROJO_URGENTE: { label: "URGENTE",     color: "#7f1d1d", bg: "#fee2e2", dot: "#dc2626", borde: "#f87171" },
}

const SEXO_LABEL: Record<string, string> = {
  MASCULINO: "M", FEMENINO: "F", OTRO: "Otro",
}

const AVATAR_COLORS = ["#0D475A", "#1A7A8A", "#2ABFBF", "#0f766e", "#b45309"]

function iniciales(nombre: string) {
  return nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

export default async function EstudiantesPage({ searchParams }: Props) {
  const params      = await searchParams
  const session     = await getServerSession(authOptions)
  const esAdmin     = session?.user?.rol === "ADMIN"
  const todos       = await getEstudiantes()
  const pendientesExport = await prisma.respuestasCuestionario.findMany({
    where:  { procesado: false },
    select: { estudianteId: true },
    distinct: ["estudianteId"],
  }).then(r => r.length)

  // ── Derivar opciones únicas de grupo y grado ─────────────────────────────
  const grupos = [...new Set(todos.map(e => e.grupo))].sort()
  const grados = [...new Set(todos.map(e => e.grado))].sort()

  // ── Conteos globales (siempre sobre el total, no el filtro) ───────────────
  const sinRiesgo   = todos.filter(e => e.tamizajes[0]?.semaforo === "VERDE").length
  const revision    = todos.filter(e => e.tamizajes[0]?.semaforo === "AMARILLO").length
  const prioritario = todos.filter(e => e.tamizajes[0]?.semaforo === "ROJO").length
  const urgente     = todos.filter(e => e.tamizajes[0]?.semaforo === "ROJO_URGENTE").length

  // ── Aplicar filtros ───────────────────────────────────────────────────────
  let filtrados = todos

  if (params.semaforo) {
    filtrados = filtrados.filter(e => e.tamizajes[0]?.semaforo === params.semaforo)
  }
  if (params.grupo) {
    filtrados = filtrados.filter(e => e.grupo === params.grupo)
  }
  if (params.grado) {
    filtrados = filtrados.filter(e => e.grado === params.grado)
  }
  if (params.q) {
    const q = params.q.toLowerCase()
    filtrados = filtrados.filter(e => e.nombre.toLowerCase().includes(q))
  }
  if (params.desde) {
    const desde = new Date(params.desde)
    filtrados = filtrados.filter(e => {
      const f = e.tamizajes[0]?.fecha
      return f ? new Date(f) >= desde : false
    })
  }
  if (params.hasta) {
    const hasta = new Date(params.hasta)
    hasta.setHours(23, 59, 59)
    filtrados = filtrados.filter(e => {
      const f = e.tamizajes[0]?.fecha
      return f ? new Date(f) <= hasta : false
    })
  }

  const hayFiltros = !!(params.semaforo || params.grupo || params.grado || params.q || params.desde || params.hasta)

  return (
    <div>
      {/* ── Cabecera ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Estudiantes</h1>
          <p className="page-subtitle">
            {todos.length} estudiantes registrados · CECyTEN Plantel Tepic
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <a href="/api/export/excel" className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Exportar Excel
          </a>
          <Link href="/estudiantes/nuevo" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo estudiante
          </Link>
        </div>
      </div>

      {/* ── Importación masiva (solo ADMIN) ── */}
      {esAdmin && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          <ImportarEstudiantes />
          <ExportarParaSena count={pendientesExport} />
          <ImportarRespuestas />
        </div>
      )}

      {/* ── Cards de resumen (clickeables como filtro rápido) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 12, marginBottom: 20,
      }}>
        {([
          { sem: "VERDE",        label: "Sin riesgo",  valor: sinRiesgo,   accent: "#68D391", text: "#276749" },
          { sem: "AMARILLO",     label: "Revisión",    valor: revision,    accent: "#F6AD55", text: "#975a16" },
          { sem: "ROJO",         label: "Prioritario", valor: prioritario, accent: "#FC8181", text: "#9b2c2c" },
          { sem: "ROJO_URGENTE", label: "Urgente",     valor: urgente,     accent: "#FC8181", text: "#7b2222" },
        ] as const).map(({ sem, label, valor, accent, text }) => {
          const activo = params.semaforo === sem
          return (
            <Link key={sem} href={activo ? "/estudiantes" : `/estudiantes?semaforo=${sem}`}
              style={{
                background: activo ? `${accent}22` : "#fff",
                border: `${activo ? 2 : 1}px solid ${activo ? accent : "#dce8ec"}`,
                borderRadius: 12, padding: "14px 16px",
                textAlign: "center", textDecoration: "none", display: "block",
                transition: "all 0.15s",
                boxShadow: activo ? `0 0 0 3px ${accent}33` : "none",
              }}
            >
              <p style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: 28, fontWeight: 800, color: text, margin: 0, lineHeight: 1 }}>{valor}</p>
              <p style={{ fontSize: 11, color: text, margin: "5px 0 0", fontWeight: activo ? 700 : 500, letterSpacing: "0.3px" }}>
                {activo ? `▸ ${label}` : label}
              </p>
            </Link>
          )
        })}
      </div>

      {/* ── Barra de filtros (cliente) ── */}
      <FiltrosEstudiantes
        grupos={grupos}
        grados={grados}
        activos={filtrados.length}
        total={todos.length}
      />

      {/* ── Tabla de estudiantes ── */}
      <div style={{
        background: "white",
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
        overflow: "hidden",
      }}>
        {/* Encabezado tabla */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
          padding: "10px 20px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}>
          {["Estudiante", "Grado / Grupo", "Último tamizaje", "Estado", ""].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 700, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Estado vacío */}
        {filtrados.length === 0 && (
          <div style={{
            padding: "48px 24px", textAlign: "center",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                 stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                 style={{ margin: "0 auto 12px", display: "block" }}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{ fontWeight: 700, color: "#0D475A", fontSize: 14, margin: "0 0 4px" }}>
              Sin resultados
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>
              Ningún estudiante coincide con los filtros seleccionados.
            </p>
            <Link href="/estudiantes" style={{
              fontSize: 13, fontWeight: 600, color: "#1A7A8A", textDecoration: "none",
            }}>
              Limpiar filtros →
            </Link>
          </div>
        )}

        {/* Filas */}
        {filtrados.map((est, i) => {
          const ultimo      = est.tamizajes[0]
          const sem         = ultimo ? SEMAFORO_STYLE[ultimo.semaforo] : null
          const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
          const esUrgente   = ultimo?.semaforo === "ROJO_URGENTE"

          return (
            <div
              key={est.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
                padding: "14px 20px",
                borderBottom: i < filtrados.length - 1 ? "1px solid #f1f5f9" : "none",
                alignItems: "center",
                background: esUrgente ? "#fff5f5" : "white",
                borderLeft: esUrgente ? "3px solid #dc2626" : "3px solid transparent",
              }}
            >
              {/* Nombre + avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: avatarColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0,
                }}>
                  {iniciales(est.nombre)}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0D475A", margin: 0 }}>
                    {est.nombre}
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "1px 0 0" }}>
                    {est.edad} años · {SEXO_LABEL[est.sexo]}
                  </p>
                </div>
              </div>

              {/* Grado / Grupo */}
              <span style={{ fontSize: 13, color: "#475569" }}>
                {est.grado} &quot;{est.grupo}&quot;
              </span>

              {/* Fecha */}
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                {ultimo
                  ? new Date(ultimo.fecha).toLocaleDateString("es-MX", {
                      day: "numeric", month: "short", year: "numeric",
                    })
                  : <em style={{ color: "#cbd5e1" }}>Sin tamizaje</em>
                }
              </span>

              {/* Semáforo */}
              <div>
                {sem ? (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: sem.bg, color: sem.color,
                    border: `1px solid ${sem.borde}`,
                    borderRadius: 20, padding: "3px 10px",
                    fontSize: 11, fontWeight: 700,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: sem.dot, flexShrink: 0,
                    }} />
                    {sem.label}
                  </span>
                ) : (
                  <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>
                )}
              </div>

              {/* Acción */}
              <Link href={`/estudiantes/${est.id}`} style={{
                fontSize: 12, fontWeight: 600, color: "#1A7A8A",
                textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
              }}>
                Expediente
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            </div>
          )
        })}
      </div>

      {/* ── Footer de tabla ── */}
      {filtrados.length > 0 && (
        <div style={{
          marginTop: 12, padding: "0 4px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {hayFiltros
              ? `${filtrados.length} de ${todos.length} estudiantes`
              : `${todos.length} estudiantes en total`
            }
          </span>
          {hayFiltros && (
            <Link href="/estudiantes" style={{
              fontSize: 12, color: "#1A7A8A", textDecoration: "none", fontWeight: 500,
            }}>
              Ver todos →
            </Link>
          )}
        </div>
      )}

    </div>
  )
}
