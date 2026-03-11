import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Rol } from "@/lib/enums"

const ROLES_PERMITIDOS: Rol[] = [Rol.ADMIN, Rol.PSICOLOGO, Rol.ORIENTADOR]

// FEMENINO=1, MASCULINO=2 — convención SENA
const SEXO_SENA: Record<string, string> = {
  FEMENINO:  "1",
  MASCULINO: "2",
  OTRO:      "2",
}

function escaparAtributo(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !ROLES_PERMITIDOS.includes(session.user.rol as Rol)) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 })
  }

  // Estudiantes que tienen respuestas sin procesar (más reciente primero)
  const estudiantes = await prisma.estudiante.findMany({
    where: {
      respuestasRaw: { some: { procesado: false } },
    },
    select: {
      nombre: true,
      edad:   true,
      sexo:   true,
      respuestasRaw: {
        where:   { procesado: false },
        orderBy: { fecha: "desc" },
        take:    1,
        select:  { respuestas: true },
      },
    },
    orderBy: { nombre: "asc" },
  })

  const lineas: string[] = ["<sujetos>"]
  let idx = 1

  for (const est of estudiantes) {
    const respJson = est.respuestasRaw[0]?.respuestas
    if (!respJson) continue

    const respStr = (respJson as number[]).join("")
    const nombre  = escaparAtributo(est.nombre)
    const sexo    = SEXO_SENA[est.sexo] ?? "2"

    lineas.push(
      `  <sujeto idSujeto='${idx}' nombre='${nombre}' edad='${est.edad}' sexo='${sexo}' respuestas='${respStr}' />`
    )
    idx++
  }

  lineas.push("</sujetos>")

  if (idx === 1) {
    // Sin estudiantes con respuestas pendientes
    return NextResponse.json(
      { error: "No hay estudiantes con respuestas pendientes de exportar." },
      { status: 404 }
    )
  }

  const fecha = new Date().toISOString().slice(0, 10)
  return new NextResponse(lineas.join("\n"), {
    headers: {
      "Content-Type":        "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="sena_export_${fecha}.xml"`,
    },
  })
}
