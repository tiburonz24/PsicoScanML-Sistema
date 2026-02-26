"use client"

import { useState, useEffect } from "react"
import { Rol } from "@/lib/enums"
import Sidebar from "./Sidebar"

type Props = {
  rol: Rol
  nombre?: string
}

export default function NavShell({ rol, nombre }: Props) {
  const [open, setOpen] = useState(false)

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      {/* Barra superior fija — todas las pantallas */}
      <header
        className="fixed top-0 left-0 right-0 z-30 h-12 flex items-center px-4 gap-3 shadow-lg"
        style={{ backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b" }}
      >
        {/* Botón hamburguesa */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "6px",
            padding: "4px 6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          {open ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        {/* Logo + nombre del sistema */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs tracking-tight" style={{ color: "#f8fafc" }}>PsicoScan ML</span>
          <span className="hidden sm:inline text-xs" style={{ color: "#475569" }}>· CECyTEN Tepic</span>
        </div>

        {/* Usuario en la derecha */}
        {nombre && (
          <div className="ml-auto flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: "#0ea5e9", color: "#fff" }}
            >
              {nombre.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs max-w-[140px] truncate" style={{ color: "#94a3b8" }}>
              {nombre}
            </span>
          </div>
        )}
      </header>

      {/* Overlay + Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Fondo oscuro */}
          <div
            className="absolute inset-0 transition-opacity"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            onClick={() => setOpen(false)}
          />
          {/* Drawer lateral */}
          <div className="relative h-full shadow-2xl">
            <Sidebar rol={rol} nombre={nombre} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
