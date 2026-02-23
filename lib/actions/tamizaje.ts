"use server"

import { redirect } from "next/navigation"
import { TOTAL_REACTIVOS } from "@/lib/data/reactivos"

export type GuardarTamizajeResult = { error: string } | undefined

export async function guardarTamizaje(
  estudianteId: string,
  respuestas: number[],
  esEstudiante = false
): Promise<GuardarTamizajeResult> {
  if (respuestas.length !== TOTAL_REACTIVOS) {
    return { error: "Debe completar todos los reactivos antes de enviar." }
  }
  if (respuestas.some((r) => r < 1 || r > 5)) {
    return { error: "Respuestas fuera de rango (1–5)." }
  }

  // TODO: Cuando el ML API esté disponible:
  //   const mlRes = await fetch(process.env.ML_API_URL + "/clasificar", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ estudianteId, respuestas }),
  //   })
  //   const clasificacion = await mlRes.json()
  //   await prisma.tamizaje.create({ data: { estudianteId, ...clasificacion, itemsCriticos: clasificacion.itemsCriticos } })

  if (esEstudiante) {
    redirect("/cuestionario/mi-sena/completado")
  } else {
    redirect(`/cuestionario/${estudianteId}/completado`)
  }
}
