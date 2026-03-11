"use client"

type Props = { count: number }

export default function ExportarParaSena({ count }: Props) {
  return (
    <div style={{ marginBottom: 20 }}>
      <a
        href="/api/export/sena-xml"
        download
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "9px 18px", borderRadius: 8,
          border: "1.5px solid #99f6e4",
          background: "white",
          color: "#0f766e", fontSize: 13, fontWeight: 600,
          textDecoration: "none",
          cursor: count === 0 ? "not-allowed" : "pointer",
          opacity: count === 0 ? 0.5 : 1,
          pointerEvents: count === 0 ? "none" : "auto",
        }}
        aria-disabled={count === 0}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Exportar para SENA
        {count > 0 && (
          <span style={{
            background: "rgba(42,191,191,0.12)", color: "#0f766e",
            borderRadius: 99, padding: "1px 7px",
            fontSize: 11, fontWeight: 700,
          }}>
            {count}
          </span>
        )}
      </a>
      {count === 0 && (
        <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0 2px" }}>
          Sin respuestas pendientes de exportar
        </p>
      )}
    </div>
  )
}
