import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { calcularResultado, ESCALAS } from "@/lib/sena/scoring"
import { REACTIVOS } from "@/lib/data/reactivos"
import { Semaforo, Rol } from "@/lib/enums"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

const ROLES_RESPUESTAS: Rol[] = [Rol.PSICOLOGO, Rol.ORIENTADOR, Rol.ADMIN, Rol.DIRECTOR]

type Props = { params: Promise<{ id: string }> }

const textos = REACTIVOS.map((r) => r.texto)

const SEM: Record<Semaforo, { label: string; color: string; bg: string; borde: string; bLeft: string }> = {
  VERDE:        { label: "Sin riesgo",  color: "#15803d", bg: "#f0fdf4", borde: "#bbf7d0", bLeft: "#22c55e" },
  AMARILLO:     { label: "Revisión",    color: "#92400e", bg: "#fffbeb", borde: "#fde68a", bLeft: "#f59e0b" },
  ROJO:         { label: "Prioritario", color: "#991b1b", bg: "#fef2f2", borde: "#fecaca", bLeft: "#ef4444" },
  ROJO_URGENTE: { label: "URGENTE",     color: "#7f1d1d", bg: "#fee2e2", borde: "#fca5a5", bLeft: "#dc2626" },
}

const RESP_STYLE: Record<number, { color: string; bg: string }> = {
  5: { color: "#dc2626", bg: "#fef2f2" },
  4: { color: "#c2410c", bg: "#fff7ed" },
  3: { color: "#92400e", bg: "#fffbeb" },
  2: { color: "#475569", bg: "#f1f5f9" },
  1: { color: "#94a3b8", bg: "#f8fafc" },
}

const GRUPOS_ESCALAS = [
  { titulo: "Problemas emocionales",   claves: ["dep","ans","asc","som","pst","obs"] },
  { titulo: "Problemas conductuales",  claves: ["ate","hip","ira","agr","des","ant"] },
  { titulo: "Otros problemas",         claves: ["sus","esq","ali"] },
  { titulo: "Problemas contextuales",  claves: ["fam","esc","com"] },
  { titulo: "Recursos personales",     claves: ["aut","soc","cnc"] },
]

