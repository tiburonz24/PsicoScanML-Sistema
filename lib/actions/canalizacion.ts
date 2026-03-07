"use server"

import { revalidatePath } from "next/cache"
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

export type CanalizacionResult = { error?: string; ok?: boolean }

export async function crearCanalizacion(
  _prev: CanalizacionResult,
  formData: FormData
): Promise<CanalizacionResult> {
  try { await verificarRol() } catch { return { error: "No tienes permiso para esta acción." } }

  const estudianteId    = (formData.get("estudianteId") as string)?.trim()
  const institucion     = (formData.get("institucion") as string)?.trim()
  const tipoInstitucion = (formData.get("tipoInstitucion") as string) || "PUBLICA"
  const tipoAtencion    = (formData.get("tipoAtencion") as string)?.trim() || null
  const motivo          = (formData.get("motivo") as string)?.trim()
  const nivelRiesgoStr  = (formData.get("nivelRiesgo") as string)?.trim()
  const urgente         = formData.get("urgente") === "on"
  const notas           = (formData.get("notas") as string)?.trim() || null

  if (!estudianteId || !institucion || !motivo) {
    return { error: "Institución y motivo son obligatorios." }
  }

  const nivelRiesgo = nivelRiesgoStr ? parseInt(nivelRiesgoStr, 10) : null

  try {
    await prisma.canalizacion.create({
      data: {
        estudianteId,
        institucion,
        tipoInstitucion: tipoInstitucion as "PUBLICA" | "PRIVADA",
        tipoAtencion,
        motivo,
        nivelRiesgo,
        urgente,
        notas,
      },
    })
    // Actualizar estado del expediente a DERIVADO si es urgente
    if (urgente) {
      await prisma.expedienteClinico.upsert({
        where:  { estudianteId },
        create: { estudianteId, estado: "DERIVADO" },
        update: { estado: "DERIVADO" },
      })
    }
  } catch (e) {
    console.error("[crearCanalizacion]", e)
    return { error: "No se pudo registrar la canalización." }
  }

  revalidatePath(`/expediente/${estudianteId}`)
  return { ok: true }
}

export async function actualizarSeguimientoCanalizacion(
  _prev: CanalizacionResult,
  formData: FormData
): Promise<CanalizacionResult> {
  try { await verificarRol() } catch { return { error: "No tienes permiso para esta acción." } }

  const id                = (formData.get("id") as string)?.trim()
  const estudianteId      = (formData.get("estudianteId") as string)?.trim()
  const estado            = (formData.get("estado") as string) || "PENDIENTE"
  const firmaPadres       = formData.get("firmaPadres") === "on"
  const documentoRecibido = formData.get("documentoRecibido") === "on"
  const tipoDocumento     = (formData.get("tipoDocumento") as string)?.trim() || null
  const notas             = (formData.get("notas") as string)?.trim() || null

  if (!id || !estudianteId) return { error: "ID requerido." }

  try {
    await prisma.canalizacion.update({
      where: { id },
      data: {
        estado:            estado as "PENDIENTE" | "EN_PROCESO" | "COMPLETADA" | "SIN_SEGUIMIENTO",
        firmaPadres,
        documentoRecibido,
        tipoDocumento,
        fechaDocumento:    documentoRecibido ? new Date() : null,
        notas,
      },
    })
  } catch (e) {
    console.error("[actualizarSeguimientoCanalizacion]", e)
    return { error: "No se pudo actualizar el seguimiento." }
  }

  revalidatePath(`/expediente/${estudianteId}`)
  return { ok: true }
}

export async function actualizarNivelRiesgo(
  estudianteId: string,
  nivelRiesgo: number | null
): Promise<void> {
  const session = await getServerSession(authOptions)
  if (!session || !ROLES_PERMITIDOS.includes(session.user.rol as Rol)) return

  await prisma.expedienteClinico.upsert({
    where:  { estudianteId },
    create: { estudianteId, nivelRiesgo },
    update: { nivelRiesgo },
  })
  revalidatePath(`/expediente/${estudianteId}`)
}
