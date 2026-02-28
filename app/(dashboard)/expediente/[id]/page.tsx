import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Semaforo } from "@/lib/enums"
import FormExpediente from "@/components/expediente/FormExpediente"
import ExpedienteAcciones from "./ExpedienteAcciones"

type Props = { params: Promise<{ id: string }> }

const SEM_COLORS: Record<Semaforo, { label: string; color: string; bg: string; border: string }> = {
  VERDE:        { label: "Sin riesgo",  color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  AMARILLO:     { label: "Revisión",    color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  ROJO:         { label: "Prioritario", color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
  ROJO_URGENTE: { label: "URGENTE",     color: "#7f1d1d", bg: "#fee2e2", border: "#fca5a5" },
}

const LABELS_TIPO_SESION: Record<string, string> = {
  EVALUACION_INICIAL: "Evaluación inicial",
  SEGUIMIENTO:        "Seguimiento",
  INTERVENCION:       "Intervención",
  CRISIS:             "Crisis",
  CIERRE:             "Cierre",
  DEVOLUCION:         "Devolución",
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

export default async function ExpedienteClinicoPage({ params }: Props) {
  const { id: estudianteId } = await params

  // Fetch estudiante con tamizaje y expediente
  const estudiante = await prisma.estudiante.findUnique({
    where: { id: estudianteId },
    include: {
      tamizajes: { orderBy: { fecha: "desc" }, take: 1 },
    },
  })
  if (!estudiante) notFound()

  // Fetch o crear expediente; sesiones se consultan aparte (por estudianteId)
  let expediente = await prisma.expedienteClinico.findUnique({
    where: { estudianteId },
  })
  if (!expediente) {
    expediente = await prisma.expedienteClinico.create({
      data: { estudianteId },
    })
  }

  const sesiones = await prisma.sesion.findMany({
    where: { estudianteId },
    orderBy: { fecha: "desc" },
  })

  const tamizaje = estudiante.tamizajes[0] as typeof estudiante.tamizajes[0] | undefined
  const sem = tamizaje ? SEM_COLORS[tamizaje.semaforo as Semaforo] : null

  // Top 3 escalas más elevadas del tamizaje
  const escalasTop = tamizaje
    ? [
        { key: "dep_t", label: "DEP", val: tamizaje.dep_t },
        { key: "ans_t", label: "ANS", val: tamizaje.ans_t },
        { key: "asc_t", label: "ASC", val: tamizaje.asc_t },
        { key: "som_t", label: "SOM", val: tamizaje.som_t },
        { key: "pst_t", label: "PST", val: tamizaje.pst_t },
        { key: "obs_t", label: "OBS", val: tamizaje.obs_t },
        { key: "ate_t", label: "ATE", val: tamizaje.ate_t },
        { key: "ira_t", label: "IRA", val: tamizaje.ira_t },
        { key: "agr_t", label: "AGR", val: tamizaje.agr_t },
        { key: "fam_t", label: "FAM", val: tamizaje.fam_t },
        { key: "esc_t", label: "ESC", val: tamizaje.esc_t },
        { key: "glo_t", label: "GLO", val: tamizaje.glo_t },
      ]
        .filter((e) => e.val >= 60)
        .sort((a, b) => b.val - a.val)
        .slice(0, 5)
    : []

  // Serializar sesiones para el cliente
  const sesionesDto = sesiones.map((s) => ({
    id:              s.id,
    fecha:           s.fecha.toISOString(),
    tipo:            s.tipo as string,
    motivo:          s.motivo,
    notas:           s.notas,
    acuerdos:        s.acuerdos,
    planActualizado: s.planActualizado,
  }))

  return (
    <div style={{ paddingTop: 8, maxWidth: 860 }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
        <Link href="/estudiantes" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
          Estudiantes
        </Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <Link href={`/estudiantes/${estudianteId}`} style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
          {estudiante.nombre}
        </Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>Expediente</span>
      </div>

      {/* ── Header con nombre ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: 14, padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12, marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: "0 0 4px" }}>
            {estudiante.nombre}
          </h1>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            {estudiante.grado} &quot;{estudiante.grupo}&quot; · {estudiante.escuela}
          </p>
        </div>
        {sem && (
          <span style={{
            fontSize: 12, fontWeight: 800, padding: "6px 16px", borderRadius: 8,
            background: sem.bg, color: sem.color, border: `2px solid ${sem.border}`,
          }}>
            {sem.label}
          </span>
        )}
      </div>

      {/* ── Resumen tamizaje SENA ── */}
      {tamizaje && sem && escalasTop.length > 0 && (
        <>
          <SeccionLabel>Tamizaje SENA</SeccionLabel>
          <div style={{
            background: sem.bg, border: `1px solid ${sem.border}`,
            borderRadius: 12, padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 16,
            flexWrap: "wrap", marginBottom: 24,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: sem.color }}>
              {sem.label}
            </span>
            <span style={{ color: sem.border }}>·</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {escalasTop.map(({ label, val }) => (
                <span key={label} style={{
                  fontSize: 12, fontWeight: 700,
                  background: "white", color: val >= 70 ? "#dc2626" : "#d97706",
                  border: `1px solid ${val >= 70 ? "#fecaca" : "#fde68a"}`,
                  borderRadius: 6, padding: "3px 10px",
                }}>
                  {label} {val}
                </span>
              ))}
            </div>
            <Link href={`/estudiantes/${estudianteId}`} style={{
              marginLeft: "auto", fontSize: 11, color: sem.color,
              textDecoration: "underline", fontWeight: 600,
            }}>
              Ver detalle →
            </Link>
          </div>
        </>
      )}

      {/* ── Expediente (form editable) ── */}
      <div style={{ marginBottom: 28 }}>
        <FormExpediente
          estudianteId={estudianteId}
          motivoConsulta={expediente.motivoConsulta}
          antecedentes={expediente.antecedentes}
          diagnosticoPreliminar={expediente.diagnosticoPreliminar}
          planIntervencion={expediente.planIntervencion}
          estado={expediente.estado}
        />
      </div>

      {/* ── Sesiones con acciones (client island) ── */}
      <ExpedienteAcciones
        estudianteId={estudianteId}
        sesiones={sesionesDto}
      />
    </div>
  )
}
