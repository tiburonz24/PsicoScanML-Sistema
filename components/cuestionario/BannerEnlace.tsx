"use client"

import { useState } from "react"

type Props = { nombre: string; enlace: string }

export default function BannerEnlace({ nombre, enlace }: Props) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(enlace)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12,
      padding: "16px 20px", borderRadius: 12,
      background: "rgba(42,191,191,0.07)",
      border: "1px solid rgba(42,191,191,0.3)",
      borderLeft: "4px solid #2ABFBF",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
             stroke="#1A7A8A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
             style={{ flexShrink: 0 }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1A7A8A", margin: 0 }}>
          <span style={{ fontWeight: 800 }}>{nombre}</span> registrado correctamente
        </p>
      </div>
      <p style={{ fontSize: 12, color: "#4A5568", margin: 0 }}>
        Comparte este enlace para que el alumno conteste el cuestionario SENA:
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <code style={{
          flex: 1, padding: "8px 14px", borderRadius: 8,
          background: "white", border: "1px solid rgba(42,191,191,0.3)",
          fontSize: 12, color: "#0D475A", overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
          userSelect: "all" as React.CSSProperties["userSelect"],
        }}>
          {enlace}
        </code>
        <button
          onClick={copiar}
          style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8, border: "none",
            cursor: "pointer", fontSize: 12, fontWeight: 700,
            background: copiado ? "#0D475A" : "linear-gradient(90deg, #0D475A, #1A7A8A)",
            color: "white", transition: "background 0.2s",
          }}
        >
          {copiado ? (
            <>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              ¡Copiado!
            </>
          ) : (
            <>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x={9} y={9} width={13} height={13} rx={2} ry={2} />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copiar enlace
            </>
          )}
        </button>
      </div>
      <p style={{ fontSize: 11, color: "#1A7A8A", margin: 0 }}>
        El alumno puede abrir este enlace en cualquier dispositivo sin necesidad de cuenta.
      </p>
    </div>
  )
}
