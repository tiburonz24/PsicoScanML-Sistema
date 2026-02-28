"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"

export type SesionResult = { error?: string; ok?: boolean }

export async function crearSesion(
  _prev: SesionResult,
  formData: FormData
): Promise<SesionResult> {
  const estudianteId    = (formData.get("estudianteId") as string)?.trim()
  const tipo            = (formData.get("tipo") as string) || "SEGUIMIENTO"
  const motivo          = (formData.get("motivo") as string)?.trim() || null
  const notas           = (formData.get("notas") as string)?.trim()
  const acuerdos        = (formData.get("acuerdos") as string)?.trim() || null
  const planActualizado = (formData.get("planActualizado") as string)?.trim() || null

  if (!estudianteId || !notas) {
    return { error: "Las notas de sesión son obligatorias." }
  }

  try {
    await prisma.sesion.create({
      data: {
        estudianteId,
        tipo:            tipo as "EVALUACION_INICIAL" | "SEGUIMIENTO" | "INTERVENCION" | "CRISIS" | "CIERRE" | "DEVOLUCION",
        motivo,
        notas,
        acuerdos,
        planActualizado,
      },
    })
    await prisma.expedienteClinico.upsert({
      where:  { estudianteId },
      create: { estudianteId },
      update: { actualizadaEn: new Date() },
    })
  } catch (e) {
    console.error("[crearSesion]", e)
    return { error: "No se pudo guardar la sesión." }
  }

  revalidatePath(`/expediente/${estudianteId}`)
  return { ok: true }
}

export async function actualizarExpediente(
  _prev: SesionResult,
  formData: FormData
): Promise<SesionResult> {
  const estudianteId          = (formData.get("estudianteId") as string)?.trim()
  const motivoConsulta        = (formData.get("motivoConsulta") as string)?.trim() || null
  const antecedentes          = (formData.get("antecedentes") as string)?.trim() || null
  const diagnosticoPreliminar = (formData.get("diagnosticoPreliminar") as string)?.trim() || null
  const planIntervencion      = (formData.get("planIntervencion") as string)?.trim() || null
  const estado                = (formData.get("estado") as string) || "ACTIVO"

  if (!estudianteId) return { error: "ID de estudiante requerido." }

  try {
    await prisma.expedienteClinico.upsert({
      where:  { estudianteId },
      create: { estudianteId, motivoConsulta, antecedentes, diagnosticoPreliminar, planIntervencion, estado: estado as "ACTIVO" | "CERRADO" | "DERIVADO" | "EN_ESPERA" },
      update: {               motivoConsulta, antecedentes, diagnosticoPreliminar, planIntervencion, estado: estado as "ACTIVO" | "CERRADO" | "DERIVADO" | "EN_ESPERA" },
    })
  } catch (e) {
    console.error("[actualizarExpediente]", e)
    return { error: "No se pudo guardar el expediente." }
  }

  revalidatePath(`/expediente/${estudianteId}`)
  return { ok: true }
}
