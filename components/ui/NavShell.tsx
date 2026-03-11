"use client"

import { useState, useEffect } from "react"
import { Rol } from "@/lib/enums"
import Sidebar from "./Sidebar"
import Image from "next/image"

type Props = { rol: Rol; nombre?: string }

export default function NavShell({ rol, nombre }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <style>{`
        @media (max-width: 1023px) { .psico-sidebar-desktop { display: none !important; } }
        @media (min-width: 1024px) { .psico-header-mobile   { display: none !important; } }
      `}</style>

      {/* ── Desktop: sidebar fijo ── */}
      <div
        className="psico-sidebar-desktop"
        style={{ position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 40, width: 240 }}
      >
        <Sidebar rol={rol} nombre={nombre} />
      </div>

      {/* ── Móvil: header con hamburguesa ── */}
      <header
        className="psico-header-mobile"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, height: 56,
          display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
          backgroundColor: "#0D475A",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 2px 12px rgba(13,71,90,0.3)",
        }}
      >
        <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: "6px 8px", cursor: "pointer",
            display: "flex", alignItems: "center",
          }}
        >
          {open ? (
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image
            src="/logo.png"
            alt="PsicoScan ML"
            width={30}
            height={30}
            style={{ borderRadius: 6, background: "white", padding: 2, flexShrink: 0 }}
          />
          <span style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: 17, fontWeight: 800, color: "#fff" }}>
            Psico<span style={{ color: "#2ABFBF" }}>Scan</span> ML
          </span>
        </div>

        {nombre && (
          <div style={{
            marginLeft: "auto", width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #1A7A8A, #2ABFBF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
          }}>
            {nombre.charAt(0).toUpperCase()}
          </div>
        )}
      </header>

      {/* ── Móvil: overlay + drawer ── */}
      {open && (
        <div className="psico-header-mobile" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div
            style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
            onClick={() => setOpen(false)}
          />
          <div style={{ position: "relative", height: "100%", boxShadow: "4px 0 24px rgba(0,0,0,0.3)" }}>
            <Sidebar rol={rol} nombre={nombre} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
