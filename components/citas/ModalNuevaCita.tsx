"use client"

import { useActionState, useState, useRef, useEffect } from "react"
import { agendarCita } from "@/lib/actions/cita"

type EstudianteOpcion = { id: string; nombre: string }

type Props = {
  estudiantes:       EstudianteOpcion[]
  estudianteId?:     string
  nombreEstudiante?: string
  onClose:           () => void
}

const OVERLAY: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 50,
}
const CARD: React.CSSProperties = {
  background: "white", borderRadius: 16,
  padding: "28px 32px", width: "100%", maxWidth: 440,
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
}
const LABEL: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 5,
}
const INPUT: React.CSSProperties = {
  width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, color: "#0f172a",
  outline: "none", boxSizing: "border-box",
}
const BTN_PRIMARY: React.CSSProperties = {
  background: "#4f46e5", color: "white", border: "none",
  borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
  cursor: "pointer",
}
const BTN_GHOST: React.CSSProperties = {
  background: "none", color: "#64748b", border: "1.5px solid #e2e8f0",
  borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
  cursor: "pointer",
}

export default function ModalNuevaCita({ estudiantes, estudianteId, nombreEstudiante, onClose }: Props) {
  const [state, action, isPending] = useActionState(agendarCita, undefined)
  const [fechaError, setFechaError] = useState<string | null>(null)

  // ── Combobox estado ──────────────────────────────────────────────────────────
  const [query, setQuery]               = useState("")
  const [selectedId, setSelectedId]     = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const comboRef  = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const listRef   = useRef<HTMLUListElement>(null)

  const preSeleccionado = Boolean(estudianteId)

  const filtrados = query.trim().length === 0
    ? estudiantes.slice(0, 30)
    : estudiantes.filter(e => e.nombre.toLowerCase().includes(query.toLowerCase())).slice(0, 30)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [])

  // Scroll al ítem resaltado
  useEffect(() => {
    if (highlightIdx < 0 || !listRef.current) return
    const item = listRef.current.children[highlightIdx] as HTMLElement | undefined
    item?.scrollIntoView({ block: "nearest" })
  }, [highlightIdx])

  function seleccionar(est: EstudianteOpcion) {
    setSelectedId(est.id)
    setQuery(est.nombre)
    setDropdownOpen(false)
    setHighlightIdx(-1)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelectedId("")
    setDropdownOpen(true)
    setHighlightIdx(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!dropdownOpen) {
      if (e.key === "ArrowDown") { setDropdownOpen(true); setHighlightIdx(0) }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIdx(i => Math.min(i + 1, filtrados.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIdx(i => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlightIdx >= 0 && filtrados[highlightIdx]) seleccionar(filtrados[highlightIdx])
    } else if (e.key === "Escape") {
      setDropdownOpen(false)
    }
  }

  function handleClear() {
    setQuery("")
    setSelectedId("")
    setDropdownOpen(true)
    inputRef.current?.focus()
  }

  // Resaltar coincidencia en el texto
  function resaltar(nombre: string) {
    if (!query.trim()) return <>{nombre}</>
    const idx = nombre.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return <>{nombre}</>
    return (
      <>
        {nombre.slice(0, idx)}
        <span style={{ background: "#e0e7ff", color: "#3730a3", borderRadius: 2, padding: "0 1px" }}>
          {nombre.slice(idx, idx + query.length)}
        </span>
        {nombre.slice(idx + query.length)}
      </>
    )
  }

  function handleFechaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (!val) { setFechaError(null); return }
    const dia = new Date(val).getDay()
    if (dia === 0 || dia === 6) {
      setFechaError("Solo se permiten citas de lunes a viernes.")
    } else {
      setFechaError(null)
    }
  }

  const sinSeleccion = !preSeleccionado && !selectedId

  return (
    <div style={OVERLAY} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Agendar cita</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94a3b8" }}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Estudiante */}
          <div>
            <label style={LABEL}>Estudiante</label>

            {preSeleccionado ? (
              /* Estudiante ya fijado (viene de la ficha) */
              <>
                <input type="hidden" name="estudianteId" value={estudianteId} />
                <div style={{
                  ...INPUT, background: "#f8fafc", color: "#475569",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {nombreEstudiante}
                </div>
              </>
            ) : (
              /* Combobox de búsqueda */
              <>
                <input type="hidden" name="estudianteId" value={selectedId} />
                <div ref={comboRef} style={{ position: "relative" }}>
                  {/* Campo de búsqueda */}
                  <div style={{ position: "relative" }}>
                    {/* Icono lupa */}
                    <svg
                      width={15} height={15} fill="none" viewBox="0 0 24 24"
                      stroke={dropdownOpen ? "#4f46e5" : "#94a3b8"} strokeWidth={2.2}
                      style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "stroke 0.15s" }}
                    >
                      <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Buscar estudiante por nombre…"
                      value={query}
                      onChange={handleInputChange}
                      onFocus={() => setDropdownOpen(true)}
                      onKeyDown={handleKeyDown}
                      autoComplete="off"
                      style={{
                        ...INPUT,
                        paddingLeft: 34,
                        paddingRight: selectedId ? 34 : 12,
                        borderColor: dropdownOpen ? "#6366f1" : selectedId ? "#86efac" : "#e2e8f0",
                        boxShadow: dropdownOpen ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                    />
                    {/* Check si hay selección o botón limpiar */}
                    {selectedId ? (
                      <button
                        type="button"
                        onClick={handleClear}
                        title="Cambiar estudiante"
                        style={{
                          position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer", padding: 2,
                          color: "#94a3b8", display: "flex",
                        }}
                      >
                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : null}
                  </div>

                  {/* Indicador de seleccionado */}
                  {selectedId && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 5,
                      marginTop: 5, fontSize: 12, color: "#15803d",
                    }}>
                      <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Estudiante seleccionado
                    </div>
                  )}

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                      background: "white",
                      border: "1.5px solid #e0e7ff",
                      borderRadius: 10,
                      boxShadow: "0 8px 24px rgba(79,70,229,0.12)",
                      zIndex: 100,
                      overflow: "hidden",
                    }}>
                      {/* Contador */}
                      <div style={{
                        padding: "7px 12px",
                        fontSize: 11, fontWeight: 600, color: "#94a3b8",
                        borderBottom: "1px solid #f1f5f9",
                        background: "#fafafa",
                      }}>
                        {filtrados.length === 0
                          ? "Sin resultados"
                          : `${filtrados.length} estudiante${filtrados.length !== 1 ? "s" : ""}${query.trim() ? ` para "${query}"` : ""}`
                        }
                      </div>

                      {/* Lista */}
                      <ul
                        ref={listRef}
                        style={{
                          margin: 0, padding: "4px 0",
                          listStyle: "none",
                          maxHeight: 220,
                          overflowY: "auto",
                        }}
                      >
                        {filtrados.length === 0 ? (
                          <li style={{ padding: "14px 12px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
                            No se encontró ningún estudiante
                          </li>
                        ) : (
                          filtrados.map((est, idx) => {
                            const highlighted = idx === highlightIdx
                            return (
                              <li
                                key={est.id}
                                onMouseDown={(e) => { e.preventDefault(); seleccionar(est) }}
                                onMouseEnter={() => setHighlightIdx(idx)}
                                style={{
                                  padding: "9px 12px",
                                  cursor: "pointer",
                                  display: "flex", alignItems: "center", gap: 9,
                                  background: highlighted ? "#eef2ff" : "white",
                                  borderLeft: highlighted ? "3px solid #6366f1" : "3px solid transparent",
                                  transition: "background 0.1s",
                                }}
                              >
                                {/* Avatar */}
                                <div style={{
                                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                  background: highlighted ? "#6366f1" : "#e0e7ff",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 11, fontWeight: 700,
                                  color: highlighted ? "white" : "#4f46e5",
                                  transition: "background 0.1s, color 0.1s",
                                }}>
                                  {est.nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                {/* Nombre con resaltado */}
                                <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>
                                  {resaltar(est.nombre)}
                                </span>
                              </li>
                            )
                          })
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Fecha y hora */}
          <div>
            <label style={LABEL}>Fecha y hora</label>
            <input
              type="datetime-local"
              name="fecha"
              required
              style={{
                ...INPUT,
                borderColor: fechaError ? "#f87171" : "#e2e8f0",
              }}
              min={new Date().toISOString().slice(0, 16)}
              onChange={handleFechaChange}
            />
            {fechaError && (
              <p style={{
                fontSize: 12, color: "#dc2626", margin: "5px 0 0",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {fechaError}
              </p>
            )}
            {!fechaError && (
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>
                Solo lunes a viernes
              </p>
            )}
          </div>

          {/* Notas */}
          <div>
            <label style={LABEL}>Notas (opcional)</label>
            <textarea
              name="notas"
              rows={3}
              placeholder="Motivo de la cita, instrucciones…"
              style={{ ...INPUT, resize: "vertical" }}
            />
          </div>

          {state?.error && (
            <p style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", margin: 0 }}>
              {state.error}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" onClick={onClose} style={BTN_GHOST} disabled={isPending}>
              Cancelar
            </button>
            <button type="submit" style={{ ...BTN_PRIMARY, opacity: isPending || !!fechaError || sinSeleccion ? 0.5 : 1, cursor: isPending || !!fechaError || sinSeleccion ? "not-allowed" : "pointer" }} disabled={isPending || !!fechaError || sinSeleccion}>
              {isPending ? "Agendando…" : "Agendar cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
