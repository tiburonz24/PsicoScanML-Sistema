"use client"

import React, { useState, useRef, useEffect } from "react"

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
// Badge de semáforo
// ──────────────────────────────────────────────
const SEM: Record<string, { bg: string; text: string; label: string }> = {
  VERDE:        { bg: "#dcfce7", text: "#166534", label: "Verde" },
  AMARILLO:     { bg: "#fef9c3", text: "#854d0e", label: "Amarillo" },
  ROJO:         { bg: "#fee2e2", text: "#991b1b", label: "Rojo" },
  ROJO_URGENTE: { bg: "#fce7f3", text: "#9d174d", label: "Rojo urgente" },
}

function Badge({ sem }: { sem: string }) {
  const s = SEM[sem] ?? { bg: "#f1f5f9", text: "#334155", label: sem }
  return (
    <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: s.bg, color: s.text }}>
      {s.label}
    </span>
  )
}

// ──────────────────────────────────────────────
// Página
// ──────────────────────────────────────────────
export default function HistoricoPage() {
  const [importando, setImportando]     = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError]   = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [entrenando, setEntrenando]   = useState(false)
  const [trainResult, setTrainResult] = useState<TrainResult | null>(null)
  const [trainError, setTrainError]   = useState<string | null>(null)

  const [historial, setHistorial]         = useState<HistorialItem[]>([])
  const [historialCargado, setHistorialCargado] = useState(false)
  const [expandido, setExpandido]         = useState<string | null>(null)

  async function cargarHistorial() {
    try {
      const res  = await fetch("/api/ml/historial")
      const data = await res.json()
      if (Array.isArray(data)) setHistorial(data)
    } catch { /* silencioso */ }
    finally { setHistorialCargado(true) }
  }

  useEffect(() => { cargarHistorial() }, [])

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
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Encabezado */}
      <div className="border-b pb-4" style={{ borderColor: "#e2e8f0" }}>
        <h1 className="text-xl font-bold" style={{ color: "#0f172a" }}>Histórico ML</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Importa registros SENA históricos y entrena el modelo de clasificación automática.
        </p>
      </div>

      {/* ── Sección 1: Importar ── */}
      <Card title="1. Subir archivo histórico">
        <p className="text-sm mb-4" style={{ color: "#475569" }}>
          Formato esperado:{" "}
          <code className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "#f1f5f9", color: "#0369a1", border: "1px solid #cbd5e1" }}>
            .xls
          </code>{" "}
          exportado del SENA con columnas id, edad, sexo, fecha, pd_*/pt_* y Respuestas.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".xls,.xlsx,.html,.htm"
            className="flex-1 text-sm rounded-lg px-3 py-2 cursor-pointer"
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              color: "#334155",
            }}
          />
          <button
            onClick={handleImportar}
            disabled={importando}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#0ea5e9", color: "#fff" }}
          >
            {importando ? "Importando…" : "Importar"}
          </button>
        </div>

        {importError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg px-4 py-3"
               style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
            <span className="text-sm font-medium" style={{ color: "#b91c1c" }}>{importError}</span>
          </div>
        )}

        {importResult && (
          <div className="mt-4 space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Stat label="Importados" value={importResult.insertados} accent="#16a34a" />
              <Stat label="Omitidos"   value={importResult.omitidos}   accent="#dc2626" />
              {Object.entries(importResult.semaforos).map(([k, v]) => {
                const s = SEM[k] ?? { bg: "#f1f5f9", text: "#334155", label: k }
                return (
                  <div key={k} className="rounded-xl p-4 flex flex-col gap-2"
                       style={{ backgroundColor: s.bg, border: `1px solid ${s.text}22` }}>
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: s.text }}>
                      {s.label}
                    </span>
                    <span className="text-2xl font-bold" style={{ color: s.text }}>{v}</span>
                  </div>
                )
              })}
            </div>

            {/* Tabla */}
            {importResult.muestra.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      {["Fecha", "Edad", "Sexo", "Semáforo", "T Global"].map((h) => (
                        <th key={h} className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wide"
                            style={{ color: "#64748b" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.muestra.map((r, i) => (
                      <tr key={r.id} style={{
                        backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                        borderBottom: "1px solid #f1f5f9",
                      }}>
                        <td className="px-4 py-2.5" style={{ color: "#334155" }}>
                          {new Date(r.fecha).toLocaleDateString("es-MX")}
                        </td>
                        <td className="px-4 py-2.5" style={{ color: "#334155" }}>{r.edad}</td>
                        <td className="px-4 py-2.5" style={{ color: "#334155" }}>{r.sexo}</td>
                        <td className="px-4 py-2.5"><Badge sem={r.semaforo} /></td>
                        <td className="px-4 py-2.5 font-medium" style={{ color: "#0369a1" }}>{r.gloT}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── Sección 2: Entrenar ── */}
      <Card title="2. Entrenar modelo ML">
        <p className="text-sm mb-4" style={{ color: "#475569" }}>
          Entrena un Random Forest con los registros importados (23 features calculados desde
          las respuestas brutas). Requiere al menos 50 registros.
        </p>

        <button
          onClick={handleEntrenar}
          disabled={entrenando}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#0f172a", color: "#f8fafc" }}
        >
          <IconBrain />
          {entrenando ? "Entrenando… (~60 s)" : "Entrenar ahora"}
        </button>

        {trainError && (
          <div className="mt-3 rounded-lg px-4 py-3"
               style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
            <span className="text-sm font-medium" style={{ color: "#b91c1c" }}>{trainError}</span>
          </div>
        )}

        {trainResult?.metrics && (
          <div className="mt-5 space-y-5">
            {/* Métricas principales */}
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Test Accuracy" value={`${(trainResult.metrics.accuracy * 100).toFixed(1)}%`} accent="#16a34a" />
              <Stat label="CV Mean"       value={`${(trainResult.metrics.cv_mean * 100).toFixed(1)}%`}  accent="#0369a1" />
              <Stat label="CV ± Std"      value={`±${(trainResult.metrics.cv_std * 100).toFixed(1)}%`}  accent="#7c3aed" />
            </div>

            {/* F1 por clase */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "#0f172a" }}>F1-score por clase</h3>
              <div className="space-y-2.5">
                {Object.entries(trainResult.metrics.report)
                  .filter(([k]) => !["accuracy", "macro avg", "weighted avg"].includes(k))
                  .map(([clase, vals]) => {
                    const f1 = (vals as MetricClass)["f1-score"] ?? 0
                    const s  = SEM[clase]
                    return (
                      <div key={clase} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-28 shrink-0" style={{ color: "#334155" }}>
                          {s?.label ?? clase}
                        </span>
                        <div className="flex-1 rounded-full h-2.5" style={{ backgroundColor: "#e2e8f0" }}>
                          <div className="h-2.5 rounded-full transition-all"
                               style={{ width: `${f1 * 100}%`, backgroundColor: s?.text ?? "#0ea5e9" }} />
                        </div>
                        <span className="text-xs font-semibold w-10 text-right" style={{ color: "#0f172a" }}>
                          {(f1 * 100).toFixed(0)}%
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Feature importance */}
            {trainResult.importance && trainResult.importance.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#0f172a" }}>
                  Top 10 escalas más relevantes
                </h3>
                <div className="space-y-2.5">
                  {trainResult.importance.slice(0, 10).map((f, i) => (
                    <div key={f.feature} className="flex items-center gap-3">
                      <span className="text-xs font-mono font-medium w-24 shrink-0" style={{ color: "#334155" }}>
                        {f.feature}
                      </span>
                      <div className="flex-1 rounded-full h-2.5" style={{ backgroundColor: "#e2e8f0" }}>
                        <div className="h-2.5 rounded-full transition-all"
                             style={{
                               width: `${(f.importance / trainResult.importance![0].importance) * 100}%`,
                               backgroundColor: i < 3 ? "#0ea5e9" : "#38bdf8",
                             }} />
                      </div>
                      <span className="text-xs font-semibold w-10 text-right" style={{ color: "#0f172a" }}>
                        {(f.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── Sección 3: Historial de entrenamientos ── */}
      <Card title="3. Historial de entrenamientos">
        {!historialCargado && (
          <p className="text-sm" style={{ color: "#64748b" }}>Cargando historial…</p>
        )}
        {historialCargado && historial.length === 0 && (
          <p className="text-sm" style={{ color: "#64748b" }}>
            Aún no hay entrenamientos registrados. Entrena el modelo para ver el historial.
          </p>
        )}
        {historial.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
            <table className="w-full text-sm text-left">
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Fecha", "Registros", "Split", "Accuracy", "CV Mean ± Std", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wide"
                        style={{ color: "#64748b" }}>{h}</th>
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
                        backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                        borderBottom: "1px solid #f1f5f9",
                      }}>
                        <td className="px-4 py-2.5" style={{ color: "#334155" }}>
                          {new Date(item.fecha).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="px-4 py-2.5 font-medium" style={{ color: "#0369a1" }}>
                          {item.nRegistros.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5" style={{ color: "#334155" }}>
                          {Math.round(item.trainSize * 100)}/{Math.round((1 - item.trainSize) * 100)}
                        </td>
                        <td className="px-4 py-2.5 font-semibold" style={{ color: "#16a34a" }}>
                          {(item.accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-2.5" style={{ color: "#334155" }}>
                          {(item.cvMean * 100).toFixed(1)}%
                          <span style={{ color: "#94a3b8" }}> ±{(item.cvStd * 100).toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => setExpandido(isOpen ? null : item.id)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
                            style={{
                              backgroundColor: isOpen ? "#e0e7ff" : "#f1f5f9",
                              color: isOpen ? "#4338ca" : "#475569",
                            }}
                          >
                            {isOpen ? "Ocultar" : "F1 ▾"}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr style={{ backgroundColor: "#f8fafc" }}>
                          <td colSpan={6} className="px-6 py-4">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold mb-2" style={{ color: "#0f172a" }}>F1-score por clase</p>
                              {clases.map(([clase, vals]) => {
                                const f1 = (vals as MetricClass)["f1-score"] ?? 0
                                const s  = SEM[clase]
                                return (
                                  <div key={clase} className="flex items-center gap-3">
                                    <span className="text-xs font-medium w-28 shrink-0" style={{ color: "#334155" }}>
                                      {s?.label ?? clase}
                                    </span>
                                    <div className="flex-1 rounded-full h-2" style={{ backgroundColor: "#e2e8f0" }}>
                                      <div className="h-2 rounded-full"
                                           style={{ width: `${f1 * 100}%`, backgroundColor: s?.text ?? "#0ea5e9" }} />
                                    </div>
                                    <span className="text-xs font-semibold w-10 text-right" style={{ color: "#0f172a" }}>
                                      {(f1 * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                )
                              })}
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
      </Card>
    </div>
  )
}

// ──────────────────────────────────────────────
// Componentes base
// ──────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-6"
             style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <h2 className="text-base font-bold mb-4 pb-3"
          style={{ color: "#0f172a", borderBottom: "1px solid #f1f5f9" }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1"
         style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#64748b" }}>{label}</span>
      <span className="text-2xl font-bold" style={{ color: accent }}>{value}</span>
    </div>
  )
}

function IconBrain() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.122V21m-5.25-6.375a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
    </svg>
  )
}
