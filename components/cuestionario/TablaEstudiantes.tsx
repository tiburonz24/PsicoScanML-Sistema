"use client"

import Link from "next/link"
import { Semaforo } from "@/lib/enums"

export type FilaEstudiante = {
  id: string
  nombre: string
  gradoGrupo: string
  semaforo: string | null
  fechaFormateada: string | null
}

const SEM: Record<Semaforo, { label: string; color: string; bg: string; dot: string }> = {
  VERDE:        { label: "Sin riesgo",  color: "#15803d", bg: "#f0fdf4", dot: "#22c55e" },
  AMARILLO:     { label: "Revisión",    color: "#92400e", bg: "#fffbeb", dot: "#f59e0b" },
  ROJO:         { label: "Prioritario", color: "#991b1b", bg: "#fef2f2", dot: "#ef4444" },
  ROJO_URGENTE: { label: "URGENTE",     color: "#7f1d1d", bg: "#fee2e2", dot: "#dc2626" },
}

function Iniciales({ nombre }: { nombre: string }) {
  const partes = nombre.trim().split(/\s+/)
  const ini = partes.length >= 2
    ? (partes[0][0] + partes[1][0]).toUpperCase()
    : nombre.slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: "linear-gradient(135deg, #0D475A, #1A7A8A)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, color: "white",
      fontFamily: "var(--font-syne), sans-serif",
    }}>
      {ini}
    </div>
  )
}

export default function TablaEstudiantes({ filas }: { filas: FilaEstudiante[] }) {
  if (filas.length === 0) {
    return (
      <div style={{
        background: "white", borderRadius: 14,
        border: "1px solid #e2e8f0",
        padding: "56px 32px",
        textAlign: "center",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
          background: "linear-gradient(135deg, rgba(13,71,90,0.08), rgba(26,122,138,0.08))",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
               stroke="#1A7A8A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx={9} cy={7} r={4}/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#0D475A", margin: "0 0 6px", fontFamily: "var(--font-syne), sans-serif" }}>
          Sin estudiantes registrados
        </p>
        <p style={{ fontSize: 13, color: "#4A5568", margin: 0 }}>
          Registra el primer estudiante usando el botón superior.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: "white", borderRadius: 14,
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
    }}>
      {/* Encabezado de tabla */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1.4fr auto",
        padding: "10px 20px",
        background: "#f8fbfc",
        borderBottom: "1px solid #e2e8f0",
      }}>
        {["Estudiante", "Grado / Grupo", "Último tamizaje", ""].map((h, i) => (
          <span key={i} style={{
            fontSize: 11, fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>{h}</span>
        ))}
      </div>

      {/* Filas */}
      {filas.map((est, idx) => {
        const sem = est.semaforo ? SEM[est.semaforo as Semaforo] : null
        return (
          <div
            key={est.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1.4fr auto",
              alignItems: "center",
              padding: "12px 20px",
              borderBottom: idx < filas.length - 1 ? "1px solid #f0f5f7" : "none",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f8fbfc")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {/* Nombre */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <Iniciales nombre={est.nombre} />
              <span style={{
                fontSize: 14, fontWeight: 600, color: "#0D475A",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {est.nombre}
              </span>
            </div>

            {/* Grado/Grupo */}
            <span style={{ fontSize: 13, color: "#4A5568" }}>{est.gradoGrupo}</span>

            {/* Semáforo */}
            <div>
              {sem ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 99,
                    background: sem.bg, fontSize: 11, fontWeight: 700, color: sem.color,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", background: sem.dot, flexShrink: 0,
                    }} />
                    {sem.label}
                  </span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{est.fechaFormateada}</span>
                </div>
              ) : (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 10px", borderRadius: 99,
                  background: "#f1f5f9", fontSize: 11, fontWeight: 600, color: "#94a3b8",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#cbd5e1", flexShrink: 0 }} />
                  Sin tamizaje
                </span>
              )}
            </div>

            {/* Acción */}
            <Link
              href={`/estudiantes/${est.id}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "5px 12px", borderRadius: 7,
                border: "1.5px solid #dce8ec", background: "white",
                fontSize: 12, fontWeight: 600, color: "#1A7A8A",
                textDecoration: "none", whiteSpace: "nowrap",
                transition: "border-color 0.12s",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "#1A7A8A")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "#dce8ec")}
            >
              Ver perfil
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        )
      })}

      {/* Pie con total */}
      <div style={{
        padding: "10px 20px",
        background: "#f8fbfc",
        borderTop: "1px solid #e2e8f0",
        fontSize: 12, color: "#94a3b8",
      }}>
        {filas.length} estudiante{filas.length !== 1 ? "s" : ""} en total
      </div>
    </div>
  )
}
