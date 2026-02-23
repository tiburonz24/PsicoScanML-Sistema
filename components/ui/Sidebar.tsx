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

function IconDashboard() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function IconEstudiantes() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
function IconCuestionario() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",       href: "/dashboard",            roles: [Rol.ADMIN, Rol.DIRECTOR, Rol.PSICOLOGO, Rol.ORIENTADOR], icon: <IconDashboard /> },
  { label: "Estudiantes",     href: "/estudiantes",          roles: [Rol.ADMIN, Rol.DIRECTOR, Rol.PSICOLOGO, Rol.ORIENTADOR], icon: <IconEstudiantes /> },
  { label: "Cuestionario",    href: "/cuestionario",         roles: [Rol.PSICOLOGO, Rol.ADMIN],                                icon: <IconCuestionario /> },
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
  const itemsVisibles = NAV_ITEMS.filter((item) => item.roles.includes(rol))

  return (
    <aside className="w-64 flex flex-col h-full" style={{ backgroundColor: "#1e1b4b" }}>

      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between"
           style={{ borderBottom: "1px solid #312e81" }}>
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#2dd4bf" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="font-bold text-white text-sm">PsicoScan ML</h2>
          </div>
          <p className="text-xs mt-0.5 pl-8" style={{ color: "#818cf8" }}>CECyTEN Tepic</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white opacity-60 hover:opacity-100 transition p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Etiqueta de sección */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6366f1" }}>
          Menú
        </p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 space-y-1">
        {itemsVisibles.map((item) => {
          const activo = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={
                activo
                  ? { backgroundColor: "#4f46e5", color: "#ffffff", fontWeight: 600 }
                  : { color: "#c7d2fe" }
              }
              onMouseEnter={(e) => {
                if (!activo) {
                  e.currentTarget.style.backgroundColor = "#312e81"
                  e.currentTarget.style.color = "#ffffff"
                }
              }}
              onMouseLeave={(e) => {
                if (!activo) {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "#c7d2fe"
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
      <div className="px-4 py-4" style={{ borderTop: "1px solid #312e81" }}>
        <div className="mb-3">
          {nombre && (
            <p className="text-sm font-medium text-white truncate">{nombre}</p>
          )}
          <span
            className="inline-block text-xs rounded-md px-2 py-0.5 mt-1"
            style={{ backgroundColor: "#312e81", color: "#a5b4fc" }}
          >
            {LABELS_ROL[rol]}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-xs transition"
          style={{ color: "#818cf8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#818cf8")}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