function iniciales(nombre: string) {
  return nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

export default async function DetalleRespuestaPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session || !ROLES_RESPUESTAS.includes(session.user.rol as Rol)) redirect("/dashboard")

  const { id } = await params

  const reg = await prisma.respuestasCuestionario.findUnique({
    where: { id },
    include: {
      estudiante: { select: { nombre: true, grado: true, grupo: true, edad: true, sexo: true } },
    },
  })

  if (!reg) notFound()

  const arr       = Array.isArray(reg.respuestas) ? (reg.respuestas as number[]) : []
  const resultado = calcularResultado(arr, textos)
  const sem       = SEM[resultado.semaforo as Semaforo]

  const porCategoria = resultado.itemsCriticos.reduce<
    Record<string, typeof resultado.itemsCriticos>
  >((acc, ic) => {
    if (!acc[ic.categoria]) acc[ic.categoria] = []
    acc[ic.categoria].push(ic)
    return acc
  }, {})

  return (
    <div style={{ paddingTop: 8, maxWidth: 860 }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        <Link href="/respuestas" style={{ fontSize: 13, color: "#1A7A8A", textDecoration: "none", fontWeight: 500 }}>
          Respuestas
        </Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span style={{ fontSize: 13, color: "#0D475A", fontWeight: 600 }}>{reg.estudiante.nombre}</span>
      </div>

      {/* ── Perfil ── */}
      <div style={{
        background: "linear-gradient(135deg, #0D475A 0%, #1A7A8A 100%)",
        borderRadius: 16, padding: "24px 28px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap",
        gap: 16, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 800, color: "white", flexShrink: 0,
          }}>
            {iniciales(reg.estudiante.nombre)}
          </div>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 800, color: "white", margin: "0 0 4px" }}>
              {reg.estudiante.nombre}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0 }}>
              {reg.estudiante.edad} años · {reg.estudiante.grado} &quot;{reg.estudiante.grupo}&quot;
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "4px 0 0" }}>
              Enviado el{" "}
              {new Date(reg.fecha).toLocaleDateString("es-MX", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Badge + métricas */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{
            background: sem.bg, color: sem.color,
            border: `2px solid ${sem.borde}`,
            borderRadius: 10, padding: "8px 20px",
            fontSize: 14, fontWeight: 800,
          }}>
            {sem.label}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            {resultado.totalItemsAltos} ítems con respuesta alta (4–5)
          </span>
        </div>
      </div>

      {/* ── Evaluación automática ── */}
      <div style={{
        background: sem.bg,
        border: `1px solid ${sem.borde}`,
        borderLeft: `4px solid ${sem.bLeft}`,
        borderRadius: 12, padding: "16px 20px",
        marginBottom: 20,
        display: "flex", alignItems: "flex-start", gap: 12,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke={sem.bLeft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             style={{ flexShrink: 0, marginTop: 2 }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: sem.color, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Evaluación automática
          </p>
          <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>
            {resultado.observaciones}
          </p>
        </div>
      </div>

      {/* ── Ítems críticos ── */}
      <p style={{
        fontSize: 11, fontWeight: 700, color: "#94a3b8",
        letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px",
      }}>
        Ítems críticos
      </p>

      {resultado.itemsCriticos.length === 0 ? (
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: 12, padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 20,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p style={{ fontSize: 14, color: "#15803d", margin: 0, fontWeight: 600 }}>
            Sin ítems críticos detectados
          </p>
        </div>
      ) : (
        <div style={{
          background: "white", borderRadius: 12,
          border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflow: "hidden", marginBottom: 20,
        }}>
          {/* Header de la tabla */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 20px", background: "#fef2f2",
            borderBottom: "1px solid #fecaca",
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", margin: 0 }}>
              Ítems críticos activos
            </p>
            <span style={{
              background: "#dc2626", color: "white",
              borderRadius: 20, padding: "2px 10px",
              fontSize: 11, fontWeight: 700,
            }}>
              {resultado.itemsCriticos.length} ítems
            </span>
          </div>

          {/* Categorías */}
          <div style={{ padding: "4px 0" }}>
            {Object.entries(porCategoria).map(([categoria, items]) => (
              <div key={categoria} style={{ padding: "12px 20px", borderBottom: "1px solid #f8fafc" }}>
                <p style={{
                  fontSize: 10, fontWeight: 800, color: "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px",
                }}>
                  {categoria}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {items.map((ic) => {
                    const rs = RESP_STYLE[ic.respuesta] ?? { color: "#475569", bg: "#f1f5f9" }
                    return (
                      <div key={ic.item} style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "flex-start", gap: 16,
                        padding: "8px 12px", borderRadius: 8,
                        background: "#fafafa",
                      }}>
                        <div style={{ display: "flex", gap: 10, flex: 1 }}>
                          <span style={{
                            fontSize: 11, color: "#94a3b8", flexShrink: 0,
                            fontWeight: 600, minWidth: 28,
                          }}>
                            #{ic.item}
                          </span>
                          <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.5 }}>
                            {ic.texto}
                          </p>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, flexShrink: 0,
                          color: rs.color, background: rs.bg,
                          borderRadius: 20, padding: "3px 10px",
                          whiteSpace: "nowrap",
                        }}>
                          {ic.etiqueta}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Puntuaciones brutas ── */}
      <p style={{
        fontSize: 11, fontWeight: 700, color: "#94a3b8",
        letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px",
      }}>
        Puntuaciones brutas por escala
      </p>
      <p style={{ fontSize: 12, color: "#94a3b8", margin: "-8px 0 14px" }}>
        Suma directa de respuestas. Puntuaciones T normalizadas disponibles con el módulo ML.
      </p>

      <div style={{
        background: "white", borderRadius: 12,
        border: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        padding: "20px 24px",
      }}>
        {GRUPOS_ESCALAS.map((grupo, gi) => (
          <div key={grupo.titulo} style={{ marginBottom: gi < GRUPOS_ESCALAS.length - 1 ? 24 : 0 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.07em",
              margin: "0 0 10px", paddingBottom: 6,
              borderBottom: "1px solid #f1f5f9",
            }}>
              {grupo.titulo}
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 8,
            }}>
              {grupo.claves.map((clave) => {
                const escala = ESCALAS[clave]
                const puntos = resultado.puntuacionesBrutas[clave] ?? 0
                const max    = (escala?.items.length ?? 1) * 5
                const pct    = max > 0 ? Math.round((puntos / max) * 100) : 0
                const barColor =
                  pct >= 70 ? "#ef4444" :
                  pct >= 50 ? "#f97316" :
                  pct >= 30 ? "#eab308" : "#22c55e"

                return (
                  <div key={clave} style={{
                    background: "#f8fafc", borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    padding: "10px 12px",
                  }}>
                    <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 6px", lineHeight: 1.3 }}>
                      {escala?.label ?? clave}
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "#0D475A" }}>{puntos}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>/ {max}</span>
                    </div>
                    <div style={{ background: "#e2e8f0", borderRadius: 4, height: 4, overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: barColor, borderRadius: 4,
                        transition: "width 0.3s",
                      }} />
                    </div>
                    <p style={{ fontSize: 10, color: "#94a3b8", margin: "3px 0 0", textAlign: "right" }}>
                      {pct}%
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
