"use client"

import { useRef, useState } from "react"
import Link from "next/link"

type MuestraRow = {
  nombre: string
  semaforo: string
  tipoCaso: string
  edad: number
  sexo: string
}

type Resultado = {
  insertados:  number
  omitidos:    number
  duplicados:  number
  errores:     string[]
  muestra:     MuestraRow[]
  error?:      string
}

type Progreso = {
  procesados: number
  total:      number
  insertados: number
  omitidos:   number
  duplicados: number
}

const SEMAFORO_STYLE: Record<string, { label: string; color: string; bg: string; dot: string; borde: string }> = {
  VERDE:        { label: "Sin riesgo",  color: "#15803d", bg: "#f0fdf4", dot: "#22c55e", borde: "#86efac" },
  AMARILLO:     { label: "Revisión",    color: "#92400e", bg: "#fffbeb", dot: "#f59e0b", borde: "#fde68a" },
  ROJO:         { label: "Prioritario", color: "#991b1b", bg: "#fef2f2", dot: "#ef4444", borde: "#fca5a5" },
  ROJO_URGENTE: { label: "URGENTE",     color: "#7f1d1d", bg: "#fee2e2", dot: "#dc2626", borde: "#f87171" },
}

const SEXO_LABEL: Record<string, string> = { MASCULINO: "M", FEMENINO: "F", OTRO: "O" }

