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

export type ContactoResult = { error?: string; ok?: boolean }

export async function registrarContacto(
  _prev: ContactoResult,
  formData: FormData
): Promise<ContactoResult> {
  try { await verificarRol() } catch { return { error: "No tienes permiso para esta acción." } }

  const estudianteId = (formData.get("estudianteId") as string)?.trim()
  const tipo         = (formData.get("tipo") as string)?.trim()
  const resultado    = (formData.get("resultado") as string)?.trim()
  const notas        = (formData.get("notas") as string)?.trim() || null

  if (!estudianteId || !tipo || !resultado) {
    return { error: "Tipo y resultado son obligatorios." }
  }

  try {
    await prisma.contactoPadres.create({
      data: {
        estudianteId,
        tipo:      tipo      as "LLAMADA" | "MENSAJE_TEXTO" | "CONTACTO_POR_ALUMNO" | "CITA_PADRES",
        resultado: resultado as "CONTESTO" | "NO_CONTESTO" | "MENSAJE_ENVIADO" | "SIN_RESPUESTA" | "ACUDIO" | "NO_ACUDIO",
        notas,
      },
    })
  } catch (e) {
    console.error("[registrarContacto]", e)
    return { error: "No se pudo registrar el contacto." }
  }

  revalidatePath(`/expediente/${estudianteId}`)
  return { ok: true }
}

export async function eliminarContacto(id: string, estudianteId: string): Promise<void> {
  const session = await getServerSession(authOptions)
  if (!session || !ROLES_PERMITIDOS.includes(session.user.rol as Rol)) return
  await prisma.contactoPadres.delete({ where: { id } }).catch(() => {})
  revalidatePath(`/expediente/${estudianteId}`)
}
