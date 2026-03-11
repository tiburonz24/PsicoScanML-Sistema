import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { Semaforo, Rol } from "@/lib/enums"
import { authOptions } from "@/lib/auth"
import FormExpediente from "@/components/expediente/FormExpediente"
import ExpedienteAcciones from "./ExpedienteAcciones"
import NivelRiesgoCard from "@/components/expediente/NivelRiesgoCard"
import ContactoPadresSection from "@/components/expediente/ContactoPadresSection"
import CanalizacionSection from "@/components/expediente/CanalizacionSection"

const ROLES_EXPEDIENTE: Rol[] = [Rol.PSICOLOGO, Rol.ORIENTADOR, Rol.ADMIN]

type Props = { params: Promise<{ id: string }> }

const SEM_COLORS: Record<Semaforo, { label: string; color: string; bg: string; border: string; dot: string }> = {
  VERDE:        { label: "Sin riesgo",  color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e" },
  AMARILLO:     { label: "Revisión",    color: "#92400e", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b" },
  ROJO:         { label: "Prioritario", color: "#991b1b", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444" },
  ROJO_URGENTE: { label: "URGENTE",     color: "#7f1d1d", bg: "#fee2e2", border: "#fca5a5", dot: "#dc2626" },
}

const LABELS_SEXO: Record<string, string> = {
  MASCULINO: "Masculino", FEMENINO: "Femenino", OTRO: "Otro",
}

function Seccion({ icon, titulo, children }: { icon: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "linear-gradient(135deg, rgba(13,71,90,0.1), rgba(26,122,138,0.1))",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#0D475A", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {titulo}
        </span>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>
      {children}
    </div>
  )
}

export default async function ExpedienteClinicoPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session || !ROLES_EXPEDIENTE.includes(session.user.rol as Rol)) redirect("/dashboard")

  const { id: estudianteId } = await params

  const estudiante = await prisma.estudiante.findUnique({
    where: { id: estudianteId },
    include: { tamizajes: { orderBy: { fecha: "desc" }, take: 1 } },
  })
  if (!estudiante) notFound()

  let expediente = await prisma.expedienteClinico.findUnique({ where: { estudianteId } })
  if (!expediente) {
    expediente = await prisma.expedienteClinico.create({ data: { estudianteId } })
  }

  const [sesiones, contactos, canalizaciones] = await Promise.all([
    prisma.sesion.findMany({ where: { estudianteId }, orderBy: { fecha: "desc" } }),
    prisma.contactoPadres.findMany({ where: { estudianteId }, orderBy: { fecha: "desc" } }),
    prisma.canalizacion.findMany({ where: { estudianteId }, orderBy: { fecha: "desc" } }),
  ])

  const tamizaje = estudiante.tamizajes[0] as typeof estudiante.tamizajes[0] | undefined
  const sem = tamizaje ? SEM_COLORS[tamizaje.semaforo as Semaforo] : null

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
        .filter(e => e.val >= 60)
        .sort((a, b) => b.val - a.val)
        .slice(0, 5)
    : []

  const iniciales = (() => {
    const p = estudiante.nombre.trim().split(/\s+/)
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : estudiante.nombre.slice(0, 2).toUpperCase()
  })()

  const contactosDto = contactos.map(c => ({
    id: c.id, fecha: c.fecha.toISOString(),
    tipo: c.tipo as string, resultado: c.resultado as string, notas: c.notas,
  }))

  const canalizacionesDto = canalizaciones.map(c => ({
    id: c.id, fecha: c.fecha.toISOString(),
    institucion: c.institucion, tipoInstitucion: c.tipoInstitucion as string,
    tipoAtencion: c.tipoAtencion, motivo: c.motivo, nivelRiesgo: c.nivelRiesgo,
    urgente: c.urgente, estado: c.estado as string, notas: c.notas,
    firmaPadres: c.firmaPadres, documentoRecibido: c.documentoRecibido,
    tipoDocumento: c.tipoDocumento, fechaDocumento: c.fechaDocumento?.toISOString() ?? null,
  }))

  const sesionesDto = sesiones.map(s => ({
    id: s.id, fecha: s.fecha.toISOString(), tipo: s.tipo as string,
    motivo: s.motivo, notas: s.notas, acuerdos: s.acuerdos, planActualizado: s.planActualizado,
  }))

  return (
    <div style={{ paddingTop: 8, maxWidth: 900, display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Link href="/estudiantes" style={{ fontSize: 13, color: "#1A7A8A", textDecoration: "none", fontWeight: 500 }}>
          Estudiantes
        </Link>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <Link href={`/estudiantes/${estudianteId}`} style={{ fontSize: 13, color: "#1A7A8A", textDecoration: "none", fontWeight: 500 }}>
          {estudiante.nombre}
        </Link>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span style={{ fontSize: 13, color: "#0D475A", fontWeight: 600 }}>Expediente clínico</span>
      </div>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #0D475A 0%, #1A7A8A 100%)",
        borderRadius: 16, padding: "24px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Avatar */}
          <div style={{
            width: 58, height: 58, borderRadius: 16, flexShrink: 0,
            background: "rgba(255,255,255,0.2)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "white",
            fontFamily: "var(--font-syne), sans-serif",
          }}>
            {iniciales}
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", margin: "0 0 4px",
              textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Expediente Clínico
            </p>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: "0 0 6px",
              fontFamily: "var(--font-syne), sans-serif" }}>
              {estudiante.nombre}
            </h1>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                `${estudiante.grado} Sem. · Grupo ${estudiante.grupo}`,
                LABELS_SEXO[estudiante.sexo] ?? estudiante.sexo,
                `${estudiante.edad} años`,
              ].map((dato, i) => (
                <span key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                  {i > 0 && <span style={{ marginRight: 12, opacity: 0.4 }}>·</span>}
                  {dato}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Semáforo + stats */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          {sem ? (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 99,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: 12, fontWeight: 700, color: "white",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: sem.dot }} />
              {sem.label}
            </span>
          ) : (
            <span style={{
              padding: "6px 14px", borderRadius: 99,
              background: "rgba(255,255,255,0.1)",
              fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)",
            }}>
              Sin tamizaje
            </span>
          )}
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { n: sesiones.length,      label: "Sesiones" },
              { n: contactos.length,     label: "Contactos" },
              { n: canalizaciones.length, label: "Canalizaciones" },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0,
                  fontFamily: "var(--font-syne), sans-serif", lineHeight: 1 }}>{n}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: "3px 0 0" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tamizaje SENA ── */}
      {tamizaje && sem && (
        <Seccion
          icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#1A7A8A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          titulo="Tamizaje SENA"
        >
          <div style={{
            background: sem.bg, border: `1px solid ${sem.border}`,
            borderRadius: 12, padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 99, background: "white",
              border: `1px solid ${sem.border}`,
              fontSize: 12, fontWeight: 700, color: sem.color,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: sem.dot }} />
              {sem.label}
            </span>
            {escalasTop.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {escalasTop.map(({ label, val }) => (
                  <span key={label} style={{
                    fontSize: 11, fontWeight: 700,
                    background: "white", color: val >= 70 ? "#dc2626" : "#d97706",
                    border: `1px solid ${val >= 70 ? "#fecaca" : "#fde68a"}`,
                    borderRadius: 6, padding: "3px 10px",
                  }}>
                    {label} {val}
                  </span>
                ))}
              </div>
            )}
            <Link href={`/estudiantes/${estudianteId}`} style={{
              marginLeft: "auto", fontSize: 11, color: sem.color,
              textDecoration: "none", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              Ver detalle completo
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>
        </Seccion>
      )}

      {/* ── Nivel de riesgo clínico ── */}
      <Seccion
        icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#1A7A8A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2="12.01" y2={17}/></svg>}
        titulo="Valoración de riesgo clínico"
      >
        <NivelRiesgoCard estudianteId={estudianteId} nivelRiesgo={expediente.nivelRiesgo ?? null} />
      </Seccion>

      {/* ── Expediente editable ── */}
      <Seccion
        icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#1A7A8A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1={16} y1={13} x2={8} y2={13}/><line x1={16} y1={17} x2={8} y2={17}/><polyline points="10 9 9 9 8 9"/></svg>}
        titulo="Expediente clínico"
      >
        <FormExpediente
          estudianteId={estudianteId}
          motivoConsulta={expediente.motivoConsulta}
          antecedentes={expediente.antecedentes}
          diagnosticoPreliminar={expediente.diagnosticoPreliminar}
          planIntervencion={expediente.planIntervencion}
          estado={expediente.estado}
        />
      </Seccion>

      {/* ── Contacto con padres ── */}
      <Seccion
        icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#1A7A8A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>}
        titulo="Contacto con padres / tutor"
      >
        <ContactoPadresSection estudianteId={estudianteId} contactos={contactosDto} />
      </Seccion>

      {/* ── Canalizaciones ── */}
      <Seccion
        icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#1A7A8A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>}
        titulo="Canalizaciones externas"
      >
        <CanalizacionSection estudianteId={estudianteId} canalizaciones={canalizacionesDto} />
      </Seccion>

      {/* ── Sesiones ── */}
      <Seccion
        icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#1A7A8A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x={3} y={4} width={18} height={18} rx={2} ry={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>}
        titulo="Historial de sesiones"
      >
        <ExpedienteAcciones estudianteId={estudianteId} sesiones={sesionesDto} />
      </Seccion>

    </div>
  )
}