export default function ImportarRespuestas() {
  const [abierto, setAbierto]     = useState(false)
  const [archivo, setArchivo]     = useState<File | null>(null)
  const [cargando, setCargando]   = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [arrastrar, setArrastrar] = useState(false)
  const [progreso, setProgreso]   = useState<Progreso | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleArchivo(file: File | null) {
    if (!file) return
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["xlsx", "xls"].includes(ext ?? "")) {
      alert("Solo se aceptan archivos .xlsx o .xls")
      return
    }
    setArchivo(file)
    setResultado(null)
  }

  async function handleImportar() {
    if (!archivo) return
    setCargando(true)
    setResultado(null)
    setProgreso(null)
    const form = new FormData()
    form.append("file", archivo)
    try {
      const res = await fetch("/api/estudiantes/importar-respuestas", { method: "POST", body: form })

      // Errores de validación tempranos (no-streaming)
      if (!res.ok) {
        const data = await res.json()
        setResultado(data as Resultado)
        return
      }

      // Leer el stream SSE
      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const bloques = buffer.split("\n\n")
        buffer = bloques.pop() ?? ""

        for (const bloque of bloques) {
          const linea = bloque.trim()
          if (!linea.startsWith("data: ")) continue
          try {
            const evento = JSON.parse(linea.slice(6))
            if (evento.type === "start") {
              setProgreso({ procesados: 0, total: evento.total, insertados: 0, omitidos: 0, duplicados: 0 })
            } else if (evento.type === "progress") {
              setProgreso({ procesados: evento.procesados, total: evento.total, insertados: evento.insertados, omitidos: evento.omitidos, duplicados: evento.duplicados })
            } else if (evento.type === "done") {
              setResultado({ insertados: evento.insertados, omitidos: evento.omitidos, duplicados: evento.duplicados, errores: evento.errores, muestra: evento.muestra })
            }
          } catch { /* ignorar líneas mal formadas */ }
        }
      }
    } catch {
      setResultado({ insertados: 0, omitidos: 0, duplicados: 0, errores: [], muestra: [], error: "No se pudo conectar con el servidor." })
    } finally {
      setCargando(false)
      setProgreso(null)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setArrastrar(false)
    handleArchivo(e.dataTransfer.files[0] ?? null)
  }

  const exito = resultado && !resultado.error && resultado.insertados > 0

  return (
    <div style={{ marginBottom: 20 }}>

      {/* ── Botón para abrir/cerrar ── */}
      <button
        onClick={() => { setAbierto(v => !v); setResultado(null); setArchivo(null); setProgreso(null) }}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 18px", borderRadius: 8,
          border: "1.5px solid #ddd6fe",
          background: abierto ? "#f5f3ff" : "white",
          color: "#6d28d9", fontSize: 13, fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Importar con respuestas SENA
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
             style={{ transform: abierto ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* ── Panel expandible ── */}
      {abierto && (
        <div style={{
          marginTop: 8, padding: 20, borderRadius: 12,
          border: "1.5px solid #ede9fe", background: "white",
          boxShadow: "0 2px 8px rgba(109,40,217,0.07)",
        }}>

          {/* Encabezado */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>
              Importar estudiantes con respuestas SENA
            </p>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
              Sube el archivo XLS histórico (mismo formato que Histórico ML).
              Se crean estudiantes con tamizaje calculado automáticamente.
            </p>
          </div>

          {/* Zona de drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setArrastrar(true) }}
            onDragLeave={() => setArrastrar(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${arrastrar ? "#7c3aed" : archivo ? "#c4b5fd" : "#ddd6fe"}`,
              borderRadius: 10, padding: "24px 16px",
              background: arrastrar ? "#f5f3ff" : archivo ? "#faf5ff" : "#fafafa",
              cursor: "pointer", textAlign: "center",
              transition: "all 0.15s", marginBottom: 14,
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={(e) => handleArchivo(e.target.files?.[0] ?? null)}
            />
            {archivo ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>{archivo.name}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>({(archivo.size / 1024).toFixed(1)} KB)</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setArchivo(null); setResultado(null); setProgreso(null) }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                     style={{ display: "block", margin: "0 auto 8px" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p style={{ fontSize: 13, color: "#7c3aed", fontWeight: 600, margin: "0 0 3px" }}>
                  Arrastra tu archivo .xls / .xlsx aquí
                </p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                  o haz clic para seleccionar — mismo formato que Histórico ML
                </p>
              </>
            )}
          </div>

          {/* Botón importar */}
          <button
            onClick={handleImportar}
            disabled={!archivo || cargando}
            style={{
              width: "100%", padding: "10px 0",
              borderRadius: 8, border: "none",
              background: !archivo || cargando
                ? "#e2e8f0"
                : "linear-gradient(90deg, #7c3aed, #6d28d9)",
              color: !archivo || cargando ? "#94a3b8" : "white",
              fontSize: 13, fontWeight: 600,
              cursor: !archivo || cargando ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {cargando ? "Procesando…" : "Importar con respuestas"}
          </button>

          {/* ── Barra de progreso ── */}
          {progreso && (
            <div style={{ marginTop: 14 }}>
              {/* Encabezado */}
              {(() => {
                const terminado = progreso.total > 0 && progreso.procesados >= progreso.total
                return (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: terminado ? "#15803d" : "#6d28d9" }}>
                        {terminado ? "¡Procesamiento completado!" : "Procesando estudiantes…"}
                      </span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        {progreso.procesados} / {progreso.total}
                        <span style={{ marginLeft: 6, fontWeight: 700, color: terminado ? "#15803d" : "#7c3aed" }}>
                          ({Math.round((progreso.procesados / progreso.total) * 100)}%)
                        </span>
                      </span>
                    </div>

                    {/* Barra */}
                    <div style={{
                      height: terminado ? 20 : 10,
                      borderRadius: 99,
                      background: terminado ? "#dcfce7" : "#ede9fe",
                      overflow: "hidden",
                      transition: "height 0.2s ease-out, background 0.2s ease-out",
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${(progreso.procesados / progreso.total) * 100}%`,
                        background: terminado
                          ? "linear-gradient(90deg, #16a34a, #15803d)"
                          : "linear-gradient(90deg, #7c3aed, #6d28d9)",
                        borderRadius: 99,
                        transition: "width 0.15s ease-out, background 0.2s ease-out",
                      }} />
                    </div>
                  </>
                )
              })()}

              {/* Contadores en tiempo real */}
              <div style={{
                display: "flex", gap: 16, marginTop: 10,
                padding: "8px 12px", borderRadius: 8,
                background: "#f5f3ff", border: "1px solid #ede9fe",
              }}>
                {[
                  { label: "Importados",  valor: progreso.insertados, color: "#15803d" },
                  { label: "Duplicados",  valor: progreso.duplicados, color: "#92400e" },
                  { label: "Omitidos",    valor: progreso.omitidos,   color: "#991b1b" },
                ].map(({ label, valor, color }) => (
                  <div key={label} style={{ textAlign: "center", flex: 1 }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color, margin: 0 }}>{valor}</p>
                    <p style={{ fontSize: 10, color: "#64748b", margin: "1px 0 0" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Resultados ── */}
          {resultado && (
            <div style={{ marginTop: 16 }}>

              {/* Error general */}
              {resultado.error && (
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "#fef2f2", border: "1px solid #fecaca",
                  fontSize: 13, color: "#b91c1c", marginBottom: 12,
                }}>
                  {resultado.error}
                </div>
              )}

              {/* Resumen */}
              {!resultado.error && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
                  {[
                    { label: "Importados",  valor: resultado.insertados,  color: "#15803d", bg: "#f0fdf4", borde: "#bbf7d0" },
                    { label: "Duplicados",  valor: resultado.duplicados,  color: "#92400e", bg: "#fffbeb", borde: "#fde68a" },
                    { label: "Omitidos",    valor: resultado.omitidos,    color: "#991b1b", bg: "#fef2f2", borde: "#fecaca" },
                  ].map(({ label, valor, color, bg, borde }) => (
                    <div key={label} style={{
                      padding: "10px 14px", borderRadius: 10,
                      background: bg, border: `1px solid ${borde}`,
                      textAlign: "center",
                    }}>
                      <p style={{ fontSize: 24, fontWeight: 800, color, margin: 0 }}>{valor}</p>
                      <p style={{ fontSize: 11, color, margin: "2px 0 0" }}>{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Errores de procesamiento */}
              {(resultado.errores?.length ?? 0) > 0 && (
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "#fff7ed", border: "1px solid #fed7aa",
                  marginBottom: 14,
                }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#c2410c", margin: "0 0 6px" }}>
                    Errores de procesamiento ({resultado.errores!.length}):
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {resultado.errores!.map((e, i) => (
                      <li key={i} style={{ fontSize: 11, color: "#92400e", marginBottom: 2 }}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tabla muestra */}
              {(resultado.muestra?.length ?? 0) > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#475569", margin: "0 0 8px" }}>
                    Últimos {resultado.muestra.length} estudiantes importados:
                  </p>
                  <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          {["Nombre", "Semáforo", "Edad", "Sexo"].map(h => (
                            <th key={h} style={{
                              padding: "8px 10px", textAlign: "left",
                              fontWeight: 600, color: "#64748b", fontSize: 11,
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.muestra.map((row, i) => {
                          const sem = SEMAFORO_STYLE[row.semaforo]
                          return (
                            <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "7px 10px", color: "#0f172a", fontWeight: 500 }}>{row.nombre}</td>
                              <td style={{ padding: "7px 10px" }}>
                                {sem ? (
                                  <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 5,
                                    background: sem.bg, color: sem.color,
                                    border: `1px solid ${sem.borde}`,
                                    borderRadius: 20, padding: "2px 8px",
                                    fontSize: 11, fontWeight: 700,
                                  }}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: sem.dot }} />
                                    {sem.label}
                                  </span>
                                ) : (
                                  <span style={{ color: "#94a3b8" }}>{row.semaforo}</span>
                                )}
                              </td>
                              <td style={{ padding: "7px 10px", color: "#475569" }}>{row.edad}</td>
                              <td style={{ padding: "7px 10px", color: "#475569" }}>{SEXO_LABEL[row.sexo] ?? row.sexo}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CTA si hubo importaciones */}
              {exito && (
                <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <Link href="/estudiantes" style={{
                    padding: "8px 16px", borderRadius: 8,
                    background: "linear-gradient(90deg, #7c3aed, #6d28d9)",
                    color: "white", fontSize: 12, fontWeight: 600,
                    textDecoration: "none",
                  }}>
                    Ver estudiantes →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
