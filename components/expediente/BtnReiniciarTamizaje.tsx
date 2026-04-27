"use client"

import { useState } from "react"
import { resetearTamizaje } from "@/lib/actions/tamizaje"

export default function BtnReiniciarTamizaje({ estudianteId }: { estudianteId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleClick() {
    if (!confirm(
      "¿Reiniciar el cuestionario?\n\n" +
      "Se borrarán el tamizaje y todas las respuestas del alumno. " +
      "El alumno podrá contestarlo nuevamente desde el portal.\n\n" +
      "Esta acción no se puede deshacer."
    )) return

    setLoading(true)
    setError(null)
    const result = await resetearTamizaje(estudianteId)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // Si tuvo éxito, revalidatePath recarga la página automáticamente
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        title="Permite que el alumno vuelva a contestar el cuestionario"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 9,
          border: "none", background: loading ? "#fca5a5" : "#dc2626",
          color: "white", fontSize: 13, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          boxShadow: loading ? "none" : "0 3px 10px rgba(220,38,38,0.35)",
          transition: "opacity 0.15s, box-shadow 0.15s",
        }}
      >
        <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 4v6h6M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
        </svg>
        {loading ? "Reiniciando…" : "Reiniciar cuestionario"}
      </button>
      {error && (
        <p style={{ fontSize: 12, color: "#dc2626", margin: "5px 0 0" }}>{error}</p>
      )}
    </div>
  )
}
