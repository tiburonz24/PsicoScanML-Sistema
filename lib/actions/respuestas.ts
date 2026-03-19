"use server"

import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { TOTAL_REACTIVOS } from "@/lib/data/reactivos"

export type GuardarRespuestasResult = { error: string } | undefined

export async function guardarRespuestasPublico(
  estudianteId: string,
  token: string,
  respuestas: number[]
): Promise<GuardarRespuestasResult> {
  if (respuestas.length !== TOTAL_REACTIVOS) {
    return { error: "Debe completar todos los reactivos antes de enviar." }
  }
  if (respuestas.some((r) => r < 1 || r > 5)) {
    return { error: "Respuestas fuera de rango (1–5)." }
  }

  try {
    await prisma.respuestasCuestionario.create({
      data: {
        estudianteId,
        respuestas,
      },
    })
  } catch (err) {
    console.error("[guardarRespuestasPublico] Error al guardar en DB:", err)
    return { error: "Error al guardar las respuestas. Inténtalo de nuevo." }
  }

  redirect(`/tamizaje/${token}/completado`)
}
