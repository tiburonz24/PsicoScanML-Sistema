"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"

type Props = {
  grupos: string[]
  grados: string[]
  activos: number
  total: number
}

const SEM_OPTS = [
  { value: "VERDE",        label: "Sin riesgo",  color: "#15803d", bg: "#f0fdf4", borde: "#86efac", dot: "#22c55e" },
  { value: "AMARILLO",     label: "Revisión",    color: "#92400e", bg: "#fffbeb", borde: "#fde68a", dot: "#f59e0b" },
  { value: "ROJO",         label: "Prioritario", color: "#991b1b", bg: "#fef2f2", borde: "#fca5a5", dot: "#ef4444" },
  { value: "ROJO_URGENTE", label: "URGENTE",     color: "#7f1d1d", bg: "#fee2e2", borde: "#f87171", dot: "#dc2626" },
] as const

export default function FiltrosEstudiantes({ grupos, grados, activos, total }: Props) {
  const router     = useRouter()
  const pathname   = usePathname()
  const params     = useSearchParams()

  const semActivo  = params.get("semaforo") ?? ""
  const grupoActivo = params.get("grupo")   ?? ""
  const gradoActivo = params.get("grado")   ?? ""
  const fechaDesde = params.get("desde")    ?? ""
  const fechaHasta = params.get("hasta")    ?? ""

  // Búsqueda con debounce local para no enviar cada keystroke al servidor
  const [localQ, setLocalQ] = useState(params.get("q") ?? "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sincronizar localQ si el param cambia externamente (ej. limpiar filtros)
  useEffect(() => {
    setLocalQ(params.get("q") ?? "")
  }, [params])

  const pushParams = useCallback((updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    router.push(`${pathname}?${next.toString()}`)
  }, [params, router, pathname])

  function toggleSemaforo(val: string) {
    pushParams({ semaforo: semActivo === val ? "" : val })
  }

  function handleQ(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setLocalQ(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => pushParams({ q: v }), 320)
  }

  function clearAll() {
    setLocalQ("")
    router.push(pathname)
  }

  const hayFiltros = !!(semActivo || grupoActivo || gradoActivo || localQ || fechaDesde || fechaHasta)
  const filtrado   = activos < total

  return (
    <div style={{ marginBottom: 20 }}>

      {/* ── Fila 1: pills de semáforo ───────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 2 }}>
          Nivel
        </span>

        {SEM_OPTS.map((opt) => {
          const activo = semActivo === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => toggleSemaforo(opt.value)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                border: `1.5px solid ${activo ? opt.borde : "#e2e8f0"}`,
                background: activo ? opt.bg : "white",
                color: activo ? opt.color : "#64748b",
                fontSize: 12, fontWeight: activo ? 700 : 500,
                transition: "all 0.12s",
                outline: "none",
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: activo ? opt.dot : "#cbd5e1",
                flexShrink: 0,
              }} />
              {opt.label}
              {activo && (
                <span style={{
                  marginLeft: 2, fontSize: 10, fontWeight: 800,
                  background: opt.color, color: "white",
                  borderRadius: "50%", width: 14, height: 14,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  ×
                </span>
              )}
            </button>
          )
        })}

        {hayFiltros && (
          <button
            onClick={clearAll}
            style={{
              marginLeft: "auto", fontSize: 11, fontWeight: 600,
              color: "#64748b", background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              padding: "4px 8px", borderRadius: 6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Fila 2: búsqueda + selects + fechas ─────────────────────────── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>

        {/* Búsqueda por nombre */}
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre…"
            value={localQ}
            onChange={handleQ}
            style={{
              width: "100%", padding: "8px 10px 8px 32px",
              border: "1.5px solid #e2e8f0", borderRadius: 8,
              fontSize: 13, outline: "none", color: "#0f172a",
              background: "white", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Grado */}
        <select
          value={gradoActivo}
          onChange={(e) => pushParams({ grado: e.target.value })}
          style={{
            padding: "8px 12px", border: "1.5px solid #e2e8f0",
            borderRadius: 8, fontSize: 13, color: gradoActivo ? "#0f172a" : "#94a3b8",
            background: "white", cursor: "pointer", outline: "none",
            minWidth: 120,
          }}
        >
          <option value="">Todos los grados</option>
          {grados.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        {/* Grupo */}
        <select
          value={grupoActivo}
          onChange={(e) => pushParams({ grupo: e.target.value })}
          style={{
            padding: "8px 12px", border: "1.5px solid #e2e8f0",
            borderRadius: 8, fontSize: 13, color: grupoActivo ? "#0f172a" : "#94a3b8",
            background: "white", cursor: "pointer", outline: "none",
            minWidth: 120,
          }}
        >
          <option value="">Todos los grupos</option>
          {grupos.map((g) => <option key={g} value={g}>Grupo {g}</option>)}
        </select>

        {/* Fecha desde */}
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => pushParams({ desde: e.target.value })}
          title="Desde"
          style={{
            padding: "8px 10px", border: "1.5px solid #e2e8f0",
            borderRadius: 8, fontSize: 13, color: fechaDesde ? "#0f172a" : "#94a3b8",
            background: "white", outline: "none", cursor: "pointer",
          }}
        />

        {/* Fecha hasta */}
        <input
          type="date"
          value={fechaHasta}
          min={fechaDesde || undefined}
          onChange={(e) => pushParams({ hasta: e.target.value })}
          title="Hasta"
          style={{
            padding: "8px 10px", border: "1.5px solid #e2e8f0",
            borderRadius: 8, fontSize: 13, color: fechaHasta ? "#0f172a" : "#94a3b8",
            background: "white", outline: "none", cursor: "pointer",
          }}
        />
      </div>

      {/* ── Fila 3: contador de resultados ──────────────────────────────── */}
      {filtrado && (
        <div style={{
          marginTop: 10, padding: "8px 14px",
          background: "#f8fafc", borderRadius: 8,
          border: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span style={{ fontSize: 12, color: "#475569" }}>
            Mostrando{" "}
            <strong style={{ color: "#0f172a" }}>{activos}</strong>{" "}
            de <strong style={{ color: "#0f172a" }}>{total}</strong> estudiantes
          </span>
          <button
            onClick={clearAll}
            style={{
              marginLeft: "auto", fontSize: 11, color: "#6366f1",
              background: "none", border: "none", cursor: "pointer",
              fontWeight: 600, padding: 0,
            }}
          >
            Ver todos
          </button>
        </div>
      )}
    </div>
  )
}
