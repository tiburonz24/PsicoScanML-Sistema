import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import CitasContent from "./CitasContent"

export default async function CitasPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const allowedRoles = ["ADMIN", "PSICOLOGO", "ORIENTADOR"]
  if (!allowedRoles.includes(session.user.rol)) redirect("/dashboard")

  const [citas, estudiantes] = await Promise.all([
    prisma.cita.findMany({
      include: { estudiante: { select: { id: true, nombre: true } } },
      orderBy: { fecha: "asc" },
    }),
    prisma.estudiante.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
  ])

  const citasDto = citas.map((c) => ({
    id:           c.id,
    fecha:        c.fecha.toISOString(),
    estado:       c.estado as string,
    notas:        c.notas,
    estudianteId: c.estudianteId,
    estudiante:   { id: c.estudiante.id, nombre: c.estudiante.nombre },
  }))

  return <CitasContent citas={citasDto} estudiantes={estudiantes} />
}
