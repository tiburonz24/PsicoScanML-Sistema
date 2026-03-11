"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────
type ImportResult = {
  insertados: number
  omitidos: number
  semaforos: { VERDE: number; AMARILLO: number; ROJO: number; ROJO_URGENTE: number }
  muestra: Array<{ id: string; fecha: string; edad: number; sexo: string; semaforo: string; gloT: number }>
  error?: string
}

type MetricClass = { precision: number; recall: number; "f1-score": number; support: number }
type TrainResult = {
  ok: boolean
  error?: string
  metrics?: {
    accuracy: number
    cv_mean: number
    cv_std: number
    report: Record<string, MetricClass | number>
  }
  importance?: Array<{ feature: string; importance: number }>
}

type HistorialItem = {
  id: string
  fecha: string
  nRegistros: number
  trainSize: number
  accuracy: number
  cvMean: number
  cvStd: number
  nEstimators: number
  report: Record<string, MetricClass | number>
  importance: Array<{ feature: string; importance: number }>
}

// ──────────────────────────────────────────────
// Semáforo config
// ──────────────────────────────────────────────
const SEM: Record<string, { bg: string; text: string; border: string; label: string; dot: string }> = {
  VERDE:        { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", label: "Verde",        dot: "#22c55e" },
  AMARILLO:     { bg: "#fefce8", text: "#854d0e", border: "#fde68a", label: "Amarillo",     dot: "#eab308" },
  ROJO:         { bg: "#fff1f2", text: "#9f1239", border: "#fecdd3", label: "Rojo",          dot: "#f43f5e" },
  ROJO_URGENTE: { bg: "#fdf2f8", text: "#86198f", border: "#f5d0fe", label: "Rojo urgente", dot: "#d946ef" },
}

function SemBadge({ sem }: { sem: string }) {
  const s = SEM[sem] ?? { bg: "#f1f5f9", text: "#334155", border: "#e2e8f0", label: sem, dot: "#94a3b8" }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 999, fontSize: 11, fontWeight: 600, padding: "2px 10px",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  )
}

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────
export default function HistoricoContent() {
  const [importando, setImportando]     = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError]   = useState<string | null>(null)
  const [dragging, setDragging]         = useState(false)
  const [fileName, setFileName]         = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [entrenando, setEntrenando]   = useState(false)
  const [trainResult, setTrainResult] = useState<TrainResult | null>(null)
  const [trainError, setTrainError]   = useState<string | null>(null)

  const [historial, setHistorial]           = useState<HistorialItem[]>([])
  const [historialCargado, setHistorialCargado] = useState(false)
  const [expandido, setExpandido]           = useState<string | null>(null)

  async function cargarHistorial() {
    try {
      const res  = await fetch("/api/ml/historial")
      const data = await res.json()
      if (Array.isArray(data)) setHistorial(data)
    } catch { /* silencioso */ }
    finally { setHistorialCargado(true) }
  }

  useEffect(() => { cargarHistorial() }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && fileRef.current) {
      const dt = new DataTransfer(); dt.items.add(file)
      fileRef.current.files = dt.files
      setFileName(file.name)
    }
  }, [])

  async function handleImportar() {
    const file = fileRef.current?.files?.[0]
    if (!file) { setImportError("Selecciona un archivo primero."); return }
    setImportando(true); setImportResult(null); setImportError(null)
    const form = new FormData()
    form.append("file", file)
    try {
      const res  = await fetch("/api/historico/importar", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok || data.error) setImportError(data.error ?? "Error al importar.")
      else setImportResult(data as ImportResult)
    } catch { setImportError("No se pudo conectar con el servidor.") }
    finally  { setImportando(false) }
  }

  async function handleEntrenar() {
    setEntrenando(true); setTrainResult(null); setTrainError(null)
    try {
      const res  = await fetch("/api/ml/entrenar", { method: "POST" })
      const data = await res.json()
      if (!res.ok || data.error) setTrainError(data.error ?? "Error al entrenar.")
      else { setTrainResult(data as TrainResult); await cargarHistorial() }
    } catch { setTrainError("No se pudo conectar con el servidor.") }
    finally  { setEntrenando(false) }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: 16,
        background: "linear-gradient(135deg, #0D475A 0%, #1A7A8A 60%, #2ABFBF 100%)",
        padding: "28px 32px",
        display: "flex", alignItems: "center", gap: 20,
        position: "relative", overflow: "hidden",
      }}>
        {/* círculo decorativo */}
        <div style={{
          position: "absolute", right: -40, top: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }} />
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconBrain size={28} color="#fff" />
        </div>
        <div>
          <h1 style={{ color: "#fff", fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 700, margin: 0 }}>
            Histórico &amp; Entrenamiento ML
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 }}>
            Importa registros SENA históricos y entrena el clasificador de riesgo psicológico.
          </p>
        </div>
        {historialCargado && historial.length > 0 && (
          <div style={{
            marginLeft: "auto", flexShrink: 0,
            background: "rgba(255,255,255,0.15)", borderRadius: 10,
            padding: "8px 16px", textAlign: "center",
          }}>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: "var(--font-syne)", lineHeight: 1 }}>
              {historial[0].nRegistros.toLocaleString()}
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 3 }}>registros en BD</div>
          </div>
        )}
      </div>

      {/* ── Paso 1: Importar ── */}
      <StepCard step={1} title="Subir archivo histórico" icon={<IconUpload />}>
        <p style={{ fontSize: 13, color: "#4A5568", marginBottom: 16 }}>
          Sube el archivo{" "}
          <code style={{
            fontSize: 12, fontFamily: "monospace", padding: "1px 7px",
            background: "#f1f5f9", color: "#0D475A", border: "1px solid #cbd5e1", borderRadius: 5,
          }}>.xls</code>{" "}
          exportado del sistema SENA. El archivo debe contener columnas{" "}
          <span style={{ color: "#0D475A", fontWeight: 600 }}>id, edad, sexo, fecha, pd_*/pt_*</span> y{" "}
          <span style={{ color: "#0D475A", fontWeight: 600 }}>Respuestas</span>.
        </p>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "#2ABFBF" : "#cbd5e1"}`,
            borderRadius: 12,
            padding: "28px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "#f0fdfc" : "#f8fafc",
            transition: "all .18s",
            marginBottom: 14,
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xls,.xlsx,.html,.htm"
            style={{ display: "none" }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <div style={{ marginBottom: 8 }}>
            <IconFile color={dragging ? "#2ABFBF" : "#94a3b8"} />
          </div>
          {fileName ? (
            <p style={{ fontSize: 13, fontWeight: 600, color: "#0D475A" }}>{fileName}</p>
          ) : (
            <p style={{ fontSize: 13, color: "#64748b" }}>
              Arrastra aquí el archivo o{" "}
              <span style={{ color: "#1A7A8A", fontWeight: 600 }}>haz clic para seleccionar</span>
            </p>
          )}
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>.xls · .xlsx · .html</p>
        </div>

        <button
          onClick={handleImportar}
          disabled={importando}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "9px 22px", borderRadius: 10,
            background: importando ? "#94a3b8" : "linear-gradient(90deg, #0D475A, #1A7A8A)",
            color: "#fff", fontWeight: 600, fontSize: 13,
            border: "none", cursor: importando ? "not-allowed" : "pointer",
            transition: "opacity .15s",
          }}
        >
          {importando ? <Spinner /> : <IconUpload size={15} />}
          {importando ? "Importando…" : "Importar registros"}
        </button>

        {importError && <AlertBox type="error" message={importError} />}

        {importResult && (
          <div style={{ marginTop: 20 }}>
            {/* Resumen de semáforos */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
              <StatCard label="Importados" value={importResult.insertados} color="#16a34a" bg="#f0fdf4" border="#bbf7d0" icon="✓" />
              <StatCard label="Omitidos"   value={importResult.omitidos}   color="#dc2626" bg="#fff1f2" border="#fecdd3" icon="–" />
              {Object.entries(importResult.semaforos).map(([k, v]) => {
                const s = SEM[k] ?? { bg: "#f1f5f9", text: "#334155", border: "#e2e8f0", label: k, dot: "#94a3b8" }
                return (
                  <StatCard key={k} label={s.label} value={v} color={s.text} bg={s.bg} border={s.border} />
                )
              })}
            </div>

            {/* Tabla muestra */}
            {importResult.muestra.length > 0 && (
              <>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                  Muestra de los primeros registros importados:
                </p>
                <DataTable
                  headers={["Fecha", "Edad", "Sexo", "Semáforo", "T Global"]}
                  rows={importResult.muestra.map((r) => [
                    new Date(r.fecha).toLocaleDateString("es-MX"),
                    r.edad,
                    r.sexo,
                    <SemBadge key={r.id} sem={r.semaforo} />,
                    <span key={r.id} style={{ fontWeight: 700, color: "#0D475A" }}>{r.gloT}</span>,
                  ])}
                />
              </>
            )}
          </div>
        )}
      </StepCard>

      {/* ── Paso 2: Entrenar ── */}
      <StepCard step={2} title="Entrenar modelo ML" icon={<IconBrain size={16} />}>
        <p style={{ fontSize: 13, color: "#4A5568", marginBottom: 16 }}>
          Entrena un <strong style={{ color: "#0D475A" }}>Random Forest</strong> con los registros
          importados usando 23 features calculados desde las respuestas brutas.
          El proceso tarda ~60 segundos y requiere al menos 50 registros.
        </p>

        <button
          onClick={handleEntrenar}
          disabled={entrenando}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 24px", borderRadius: 10,
            background: entrenando ? "#94a3b8" : "linear-gradient(90deg, #0D475A, #1A7A8A)",
            color: "#fff", fontWeight: 600, fontSize: 13,
            border: "none", cursor: entrenando ? "not-allowed" : "pointer",
          }}
        >
          {entrenando ? <Spinner /> : <IconBrain size={15} color="#fff" />}
          {entrenando ? "Entrenando modelo… (~60 s)" : "Iniciar entrenamiento"}
        </button>

        {trainError && <AlertBox type="error" message={trainError} />}

        {trainResult?.metrics && (
          <div style={{ marginTop: 24 }}>
            {/* Métricas principales */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              <MetricCard label="Test Accuracy" value={`${(trainResult.metrics.accuracy * 100).toFixed(2)}%`} sub="conjunto de prueba" color="#0D475A" />
              <MetricCard label="CV Mean"       value={`${(trainResult.metrics.cv_mean * 100).toFixed(2)}%`}  sub="validación cruzada" color="#1A7A8A" />
              <MetricCard label="CV ± Desv."    value={`±${(trainResult.metrics.cv_std * 100).toFixed(2)}%`}  sub="estabilidad" color="#2ABFBF" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* F1 por clase */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#0D475A", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  F1-score por clase
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Object.entries(trainResult.metrics.report)
                    .filter(([k]) => !["accuracy", "macro avg", "weighted avg"].includes(k))
                    .map(([clase, vals]) => {
                      const f1 = (vals as MetricClass)["f1-score"] ?? 0
                      const s  = SEM[clase]
                      return (
                        <div key={clase}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>{s?.label ?? clase}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: s?.text ?? "#0D475A" }}>
                              {(f1 * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div style={{ height: 7, borderRadius: 99, background: "#e2e8f0" }}>
                            <div style={{
                              height: 7, borderRadius: 99,
                              width: `${f1 * 100}%`,
                              background: s?.dot ?? "#2ABFBF",
                              transition: "width .5s ease",
                            }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Feature importance */}
              {trainResult.importance && trainResult.importance.length > 0 && (
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#0D475A", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Top 10 escalas relevantes
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {trainResult.importance.slice(0, 10).map((f, i) => {
                      const pct = (f.importance / trainResult.importance![0].importance) * 100
                      const barColor = i === 0 ? "#0D475A" : i < 3 ? "#1A7A8A" : "#2ABFBF"
                      return (
                        <div key={f.feature}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#334155" }}>{f.feature}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#0D475A" }}>
                              {(f.importance * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div style={{ height: 7, borderRadius: 99, background: "#e2e8f0" }}>
                            <div style={{
                              height: 7, borderRadius: 99,
                              width: `${pct}%`,
                              background: barColor,
                              transition: "width .5s ease",
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </StepCard>

      {/* ── Paso 3: Historial ── */}
      <StepCard step={3} title="Historial de entrenamientos" icon={<IconHistory />}>
        {!historialCargado && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: 13 }}>
            <Spinner color="#1A7A8A" /> Cargando historial…
          </div>
        )}
        {historialCargado && historial.length === 0 && (
          <div style={{
            textAlign: "center", padding: "32px 0", color: "#94a3b8",
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
            <p style={{ fontSize: 13 }}>Aún no hay entrenamientos registrados.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Entrena el modelo para ver el historial aquí.</p>
          </div>
        )}
        {historial.length > 0 && (
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "linear-gradient(90deg, #0D475A, #1A7A8A)" }}>
                  {["Fecha", "Registros", "Split", "Test Accuracy", "CV Mean ± Std", ""].map((h) => (
                    <th key={h} style={{
                      padding: "11px 14px", textAlign: "left",
                      fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((item, i) => {
                  const isOpen = expandido === item.id
                  const clases = Object.entries(item.report).filter(
                    ([k]) => !["accuracy", "macro avg", "weighted avg"].includes(k)
                  )
                  return (
                    <React.Fragment key={item.id}>
                      <tr style={{
                        background: i % 2 === 0 ? "#fff" : "#f8fafc",
                        borderBottom: isOpen ? "none" : "1px solid #f1f5f9",
                      }}>
                        <td style={{ padding: "11px 14px", color: "#334155" }}>
                          {new Date(item.fecha).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td style={{ padding: "11px 14px", fontWeight: 700, color: "#0D475A" }}>
                          {item.nRegistros.toLocaleString()}
                        </td>
                        <td style={{ padding: "11px 14px", color: "#64748b" }}>
                          {Math.round(item.trainSize * 100)}/{Math.round((1 - item.trainSize) * 100)}
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{
                            fontWeight: 700, color: "#fff", fontSize: 12,
                            background: item.accuracy >= 0.95 ? "#16a34a" : item.accuracy >= 0.85 ? "#1A7A8A" : "#dc2626",
                            borderRadius: 6, padding: "2px 9px",
                          }}>
                            {(item.accuracy * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px", color: "#334155" }}>
                          {(item.cvMean * 100).toFixed(1)}%
                          <span style={{ color: "#94a3b8", fontSize: 12 }}> ±{(item.cvStd * 100).toFixed(1)}%</span>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <button
                            onClick={() => setExpandido(isOpen ? null : item.id)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                              border: `1px solid ${isOpen ? "#2ABFBF" : "#e2e8f0"}`,
                              background: isOpen ? "#f0fdfc" : "#f8fafc",
                              color: isOpen ? "#0D475A" : "#475569",
                              cursor: "pointer",
                            }}
                          >
                            F1
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                                 style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td colSpan={6} style={{ padding: "0 14px 14px 14px" }}>
                            <div style={{
                              background: "#f0fdfc", border: "1px solid #99f6e4",
                              borderRadius: 10, padding: "14px 16px",
                            }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: "#0D475A", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                F1-score por clase
                              </p>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {clases.map(([clase, vals]) => {
                                  const f1 = (vals as MetricClass)["f1-score"] ?? 0
                                  const s  = SEM[clase]
                                  return (
                                    <div key={clase}>
                                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                        <span style={{ fontSize: 12, color: "#334155" }}>{s?.label ?? clase}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: s?.text ?? "#0D475A" }}>
                                          {(f1 * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                      <div style={{ height: 6, borderRadius: 99, background: "#e2e8f0" }}>
                                        <div style={{
                                          height: 6, borderRadius: 99,
                                          width: `${f1 * 100}%`,
                                          background: s?.dot ?? "#2ABFBF",
                                        }} />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </StepCard>
    </div>
  )
}

// ──────────────────────────────────────────────
// Componentes de UI
// ──────────────────────────────────────────────
function StepCard({ step, title, icon, children }: {
  step: number; title: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <section style={{
      background: "#fff", borderRadius: 16,
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 22px",
        borderBottom: "1px solid #f1f5f9",
        background: "#fafcff",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: "linear-gradient(135deg, #0D475A, #1A7A8A)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 13, fontWeight: 700,
        }}>
          {step}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#1A7A8A" }}>{icon}</span>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0D475A", margin: 0 }}>{title}</h2>
        </div>
      </div>
      <div style={{ padding: "22px 22px" }}>{children}</div>
    </section>
  )
}

function StatCard({ label, value, color, bg, border, icon }: {
  label: string; value: number; color: string; bg: string; border: string; icon?: string
}) {
  return (
    <div style={{
      borderRadius: 10, padding: "12px 16px",
      background: bg, border: `1px solid ${border}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
        {icon && <span style={{ marginRight: 4 }}>{icon}</span>}{label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "var(--font-syne)", lineHeight: 1.1 }}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{
      borderRadius: 12, padding: "16px 18px",
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "var(--font-syne)", lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{sub}</div>
    </div>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
            {headers.map((h) => (
              <th key={h} style={{
                padding: "9px 14px", textAlign: "left",
                fontSize: 11, fontWeight: 600, color: "#64748b",
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              background: i % 2 === 0 ? "#fff" : "#f8fafc",
              borderBottom: "1px solid #f1f5f9",
            }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "9px 14px", color: "#334155" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AlertBox({ type, message }: { type: "error" | "success"; message: string }) {
  const isError = type === "error"
  return (
    <div style={{
      marginTop: 12,
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 16px", borderRadius: 10,
      background: isError ? "#fff1f2" : "#f0fdf4",
      border: `1px solid ${isError ? "#fecdd3" : "#bbf7d0"}`,
    }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>{isError ? "⚠" : "✓"}</span>
      <span style={{ fontSize: 13, color: isError ? "#9f1239" : "#166534", fontWeight: 500 }}>{message}</span>
    </div>
  )
}

function Spinner({ color = "#fff" }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ── Iconos ──
function IconBrain({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 2C8.5 2 6 4.5 6 7c0 1.5.6 2.8 1.6 3.7C6.6 11.5 6 12.8 6 14.2 6 17 8 19 10.5 19.5V22h3v-2.5C16 19 18 17 18 14.2c0-1.4-.6-2.7-1.6-3.5C17.4 9.8 18 8.5 18 7c0-2.5-2.5-5-6-5z" />
    </svg>
  )
}

function IconUpload({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12" />
    </svg>
  )
}

function IconFile({ color = "#94a3b8" }: { color?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} style={{ margin: "0 auto" }}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12h6M9 16h4M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2v7h7" />
    </svg>
  )
}

function IconHistory() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3M3 12a9 9 0 109 9H3v-4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12V7.5" />
    </svg>
  )
}
