import { notFound } from "next/navigation"
import { getEstudianteById } from "@/lib/data/mock"
import { prisma } from "@/lib/db"
import GraficaRadar from "@/components/dashboard/GraficaRadar"
import Link from "next/link"
import { Sexo, Semaforo } from "@/lib/enums"
import type { MockItemCritico, MockTamizaje } from "@/lib/data/mock"
import AgendarCitaBtn from "@/components/citas/AgendarCitaBtn"

type Props = { params: Promise<{ id: string }> }

const SEM: Record<Semaforo, { label: string; color: string; bg: string; borde: string; bLeft: string }> = {
  VERDE:        { label: "Sin riesgo",  color: "#15803d", bg: "#f0fdf4", borde: "#bbf7d0", bLeft: "#22c55e" },
  AMARILLO:     { label: "Revisión",    color: "#92400e", bg: "#fffbeb", borde: "#fde68a", bLeft: "#f59e0b" },
  ROJO:         { label: "Prioritario", color: "#991b1b", bg: "#fef2f2", borde: "#fecaca", bLeft: "#ef4444" },
  ROJO_URGENTE: { label: "URGENTE",     color: "#7f1d1d", bg: "#fee2e2", borde: "#fca5a5", bLeft: "#dc2626" },
}

const LABELS_SEXO: Record<Sexo, string> = {
  MASCULINO: "Masculino", FEMENINO: "Femenino", OTRO: "Otro",
}

const LABELS_TIPO: Record<string, string> = {
  INCONSISTENCIA:     "Inconsistencia",
  SIN_RIESGO:         "Sin riesgo",
  IMPRESION_POSITIVA: "Impresión positiva",
  IMPRESION_NEGATIVA: "Impresión negativa",
  CON_RIESGO:         "Con riesgo verificado",
}

const RESP_STYLE: Record<number, { color: string; bg: string }> = {
  5: { color: "#dc2626", bg: "#fef2f2" },
  4: { color: "#c2410c", bg: "#fff7ed" },
  3: { color: "#92400e", bg: "#fffbeb" },
  2: { color: "#475569", bg: "#f1f5f9" },
  1: { color: "#94a3b8", bg: "#f8fafc" },
}

const GRUPOS_ESCALAS_T = [
  {
    titulo: "Índices globales",
    escalas: [
      { clave: "glo_t", label: "Global (GLO)" },
      { clave: "emo_t", label: "Emocional (EMO)" },
      { clave: "con_t", label: "Conductual (CON)" },
      { clave: "eje_t", label: "Ejecutivo (EJE)" },
      { clave: "ctx_t", label: "Contextual (CTX)" },
      { clave: "rec_t", label: "Recursos (REC)" },
    ],
  },
  {
    titulo: "Problemas interiorizados",
    escalas: [
      { clave: "dep_t", label: "Depresión (DEP)" },
      { clave: "ans_t", label: "Ansiedad (ANS)" },
      { clave: "asc_t", label: "Aislamiento (ASC)" },
      { clave: "som_t", label: "Somatización (SOM)" },
      { clave: "pst_t", label: "Postrauma (PST)" },
      { clave: "obs_t", label: "Obsesión (OBS)" },
    ],
  },
  {
    titulo: "Problemas exteriorizados",
    escalas: [
      { clave: "ate_t", label: "Atención (ATE)" },
      { clave: "hip_t", label: "Hiperactividad (HIP)" },
      { clave: "ira_t", label: "Ira (IRA)" },
      { clave: "agr_t", label: "Agresión (AGR)" },
      { clave: "des_t", label: "Desafío (DES)" },
      { clave: "ant_t", label: "Antisocial (ANT)" },
    ],
  },
  {
    titulo: "Otros / Contextuales",
    escalas: [
      { clave: "esq_t", label: "Esquizotipia (ESQ)" },
      { clave: "ali_t", label: "Alimentación (ALI)" },
      { clave: "fam_t", label: "Familia (FAM)" },
      { clave: "esc_t", label: "Escuela (ESC)" },
      { clave: "com_t", label: "Comunidad (COM)" },
    ],
  },
  {
    titulo: "Recursos personales",
    escalas: [
      { clave: "aut_t", label: "Autoestima (AUT)" },
      { clave: "soc_t", label: "Social (SOC)" },
      { clave: "cnc_t", label: "Consciencia (CNC)" },
    ],
  },
]

