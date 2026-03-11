import { prisma } from "@/lib/db"
import { calcularResultado } from "@/lib/sena/scoring"
import { REACTIVOS } from "@/lib/data/reactivos"
import { Semaforo } from "@/lib/enums"
import Link from "next/link"

export const dynamic = "force-dynamic"

const textos = REACTIVOS.map((r) => r.texto)

const SEM: Record<Semaforo, { label: string; color: string; bg: string; dot: string; border: string }> = {
  VERDE:        { label: "Sin riesgo",  color: "#276749", bg: "rgba(104,211,145,0.12)", dot: "#68D391", border: "rgba(104,211,145,0.35)" },
  AMARILLO:     { label: "Revisión",    color: "#975a16", bg: "rgba(246,173,85,0.12)",  dot: "#F6AD55", border: "rgba(246,173,85,0.35)"  },
  ROJO:         { label: "Prioritario", color: "#9b2c2c", bg: "rgba(252,129,129,0.12)", dot: "#FC8181", border: "rgba(252,129,129,0.35)" },
  ROJO_URGENTE: { label: "URGENTE",     color: "#7b2222", bg: "rgba(252,129,129,0.22)", dot: "#FC8181", border: "rgba(252,129,129,0.55)" },
}

const AVATAR_COLORS = ["#1A7A8A", "#0D475A", "#2ABFBF", "#5B8DEF", "#b45309", "#276749"]

function iniciales(nombre: string) {
  return nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

type SearchParams = Promise<{ semaforo?: string }>
type Props = { searchParams: SearchParams }

export default async function RespuestasPage({ searchParams }: Props) {
  const params = await searchParams

  const registros = await prisma.respuestasCuestionario.findMany({
    orderBy: { fecha: "desc" },
    include: { estudiante: { select: { nombre: true, grado: true, grupo: true } } },
  })

  const conResultado = registros.map((reg) => {
    const arr = Array.isArray(reg.respuestas) ? (reg.respuestas as number[]) : []
    const resultado = calcularResultado(arr, textos)
    return { reg, resultado }
  })

  const cntVerde    = conResultado.filter(r => r.resultado.semaforo === "VERDE").length
  const cntAmarillo = conResultado.filter(r => r.resultado.semaforo === "AMARILLO").length
  const cntRojo     = conResultado.filter(r => r.resultado.semaforo === "ROJO").length
  const cntUrgente  = conResultado.filter(r => r.resultado.semaforo === "ROJO_URGENTE").length

  const filtrados = params.semaforo
    ? conResultado.filter(r => r.resultado.semaforo === params.semaforo)
    : conResultado

  return (
    <div>
      {/* ── Cabecera ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Respuestas del alumnado</h1>
          <p className="page-subtitle">
            Cuestionarios SENA enviados desde el portal · {registros.length}{" "}
            {registros.length === 1 ? "registro" : "registros"}
          </p>
        </div>
        <Link href="/alumno/login" target="_blank" className="btn-secondary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Portal del alumno
        </Link>
      </div>

      {/* ── Filtros semáforo ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 20 }}>
        {([
          { sem: "VERDE",        label: "Sin riesgo",  valor: cntVerde,    accent: "#68D391", text: "#276749" },
          { sem: "AMARILLO",     label: "Revisión",    valor: cntAmarillo, accent: "#F6AD55", text: "#975a16" },
          { sem: "ROJO",         label: "Prioritario", valor: cntRojo,     accent: "#FC8181", text: "#9b2c2c" },
          { sem: "ROJO_URGENTE", label: "Urgente",     valor: cntUrgente,  accent: "#FC8181", text: "#7b2222" },
        ] as const).map(({ sem, label, valor, accent, text }) => {
          const activo = params.semaforo === sem
          return (
            <Link key={sem} href={activo ? "/respuestas" : `/respuestas?semaforo=${sem}`}
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

      {/* ── Estado vacío ── */}
      {registros.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="#1A7A8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <p style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, color: "#0D475A", fontSize: 15, margin: "0 0 6px" }}>
            Sin respuestas todavía
          </p>
          <p style={{ fontSize: 13, color: "#4A5568", margin: "0 0 20px" }}>
            Cuando los alumnos completen el cuestionario aparecerán aquí.
          </p>
          <Link href="/alumno/login" target="_blank" className="btn-primary">
            Ir al portal del alumno →
          </Link>
        </div>
      )}

      {/* ── Tabla ── */}
      {registros.length > 0 && (
        <div className="data-table">
          <div className="data-table-head" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px" }}>
            {["Alumno", "Grado / Grupo", "Fecha envío", "Resultado", "Ítems críticos", ""].map(h => (
              <span key={h}>{h}</span>
            ))}
          </div>

          {filtrados.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontWeight: 700, color: "#0D475A", fontSize: 14, margin: "0 0 4px" }}>Sin resultados</p>
              <p style={{ fontSize: 13, color: "#4A5568", margin: "0 0 16px" }}>
                Ningún cuestionario coincide con el filtro seleccionado.
              </p>
              <Link href="/respuestas" className="link-teal">Ver todos →</Link>
            </div>
          )}

          {filtrados.map(({ reg, resultado }, i) => {
            const sem = SEM[resultado.semaforo as Semaforo]
            const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
            const tieneCriticos = resultado.itemsCriticos.length > 0

            return (
              <div key={reg.id} className="data-table-row" style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
                alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: avatarColor, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff",
                  }}>
                    {iniciales(reg.estudiante.nombre)}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0D475A", margin: 0 }}>
                    {reg.estudiante.nombre}
                  </p>
                </div>

                <span style={{ fontSize: 13, color: "#4A5568" }}>
                  {reg.estudiante.grado} &quot;{reg.estudiante.grupo}&quot;
                </span>

                <span style={{ fontSize: 13, color: "#4A5568" }}>
                  {new Date(reg.fecha).toLocaleDateString("es-MX", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>

                <span className="badge" style={{ background: sem.bg, color: sem.color, border: `1px solid ${sem.border}`, width: "fit-content" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: sem.dot, flexShrink: 0 }} />
                  {sem.label}
                </span>

                <div>
                  {tieneCriticos ? (
                    <span className="badge" style={{ background: "rgba(252,129,129,0.12)", color: "#9b2c2c", border: "1px solid rgba(252,129,129,0.3)" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      {resultado.itemsCriticos.length} críticos
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>
                  )}
                </div>

                <Link href={`/respuestas/${reg.id}`} className="btn-ghost" style={{ fontSize: 12, padding: "6px 10px" }}>
                  Detalle
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {registros.length > 0 && (
        <div style={{ marginTop: 12, padding: "0 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#4A5568" }}>
            {params.semaforo ? `${filtrados.length} de ${registros.length} registros` : `${registros.length} registros en total`}
          </span>
          {params.semaforo && (
            <Link href="/respuestas" className="link-teal" style={{ fontSize: 12 }}>Ver todos →</Link>
          )}
        </div>
      )}
    </div>
  )
}
