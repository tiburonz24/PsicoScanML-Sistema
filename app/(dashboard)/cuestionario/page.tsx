import { getEstudiantes } from "@/lib/data/mock"
import BannerEnlace from "@/components/cuestionario/BannerEnlace"
import TablaEstudiantes from "@/components/cuestionario/TablaEstudiantes"
import type { FilaEstudiante } from "@/components/cuestionario/TablaEstudiantes"
import { headers } from "next/headers"

type Props = { searchParams: Promise<{ registrado?: string; token?: string; nombre?: string }> }

export default async function CuestionarioPage({ searchParams }: Props) {
  const { registrado, token, nombre } = await searchParams
  const estudiantes = await getEstudiantes()

  const hdrs = await headers()
  const host = hdrs.get("host") ?? "localhost:3000"
  const protocol = host.startsWith("localhost") ? "http" : "https"
  const baseUrl = `${protocol}://${host}`
  const enlace = token ? `${baseUrl}/tamizaje/${token}` : null

  const filas: FilaEstudiante[] = estudiantes.map((est) => {
    const ultimo = est.tamizajes[0]
    return {
      id:              est.id,
      nombre:          est.nombre,
      gradoGrupo:      `${est.grado} "${est.grupo}"`,
      semaforo:        ultimo?.semaforo ?? null,
      fechaFormateada: ultimo
        ? new Date(ultimo.fecha).toLocaleDateString("es-MX")
        : null,
    }
  })

  const total        = filas.length
  const conTamizaje  = filas.filter(f => f.semaforo !== null).length
  const sinTamizaje  = total - conTamizaje

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #0D475A 0%, #1A7A8A 100%)",
        borderRadius: 16, padding: "24px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
                 stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1={16} y1={13} x2={8} y2={13}/>
              <line x1={16} y1={17} x2={8} y2={17}/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <h1 style={{
              fontSize: 20, fontWeight: 800, color: "white",
              margin: "0 0 4px", fontFamily: "var(--font-syne), sans-serif",
            }}>
              Cuestionario SENA
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", margin: 0 }}>
              Gestión de aplicaciones del cuestionario por estudiante
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { valor: total,       label: "Registrados" },
            { valor: conTamizaje, label: "Con tamizaje" },
            { valor: sinTamizaje, label: "Pendientes" },
          ].map(({ valor, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{
                fontSize: 26, fontWeight: 800, color: "white", margin: 0,
                fontFamily: "var(--font-syne), sans-serif", lineHeight: 1,
              }}>{valor}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "4px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>


      {/* ── Banner enlace (tras registro) ── */}
      {registrado && enlace && nombre && (
        <BannerEnlace nombre={decodeURIComponent(nombre)} enlace={enlace} />
      )}
      {registrado && !enlace && (
        <div style={{
          padding: "14px 20px", borderRadius: 12,
          background: "rgba(42,191,191,0.07)",
          border: "1px solid rgba(42,191,191,0.3)",
          borderLeft: "4px solid #2ABFBF",
          fontSize: 13, fontWeight: 600, color: "#1A7A8A",
        }}>
          Estudiante registrado correctamente.
        </div>
      )}

      {/* ── Tabla ── */}
      <TablaEstudiantes filas={filas} />

    </div>
  )
}