function iniciales(nombre: string) {
  return nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

function barColorT(t: number) {
  if (t >= 70) return "#ef4444"
  if (t >= 60) return "#f97316"
  if (t >= 50) return "#eab308"
  return "#22c55e"
}

function TarjetaControl({ label, valor, umbral }: { label: string; valor: number; umbral: number }) {
  const elevado = valor >= umbral
  return (
    <div style={{
      background: elevado ? "#fff7ed" : "white",
      border: `1px solid ${elevado ? "#fed7aa" : "#e2e8f0"}`,
      borderRadius: 12, padding: "18px 20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <p style={{
        fontSize: 11, color: "#94a3b8", margin: "0 0 8px",
        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
      }}>
        {label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 800, margin: "0 0 6px", color: elevado ? "#c2410c" : "#0f172a" }}>
        {valor}
      </p>
      <span style={{
        fontSize: 11, fontWeight: 700,
        color: elevado ? "#ea580c" : "#16a34a",
        background: elevado ? "#fff7ed" : "#f0fdf4",
        padding: "3px 10px", borderRadius: 20,
        border: `1px solid ${elevado ? "#fed7aa" : "#bbf7d0"}`,
      }}>
        {elevado ? "⚠ Elevado" : "✓ Normal"}
      </span>
    </div>
  )
}

function SeccionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, color: "#94a3b8",
      letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px",
    }}>
      {children}
    </p>
  )
}

