"use client"

import { useState } from "react"
import ModalNuevaCita from "./ModalNuevaCita"

type EstudianteOpcion = { id: string; nombre: string }

type Props = {
  estudianteId:    string
  nombreEstudiante: string
  estudiantes:     EstudianteOpcion[]
}

export default function AgendarCitaBtn({ estudianteId, nombreEstudiante, estudiantes }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "white", color: "#1A7A8A",
          border: "1.5px solid #99f6e4",
          borderRadius: 8, padding: "7px 14px",
          fontSize: 12, fontWeight: 600,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="12" y1="14" x2="12" y2="18"/>
          <line x1="10" y1="16" x2="14" y2="16"/>
        </svg>
        Agendar cita
      </button>

      {open && (
        <ModalNuevaCita
          estudiantes={estudiantes}
          estudianteId={estudianteId}
          nombreEstudiante={nombreEstudiante}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
