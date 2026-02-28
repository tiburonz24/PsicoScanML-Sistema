"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

export type CitaResult = { error: string } | undefined

export async function agendarCita(
  _prev: CitaResult,
  formData: FormData
): Promise<CitaResult> {
  const estudianteId  = (formData.get("estudianteId") as string)?.trim()
  const fechaStr      = (formData.get("fecha") as string)?.trim()
  const notas         = (formData.get("notas") as string)?.trim() || null

  if (!estudianteId || !fechaStr) {
    return { error: "Selecciona un estudiante y una fecha." }
  }
  const fecha = new Date(fechaStr)
  if (isNaN(fecha.getTime())) {
    return { error: "Fecha inválida." }
  }

  try {
    await prisma.cita.create({ data: { estudianteId, fecha, notas } })
    await prisma.expedienteClinico.upsert({
      where:  { estudianteId },
      create: { estudianteId },
      update: {},
    })
  } catch (e) {
    console.error("[agendarCita]", e)
    return { error: "No se pudo agendar la cita. Intenta de nuevo." }
  }

  redirect("/citas")
}

export async function actualizarEstadoCita(
  citaId: string,
  estado: "PENDIENTE" | "CONFIRMADA" | "COMPLETADA" | "CANCELADA"
): Promise<void> {
  await prisma.cita.update({ where: { id: citaId }, data: { estado } })
  revalidatePath("/citas")
}

export type CompletarCitaResult = { error: string } | undefined

export async function completarCitaConSesion(
  _prev: CompletarCitaResult,
  formData: FormData
): Promise<CompletarCitaResult> {
  const citaId          = (formData.get("citaId") as string)?.trim()
  const estudianteId    = (formData.get("estudianteId") as string)?.trim()
  const tipo            = (formData.get("tipo") as string) || "SEGUIMIENTO"
  const motivo          = (formData.get("motivo") as string)?.trim() || null
  const notas           = (formData.get("notas") as string)?.trim()
  const acuerdos        = (formData.get("acuerdos") as string)?.trim() || null
  const planActualizado = (formData.get("planActualizado") as string)?.trim() || null

  if (!citaId || !estudianteId || !notas) {
    return { error: "Las notas de sesión son obligatorias." }
  }

  try {
    await prisma.$transaction([
      prisma.cita.update({ where: { id: citaId }, data: { estado: "COMPLETADA" } }),
      prisma.sesion.create({
        data: {
          citaId,
          estudianteId,
          tipo:            tipo as "EVALUACION_INICIAL" | "SEGUIMIENTO" | "INTERVENCION" | "CRISIS" | "CIERRE" | "DEVOLUCION",
          motivo,
          notas,
          acuerdos,
          planActualizado,
        },
      }),
    ])
  } catch (e) {
    console.error("[completarCitaConSesion]", e)
    return { error: "No se pudo guardar la sesión. Intenta de nuevo." }
  }

  revalidatePath("/citas")
  revalidatePath(`/expediente/${estudianteId}`)
  redirect("/citas")
}