export default async function EstudianteDetallePage({ params }: Props) {
  const { id } = await params
  const [estudiante, todosEstudiantes] = await Promise.all([
    getEstudianteById(id),
    prisma.estudiante.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: "asc" } }),
  ])
  if (!estudiante) notFound()

  const tamizaje = estudiante.tamizajes[0] as MockTamizaje | undefined
  const cita     = estudiante.citas[0]
  const sem      = tamizaje ? SEM[tamizaje.semaforo] : null

  const porCategoria = tamizaje
    ? tamizaje.itemsCriticos.reduce<Record<string, MockItemCritico[]>>((acc, ic) => {
        if (!acc[ic.categoria]) acc[ic.categoria] = []
        acc[ic.categoria].push(ic)
        return acc
      }, {})
    : {}

  return (
    <div style={{ paddingTop: 8, maxWidth: 900 }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/estudiantes" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
            Estudiantes
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{estudiante.nombre}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Expediente clínico */}
          <Link href={`/expediente/${estudiante.id}`} style={{
            background: "white", color: "#0f766e",
            border: "1.5px solid #99f6e4",
            borderRadius: 8, padding: "7px 14px",
            fontSize: 12, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
            Expediente clínico
          </Link>

          {/* Agendar cita — botón cliente */}
          <AgendarCitaBtn
            estudianteId={estudiante.id}
            nombreEstudiante={estudiante.nombre}
            estudiantes={todosEstudiantes}
          />

          {/* Exportar */}
          {tamizaje && (
            <a href={`/api/export/excel?id=${estudiante.id}`} style={{
              background: "white", color: "#15803d",
              border: "1.5px solid #86efac",
              borderRadius: 8, padding: "7px 14px",
              fontSize: 12, fontWeight: 600, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              Exportar
            </a>
          )}
        </div>
      </div>

      {/* ── Perfil ── */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        borderRadius: 16, padding: "24px 28px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap",
        gap: 16, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "white", flexShrink: 0,
          }}>
            {iniciales(estudiante.nombre)}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: "0 0 4px" }}>
              {estudiante.nombre}
            </h1>
            <p style={{ fontSize: 13, color: "#a5b4fc", margin: 0 }}>
              {LABELS_SEXO[estudiante.sexo]} · {estudiante.edad} años ·{" "}
              {estudiante.grado} &quot;{estudiante.grupo}&quot; · {estudiante.escuela}
            </p>
            {tamizaje && (
              <p style={{ fontSize: 12, color: "#818cf8", margin: "4px 0 0" }}>
                Tamizaje aplicado el{" "}
                {new Date(tamizaje.fecha).toLocaleDateString("es-MX", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {sem && tamizaje && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{
              background: sem.bg, color: sem.color,
              border: `2px solid ${sem.borde}`,
              borderRadius: 10, padding: "8px 20px",
              fontSize: 14, fontWeight: 800,
            }}>
              {sem.label}
            </span>
            <span style={{ fontSize: 11, color: "#a5b4fc" }}>
              {LABELS_TIPO[tamizaje.tipoCaso] ?? "—"}
            </span>
          </div>
        )}
      </div>

      {/* ── Sin tamizaje ── */}
      {!tamizaje && (
        <div style={{
          background: "white", borderRadius: 14, padding: 48,
          textAlign: "center", border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
               stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
               style={{ margin: "0 auto 14px", display: "block" }}>
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
          <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, margin: "0 0 6px" }}>
            Sin tamizajes registrados
          </p>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
            Este estudiante aún no ha completado el cuestionario SENA.
          </p>
        </div>
      )}

      {tamizaje && sem && (
        <>
          {/* ── Evaluación automática ── */}
          {tamizaje.observaciones && (
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
                  {tamizaje.observaciones}
                </p>
              </div>
            </div>
          )}

          {/* ── Escalas de control ── */}
          <SeccionLabel>Escalas de control</SeccionLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12, marginBottom: 24,
          }}>
            <TarjetaControl label="Inconsistencia (INC)" valor={tamizaje.inc}  umbral={1.2} />
            <TarjetaControl label="Impresión negativa (NEG)" valor={tamizaje.neg} umbral={5} />
            <TarjetaControl label="Impresión positiva (POS)" valor={tamizaje.pos} umbral={8} />
          </div>

          {/* ── Ítems críticos ── */}
          <SeccionLabel>Ítems críticos</SeccionLabel>

          {tamizaje.itemsCriticos.length === 0 ? (
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
                  {tamizaje.itemsCriticos.length} ítems
                </span>
              </div>

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
                              {ic.etiquetaRespuesta}
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

          {/* ── Perfil de escalas T ── */}
          <SeccionLabel>Perfil de escalas T</SeccionLabel>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "-8px 0 14px" }}>
            Puntuaciones T normalizadas (media 50 · desviación 10). Elevado ≥ 70.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 16, marginBottom: 20,
          }}>
            {/* Gráfica radar */}
            <div style={{
              background: "white", borderRadius: 12,
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "20px 16px",
            }}>
              <GraficaRadar tamizaje={tamizaje} />
            </div>

            {/* Lista de escalas T con barras */}
            <div style={{
              background: "white", borderRadius: 12,
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "20px 24px",
              overflowY: "auto", maxHeight: 420,
            }}>
              {GRUPOS_ESCALAS_T.map((grupo, gi) => (
                <div key={grupo.titulo} style={{ marginBottom: gi < GRUPOS_ESCALAS_T.length - 1 ? 20 : 0 }}>
                  <p style={{
                    fontSize: 10, fontWeight: 800, color: "#94a3b8",
                    textTransform: "uppercase", letterSpacing: "0.07em",
                    margin: "0 0 8px", paddingBottom: 4,
                    borderBottom: "1px solid #f1f5f9",
                  }}>
                    {grupo.titulo}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {grupo.escalas.map(({ clave, label }) => {
                      const val = (tamizaje as unknown as Record<string, number>)[clave] ?? 50
                      const pct = Math.min(Math.round((val / 110) * 100), 100)
                      const color = barColorT(val)
                      return (
                        <div key={clave} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            fontSize: 11, color: "#64748b", flexShrink: 0, width: 140,
                          }}>
                            {label}
                          </span>
                          <div style={{
                            flex: 1, background: "#e2e8f0", borderRadius: 4, height: 6, overflow: "hidden",
                          }}>
                            <div style={{
                              width: `${pct}%`, height: "100%",
                              background: color, borderRadius: 4,
                            }} />
                          </div>
                          <span style={{
                            fontSize: 12, fontWeight: 700, width: 28, textAlign: "right",
                            color: val >= 70 ? "#dc2626" : val >= 60 ? "#f97316" : "#475569",
                          }}>
                            {val}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Cita programada ── */}
          {cita && (
            <>
              <SeccionLabel>Cita programada</SeccionLabel>
              <div style={{
                background: cita.estado === "PENDIENTE" ? "#fffbeb" : "#f0fdf4",
                border: `1px solid ${cita.estado === "PENDIENTE" ? "#fde68a" : "#bbf7d0"}`,
                borderLeft: `4px solid ${cita.estado === "PENDIENTE" ? "#f59e0b" : "#22c55e"}`,
                borderRadius: 12, padding: "16px 20px",
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke={cita.estado === "PENDIENTE" ? "#d97706" : "#16a34a"}
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                     style={{ flexShrink: 0, marginTop: 2 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>
                    {new Date(cita.fecha).toLocaleDateString("es-MX", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                    })}
                    {" "}—{" "}
                    <span style={{ color: cita.estado === "PENDIENTE" ? "#d97706" : "#16a34a" }}>
                      {cita.estado}
                    </span>
                  </p>
                  {cita.notas && (
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{cita.notas}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
