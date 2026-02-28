"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Rol } from "@/lib/enums"

type NavItem = {
  label: string
  href: string
  roles: Rol[]
  icon: React.ReactNode
}

const SVG_PROPS = { width: 16, height: 16, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8, style: { flexShrink: 0 } } as const

function IconDashboard() {
  return (
    <svg {...SVG_PROPS}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function IconEstudiantes() {
  return (
    <svg {...SVG_PROPS}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
function IconCuestionario() {
  return (
    <svg {...SVG_PROPS}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}
function IconRespuestas() {
  return (
    <svg {...SVG_PROPS}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )
}
function IconHistorico() {
  return (
    <svg {...SVG_PROPS}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M10 12h4M10 16h4" />
    </svg>
  )
}
function IconCitas() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",       href: "/dashboard",            roles: [Rol.ADMIN, Rol.DIRECTOR, Rol.PSICOLOGO, Rol.ORIENTADOR], icon: <IconDashboard /> },
  { label: "Estudiantes",     href: "/estudiantes",          roles: [Rol.ADMIN, Rol.DIRECTOR, Rol.PSICOLOGO, Rol.ORIENTADOR], icon: <IconEstudiantes /> },
  { label: "Citas",           href: "/citas",                roles: [Rol.ADMIN, Rol.PSICOLOGO, Rol.ORIENTADOR],               icon: <IconCitas /> },
  { label: "Cuestionario",    href: "/cuestionario",         roles: [Rol.PSICOLOGO, Rol.ADMIN],                                icon: <IconCuestionario /> },
  { label: "Respuestas",      href: "/respuestas",           roles: [Rol.PSICOLOGO, Rol.ADMIN, Rol.ORIENTADOR],               icon: <IconRespuestas /> },
  { label: "Histórico ML",   href: "/historico",            roles: [Rol.ADMIN],                                              icon: <IconHistorico /> },
  { label: "Mi Cuestionario", href: "/cuestionario/mi-sena", roles: [Rol.ESTUDIANTE],                                         icon: <IconCuestionario /> },
]

const LABELS_ROL: Record<Rol, string> = {
  PSICOLOGO:  "Psicóloga/o",
  ADMIN:      "Administrador",
  DIRECTOR:   "Director",
  ORIENTADOR: "Orientador",
  ESTUDIANTE: "Estudiante",
}

type Props = {
  rol: Rol
  nombre?: string
  onClose?: () => void
}

export default function Sidebar({ rol, nombre, onClose }: Props) {
  const pathname = usePathname()
  const itemsVisibles = NAV_ITEMS.filter((item) => item.roles.includes(rol as Rol))

  return (
    <aside style={{ width: 224, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>

      {/* Logo */}
      <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>PsicoScan</span>
          <span style={{ fontSize: 12, color: "#334155" }}>· CECyTEN</span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, borderRadius: 4, color: "#475569", display: "flex" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>
            <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {itemsVisibles.length === 0 && (
          <p style={{ padding: "4px 8px", fontSize: 12, color: "#64748b" }}>
            Sin ítems (rol: {rol})
          </p>
        )}
        {itemsVisibles.map((item) => {
          const activo = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 10px", borderRadius: 6,
                fontSize: 12, fontWeight: 500, textDecoration: "none",
                backgroundColor: activo ? "#0ea5e9" : "#1e293b",
                color: activo ? "#ffffff" : "#e2e8f0",
                transition: "background-color 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!activo) {
                  e.currentTarget.style.backgroundColor = "#334155"
                  e.currentTarget.style.color = "#ffffff"
                }
              }}
              onMouseLeave={(e) => {
                if (!activo) {
                  e.currentTarget.style.backgroundColor = "#1e293b"
                  e.currentTarget.style.color = "#e2e8f0"
                }
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario + cerrar sesión */}
      <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #1e293b" }}>
        <div style={{ minWidth: 0 }}>
          {nombre && (
            <p style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nombre}</p>
          )}
          <span style={{ fontSize: 11, color: "#38bdf8" }}>{LABELS_ROL[rol]}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Cerrar sesión"
          style={{ marginLeft: 8, flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4, color: "#475569", display: "flex" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
        >
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
