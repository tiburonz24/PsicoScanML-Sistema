"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Rol } from "@prisma/client"

type NavItem = {
  label: string
  href: string
  roles: Rol[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: [Rol.ADMIN, Rol.DIRECTOR, Rol.PSICOLOGO, Rol.ORIENTADOR],
  },
  {
    label: "Estudiantes",
    href: "/estudiantes",
    roles: [Rol.ADMIN, Rol.DIRECTOR, Rol.PSICOLOGO, Rol.ORIENTADOR],
  },
  {
    label: "Cuestionario",
    href: "/cuestionario",
    roles: [Rol.ESTUDIANTE, Rol.PSICOLOGO, Rol.ADMIN],
  },
]

export default function Sidebar({ rol }: { rol: Rol }) {
  const pathname = usePathname()

  const itemsVisibles = NAV_ITEMS.filter((item) => item.roles.includes(rol))

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-base">PsicoScan ML</h2>
        <p className="text-xs text-gray-400 mt-0.5">CECyTEN Tepic</p>
      </div>

      {/* Navegacion */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {itemsVisibles.map((item) => {
          const activo = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition ${
                activo
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Rol y cerrar sesion */}
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Rol: {rol}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-red-500 hover:underline"
        >
          Cerrar sesion
        </button>
      </div>
    </aside>
  )
}
