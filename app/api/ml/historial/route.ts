import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireSession } from "@/lib/api-auth"
import { Rol } from "@/lib/enums"

export async function GET() {
  const auth = await requireSession([Rol.ADMIN, Rol.PSICOLOGO])
  if (!auth.ok) return auth.response

  const historial = await prisma.entrenamientoML.findMany({
    orderBy: { fecha: "desc" },
    take: 10,
    select: {
      id: true,
      fecha: true,
      nRegistros: true,
      trainSize: true,
      accuracy: true,
      cvMean: true,
      cvStd: true,
      nEstimators: true,
      report: true,
      importance: true,
    },
  })
  return NextResponse.json(historial)
}
