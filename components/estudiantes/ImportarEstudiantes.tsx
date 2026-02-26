"use client"

import { useRef, useState } from "react"
import Link from "next/link"

type Resultado = {
  insertados:  number
  omitidos:    number
  duplicados:  number
  errores:     string[]
  muestra:     Array<{ id: string; nombre: string; curp: string; edad: number; sexo: string; grado: string; grupo: string }>
  error?:      string
}

const SEXO_LABEL: Record<string, string> = { MASCULINO: "M", FEMENINO: "F", OTRO: "O" }

export default function ImportarEstudiantes() {
  const [abierto, setAbierto]       = useState(false)
  const [archivo, setArchivo]       = useState<File | null>(null)
  const [cargando, setCargando]     = useState(false)
  const [resultado, setResultado]   = useState<Resultado | null>(null)
  const [arrastrar, setArrastrar]   = useState(false)
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
    const form = new FormData()
    form.append("file", archivo)
    try {
      const res  = await fetch("/api/estudiantes/importar", { method: "POST", body: form })
      const data = await res.json()
      setResultado(data as Resultado)
    } catch {
      setResultado({ insertados: 0, omitidos: 0, duplicados: 0, errores: [], muestra: [], error: "No se pudo conectar con el servidor." })
    } finally {
      setCargando(false)
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
        onClick={() => { setAbierto(v => !v); setResultado(null); setArchivo(null) }}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 18px", borderRadius: 8,
          border: "1.5px solid #c7d2fe",
          background: abierto ? "#eef2ff" : "white",
          color: "#4338ca", fontSize: 13, fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Carga masiva de estudiantes
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
          border: "1.5px solid #e0e7ff", background: "white",
          boxShadow: "0 2px 8px rgba(79,70,229,0.07)",
        }}>

          {/* Encabezado */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>
                Importar estudiantes desde Excel
              </p>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                Sube un archivo .xlsx con los datos de tus estudiantes. Se omiten CURP duplicadas automáticamente.
              </p>
            </div>
            <a
              href="/api/estudiantes/plantilla"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 7,
                border: "1.5px solid #86efac", background: "#f0fdf4",
                color: "#15803d", fontSize: 11, fontWeight: 600,
                textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Descargar plantilla
            </a>
          </div>

          {/* Zona de drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setArrastrar(true) }}
            onDragLeave={() => setArrastrar(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${arrastrar ? "#6366f1" : archivo ? "#a5b4fc" : "#c7d2fe"}`,
              borderRadius: 10, padding: "24px 16px",
              background: arrastrar ? "#eef2ff" : archivo ? "#f5f3ff" : "#fafafa",
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
                     stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>{archivo.name}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>({(archivo.size / 1024).toFixed(1)} KB)</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setArchivo(null); setResultado(null) }}
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
                     stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                     style={{ display: "block", margin: "0 auto 8px" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p style={{ fontSize: 13, color: "#6366f1", fontWeight: 600, margin: "0 0 3px" }}>
                  Haz clic o arrastra tu archivo aquí
                </p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                  Formato: .xlsx — columnas: Nombre, CURP, Edad, Sexo, Grado, Grupo, Escuela
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
              background: !archivo || cargando ? "#e2e8f0" : "linear-gradient(90deg, #4f46e5, #4338ca)",
              color: !archivo || cargando ? "#94a3b8" : "white",
              fontSize: 13, fontWeight: 600, cursor: !archivo || cargando ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {cargando ? "Importando…" : "Importar estudiantes"}
          </button>

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
                    { label: "Con errores", valor: resultado.omitidos,    color: "#991b1b", bg: "#fef2f2", borde: "#fecaca" },
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

              {/* Errores de validación */}
              {(resultado.errores?.length ?? 0) > 0 && (
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "#fff7ed", border: "1px solid #fed7aa",
                  marginBottom: 14,
                }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#c2410c", margin: "0 0 6px" }}>
                    Filas omitidas ({resultado.errores!.length}):
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
                    Últimos {resultado.muestra.length} estudiantes registrados:
                  </p>
                  <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          {["Nombre", "CURP", "Edad", "Sexo", "Grado", "Grupo"].map(h => (
                            <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 11 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.muestra.map((e, i) => (
                          <tr key={e.id} style={{ background: i % 2 === 0 ? "white" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "7px 10px", color: "#0f172a", fontWeight: 500 }}>{e.nombre}</td>
                            <td style={{ padding: "7px 10px", color: "#475569", fontFamily: "monospace" }}>{e.curp}</td>
                            <td style={{ padding: "7px 10px", color: "#475569" }}>{e.edad}</td>
                            <td style={{ padding: "7px 10px", color: "#475569" }}>{SEXO_LABEL[e.sexo] ?? e.sexo}</td>
                            <td style={{ padding: "7px 10px", color: "#475569" }}>{e.grado}</td>
                            <td style={{ padding: "7px 10px", color: "#475569" }}>{e.grupo}</td>
                          </tr>
                        ))}
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
                    background: "linear-gradient(90deg, #4f46e5, #4338ca)",
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
