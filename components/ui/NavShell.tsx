"use client"

import { useState } from "react"
import { Rol } from "@/lib/enums"
import Sidebar from "./Sidebar"

type Props = {
  rol: Rol
  nombre?: string
}

export default function NavShell({ rol, nombre }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Barra superior — solo en mobile */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 gap-3 shadow-md"
        style={{ backgroundColor: "#1e1b4b" }}
      >
        <button
          onClick={() => setOpen(true)}
          className="text-white p-1.5 rounded-lg transition"
          style={{ backgroundColor: "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#312e81")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#2dd4bf" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-white font-semibold text-sm">PsicoScan ML</span>
        </div>
      </div>

      {/* Sidebar en desktop */}
      <div className="hidden lg:flex h-full">
        <Sidebar rol={rol} nombre={nombre} />
      </div>

      {/* Drawer en mobile */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full">
            <Sidebar rol={rol} nombre={nombre} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
