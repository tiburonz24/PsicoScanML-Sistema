import { prisma } from "@/lib/db"
import { calcularResultado } from "@/lib/sena/scoring"
import { REACTIVOS } from "@/lib/data/reactivos"
import { Semaforo } from "@/lib/enums"
import Link from "next/link"

export const dynamic = "force-dynamic"

const textos = REACTIVOS.map((r) => r.texto)

const SEM: Record<Semaforo, { label: string; color: string; bg: string; dot: string; borde: string }> = {
  VERDE:        { label: "Sin riesgo",  color: "#15803d", bg: "#f0fdf4", dot: "#22c55e", borde: "#86efac" },
  AMARILLO:     { label: "Revisión",    color: "#92400e", bg: "#fffbeb", dot: "#f59e0b", borde: "#fde68a" },
  ROJO:         { label: "Prioritario", color: "#991b1b", bg: "#fef2f2", dot: "#ef4444", borde: "#fca5a5" },
  ROJO_URGENTE: { label: "URGENTE",     color: "#7f1d1d", bg: "#fee2e2", dot: "#dc2626", borde: "#f87171" },
}

function iniciales(nombre: string) {
  return nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ["#4f46e5","#0891b2","#7c3aed","#0f766e","#b45309","#be185d"]

type SearchParams = Promise<{ semaforo?: string }>
type Props = { searchParams: SearchParams }

export default async function RespuestasPage({ searchParams }: Props) {
  const params = await searchParams

  const registros = await prisma.respuestasCuestionario.findMany({
    orderBy: { fecha: "desc" },
    include: { estudiante: { select: { nombre: true, grado: true, grupo: true } } },
  })

  // Calcular resultado de cada registro
  const conResultado = registros.map((reg) => {
    const arr = Array.isArray(reg.respuestas) ? (reg.respuestas as number[]) : []
    const resultado = calcularResultado(arr, textos)
    return { reg, resultado }
  })

  // Conteos globales (siempre sobre el total)
  const cntVerde    = conResultado.filter(r => r.resultado.semaforo === "VERDE").length
  const cntAmarillo = conResultado.filter(r => r.resultado.semaforo === "AMARILLO").length
  const cntRojo     = conResultado.filter(r => r.resultado.semaforo === "ROJO").length
  const cntUrgente  = conResultado.filter(r => r.resultado.semaforo === "ROJO_URGENTE").length

  // Filtrar por semáforo si hay parámetro
  const filtrados = params.semaforo
    ? conResultado.filter(r => r.resultado.semaforo === params.semaforo)
    : conResultado

  return (
    <div style={{ paddingTop: 8 }}>

      {/* ── Cabecera ── */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", flexWrap: "wrap",
        gap: 16, marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>
            Respuestas del alumnado
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Cuestionarios SENA enviados desde el portal · {registros.length}{" "}
            {registros.length === 1 ? "registro" : "registros"}
          </p>
        </div>
        <Link href="/alumno/login" target="_blank" style={{
          background: "white", color: "#4f46e5",
          border: "1.5px solid #c7d2fe",
          borderRadius: 8, padding: "9px 16px",
          fontSize: 13, fontWeight: 600, textDecoration: "none",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Portal del alumno
        </Link>
      </div>

      {/* ── Tarjetas semáforo (filtros clickeables) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 12, marginBottom: 20,
      }}>
        {([
          { sem: "VERDE",        label: "Sin riesgo",  valor: cntVerde,    color: "#15803d", bg: "#f0fdf4", borde: "#bbf7d0" },
          { sem: "AMARILLO",     label: "Revisión",    valor: cntAmarillo, color: "#92400e", bg: "#fffbeb", borde: "#fde68a" },
          { sem: "ROJO",         label: "Prioritario", valor: cntRojo,     color: "#991b1b", bg: "#fef2f2", borde: "#fecaca" },
          { sem: "ROJO_URGENTE", label: "Urgente",     valor: cntUrgente,  color: "#7f1d1d", bg: "#fee2e2", borde: "#fca5a5" },
        ] as const).map(({ sem, label, valor, color, bg, borde }) => {
          const activo = params.semaforo === sem
          return (
            <Link
              key={sem}
              href={activo ? "/respuestas" : `/respuestas?semaforo=${sem}`}
              style={{
                background: bg,
                border: `${activo ? 2 : 1}px solid ${activo ? color : borde}`,
                borderRadius: 10, padding: "12px 16px",
                textAlign: "center", textDecoration: "none",
                display: "block",
                boxShadow: activo ? `0 0 0 3px ${borde}` : "none",
                transition: "box-shadow 0.15s",
              }}
            >
              <p style={{ fontSize: 26, fontWeight: 800, color, margin: 0 }}>{valor}</p>
              <p style={{ fontSize: 11, color, margin: "2px 0 0", fontWeight: activo ? 700 : 500 }}>
                {activo ? `▸ ${label}` : label}
              </p>
            </Link>
          )
        })}
      </div>

      {/* ── Estado vacío (sin registros en DB) ── */}
      {registros.length === 0 && (
        <div style={{
          background: "white", borderRadius: 14, padding: "56px 32px",
          textAlign: "center", border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: "#f1f5f9", margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                 stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, margin: "0 0 6px" }}>
            Sin respuestas todavía
          </p>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px" }}>
            Cuando los alumnos completen el cuestionario desde el portal aparecerán aquí.
          </p>
          <Link href="/alumno/login" target="_blank" style={{
            background: "#4f46e5", color: "white", borderRadius: 8,
            padding: "9px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            Ir al portal del alumno →
          </Link>
        </div>
      )}

      {/* ── Tabla ── */}
      {registros.length > 0 && (
        <div style={{
          background: "white", borderRadius: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
          border: "1px solid #f1f5f9", overflow: "hidden",
        }}>
          {/* Encabezado */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
            padding: "10px 20px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
          }}>
            {["Alumno", "Grado / Grupo", "Fecha envío", "Resultado", "Ítems críticos", ""].map(h => (
              <span key={h} style={{
                fontSize: 11, fontWeight: 700, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                {h}
              </span>
            ))}
          </div>

          {/* Sin resultados por filtro */}
          {filtrados.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, margin: "0 0 4px" }}>
                Sin resultados
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>
                Ningún cuestionario coincide con el filtro seleccionado.
              </p>
              <Link href="/respuestas" style={{
                fontSize: 13, fontWeight: 600, color: "#6366f1", textDecoration: "none",
              }}>
                Ver todos →
              </Link>
            </div>
          )}

          {/* Filas */}
          {filtrados.map(({ reg, resultado }, i) => {
            const sem = SEM[resultado.semaforo as Semaforo]
            const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
            const tieneCriticos = resultado.itemsCriticos.length > 0

            return (
              <div
                key={reg.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
                  padding: "14px 20px",
                  borderBottom: i < filtrados.length - 1 ? "1px solid #f1f5f9" : "none",
                  alignItems: "center",
                }}
              >
                {/* Nombre + avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: avatarColor, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "white",
                  }}>
                    {iniciales(reg.estudiante.nombre)}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                    {reg.estudiante.nombre}
                  </p>
                </div>

                {/* Grado */}
                <span style={{ fontSize: 13, color: "#475569" }}>
                  {reg.estudiante.grado} &quot;{reg.estudiante.grupo}&quot;
                </span>

                {/* Fecha */}
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  {new Date(reg.fecha).toLocaleDateString("es-MX", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>

                {/* Semáforo */}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: sem.bg, color: sem.color,
                  border: `1px solid ${sem.borde}`,
                  borderRadius: 20, padding: "3px 10px",
                  fontSize: 11, fontWeight: 700, width: "fit-content",
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: sem.dot, flexShrink: 0,
                  }} />
                  {sem.label}
                </span>

                {/* Ítems críticos */}
                <div>
                  {tieneCriticos ? (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: "#fef2f2", color: "#dc2626",
                      borderRadius: 20, padding: "3px 10px",
                      fontSize: 11, fontWeight: 700,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      {resultado.itemsCriticos.length} críticos
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>
                  )}
                </div>

                {/* Acción */}
                <Link href={`/respuestas/${reg.id}`} style={{
                  fontSize: 12, fontWeight: 600, color: "#4f46e5",
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                }}>
                  Detalle
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Footer ── */}
      {registros.length > 0 && (
        <div style={{ marginTop: 12, padding: "0 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {params.semaforo
              ? `${filtrados.length} de ${registros.length} registros`
              : `${registros.length} registros en total`
            }
          </span>
          {params.semaforo && (
            <Link href="/respuestas" style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
              Ver todos →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
