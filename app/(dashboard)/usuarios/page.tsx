import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import UsuariosContent from "./UsuariosContent"

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.rol !== "ADMIN") redirect("/dashboard")

  const usuarios = await prisma.usuario.findMany({
    where: { rol: { not: "ESTUDIANTE" } },
    orderBy: { creadoEn: "asc" },
    select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
  })

  return (
    <UsuariosContent
      usuarios={usuarios.map(u => ({ ...u, creadoEn: u.creadoEn.toISOString() }))}
      sesionEmail={session.user.email ?? ""}
    />
  )
}
