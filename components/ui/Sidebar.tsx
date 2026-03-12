"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Rol } from "@/lib/enums"

type NavItem = {
  label: string
  href: string
  roles: Rol[]
  icon: React.ReactNode
}

type NavSection = {
  label: string
  items: NavItem[]
}

const IC = { width: 16, height: 16, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8, style: { flexShrink: 0 } } as const

const Icons = {
  Dashboard:   () => <svg {...IC}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Estudiantes: () => <svg {...IC}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Citas:       () => <svg {...IC}><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"/><line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Cuestionario:() => <svg {...IC}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Respuestas:  () => <svg {...IC}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Historico:   () => <svg {...IC}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M10 12h4M10 16h4" /></svg>,
  Usuarios:    () => <svg {...IC}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Portal:      () => <svg {...IC}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>,
  ExternalLink:() => <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0, opacity: 0.5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
}

export const LABELS_ROL: Record<Rol, string> = {
  PSICOLOGO:  "Psicóloga/o",
  ADMIN:      "Administrador",
  DIRECTOR:   "Director",
  ORIENTADOR: "Orientador",
  ESTUDIANTE: "Estudiante",
}

// Exportado para uso en otros componentes si se necesita
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",       href: "/dashboard",            roles: [Rol.ADMIN, Rol.DIRECTOR, Rol.PSICOLOGO, Rol.ORIENTADOR], icon: <Icons.Dashboard /> },
  { label: "Estudiantes",     href: "/estudiantes",          roles: [Rol.ADMIN, Rol.DIRECTOR, Rol.PSICOLOGO, Rol.ORIENTADOR], icon: <Icons.Estudiantes /> },
  { label: "Citas",           href: "/citas",                roles: [Rol.ADMIN, Rol.PSICOLOGO, Rol.ORIENTADOR],               icon: <Icons.Citas /> },
  { label: "Cuestionario",    href: "/cuestionario",         roles: [Rol.PSICOLOGO, Rol.ADMIN],                               icon: <Icons.Cuestionario /> },
  { label: "Respuestas",      href: "/respuestas",           roles: [Rol.PSICOLOGO, Rol.ADMIN, Rol.ORIENTADOR],               icon: <Icons.Respuestas /> },
  { label: "Histórico ML",    href: "/historico",            roles: [Rol.ADMIN, Rol.PSICOLOGO],                               icon: <Icons.Historico /> },
  { label: "Usuarios",        href: "/usuarios",             roles: [Rol.ADMIN],                                              icon: <Icons.Usuarios /> },
  { label: "Mi Cuestionario", href: "/cuestionario/mi-sena", roles: [Rol.ESTUDIANTE],                                         icon: <Icons.Cuestionario /> },
]

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Principal",
    items: NAV_ITEMS.filter(i => ["/dashboard", "/estudiantes"].includes(i.href)),
  },
  {
    label: "Clínico",
    items: NAV_ITEMS.filter(i => ["/citas", "/cuestionario", "/respuestas"].includes(i.href)),
  },
  {
    label: "Sistema",
    items: NAV_ITEMS.filter(i => ["/historico", "/usuarios"].includes(i.href)),
  },
  {
    label: "Mi espacio",
    items: NAV_ITEMS.filter(i => i.href === "/cuestionario/mi-sena"),
  },
]

type Props = { rol: Rol; nombre?: string; onClose?: () => void }

export default function Sidebar({ rol, nombre, onClose }: Props) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 240, height: "100%",
      backgroundColor: "#0D475A",
      display: "flex", flexDirection: "column",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {onClose && (
          <button onClick={onClose} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 2 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image
            src="/logo.png"
            alt="PsicoScan ML"
            width={44}
            height={44}
            style={{ borderRadius: 8, background: "white", padding: 2, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Psico<span style={{ color: "#2ABFBF" }}>Scan</span> ML
            </div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", fontStyle: "italic", marginTop: 2 }}>
              Tu mente importa, ¡Conócete!
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 0, overflowY: "auto" }}>
        {NAV_SECTIONS.map((section) => {

          const visibles = section.items.filter(item => item.roles.includes(rol as Rol))
          if (visibles.length === 0) return null
          return (
            <div key={section.label} style={{ marginBottom: 8 }}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                padding: "10px 12px 5px",
              }}>
                {section.label}
              </div>
              {visibles.map((item) => {
                const activo = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 14px", borderRadius: 10,
                      fontSize: 13.5, fontWeight: activo ? 600 : 400,
                      textDecoration: "none",
                      color: activo ? "#2ABFBF" : "rgba(255,255,255,0.6)",
                      backgroundColor: activo ? "rgba(42,191,191,0.15)" : "transparent",
                      transition: "all 0.15s ease",
                      marginBottom: 1,
                    }}
                    onMouseEnter={e => {
                      if (!activo) {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)"
                        e.currentTarget.style.color = "#fff"
                      }
                    }}
                    onMouseLeave={e => {
                      if (!activo) {
                        e.currentTarget.style.backgroundColor = "transparent"
                        e.currentTarget.style.color = "rgba(255,255,255,0.6)"
                      }
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )
        })}

        {/* Portal del Alumno — solo staff */}
        {rol !== Rol.ESTUDIANTE && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
              padding: "10px 12px 5px",
            }}>
              Accesos
            </div>
            <a
              href="/alumno/login"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 14px", borderRadius: 10,
                fontSize: 13.5, fontWeight: 400, textDecoration: "none",
                color: "rgba(255,255,255,0.6)",
                backgroundColor: "transparent",
                transition: "all 0.15s ease",
                marginBottom: 1,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "rgba(42,191,191,0.1)"
                e.currentTarget.style.color = "#2ABFBF"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "transparent"
                e.currentTarget.style.color = "rgba(255,255,255,0.6)"
              }}
            >
              <Icons.Portal />
              Portal del Alumno
              <Icons.ExternalLink />
            </a>
          </div>
        )}
      </nav>

      {/* Usuario */}
      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #1A7A8A, #2ABFBF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-syne), sans-serif",
          fontSize: 14, fontWeight: 700, color: "#fff",
        }}>
          {nombre?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {nombre ?? "Usuario"}
          </div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>
            {LABELS_ROL[rol]}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Cerrar sesión"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4, color: "rgba(255,255,255,0.35)", display: "flex", flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#FC8181")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
