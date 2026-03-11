"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { Rol } from "@/lib/enums"

const ROLES_PERMITIDOS: Rol[] = [Rol.PSICOLOGO, Rol.ORIENTADOR, Rol.ADMIN]

async function verificarRol() {
  const session = await getServerSession(authOptions)
  if (!session || !ROLES_PERMITIDOS.includes(session.user.rol as Rol)) {
    throw new Error("Acceso denegado")
  }
}

export type CitaResult = { error: string } | undefined

export async function agendarCita(
  _prev: CitaResult,
  formData: FormData
): Promise<CitaResult> {
  try { await verificarRol() } catch { return { error: "No tienes permiso para esta acción." } }

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
  const diaSemana = fecha.getDay() // 0=Dom, 6=Sáb
  if (diaSemana === 0 || diaSemana === 6) {
    return { error: "Solo se pueden agendar citas de lunes a viernes." }
  }

  try {
    await prisma.cita.create({ data: { estudianteId, fecha, notas } })
    const expediente = await prisma.expedienteClinico.findFirst({
      where: { estudianteId },
      select: { id: true },
    })
    if (!expediente) {
      await prisma.expedienteClinico.create({ data: { estudianteId } })
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[agendarCita]", e)
    return { error: `Error al guardar: ${msg}` }
  }

  redirect("/citas")
}

export async function actualizarEstadoCita(
  citaId: string,
  estado: "PENDIENTE" | "CONFIRMADA" | "COMPLETADA" | "CANCELADA"
): Promise<void> {
  const session = await getServerSession(authOptions)
  if (!session || !ROLES_PERMITIDOS.includes(session.user.rol as Rol)) return

  await prisma.cita.update({ where: { id: citaId }, data: { estado } })
  revalidatePath("/citas")
}

export type CompletarCitaResult = { error: string } | undefined

export async function completarCitaConSesion(
  _prev: CompletarCitaResult,
  formData: FormData
): Promise<CompletarCitaResult> {
  try { await verificarRol() } catch { return { error: "No tienes permiso para esta acción." } }

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
    await prisma.cita.update({ where: { id: citaId }, data: { estado: "COMPLETADA" } })
    await prisma.sesion.create({
      data: {
        citaId,
        estudianteId,
        tipo:            tipo as "EVALUACION_INICIAL" | "SEGUIMIENTO" | "INTERVENCION" | "CRISIS" | "CIERRE" | "DEVOLUCION",
        motivo,
        notas,
        acuerdos,
        planActualizado,
      },
    })
  } catch (e) {
    console.error("[completarCitaConSesion]", e)
    return { error: "No se pudo guardar la sesión. Intenta de nuevo." }
  }

  revalidatePath("/citas")
  revalidatePath(`/expediente/${estudianteId}`)
  redirect("/citas")
}
