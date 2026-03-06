"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Rol } from "@/lib/enums"

const ROLES_STAFF: string[] = [Rol.ADMIN, Rol.PSICOLOGO, Rol.DIRECTOR, Rol.ORIENTADOR]

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.rol !== Rol.ADMIN) throw new Error("No autorizado")
  return session
}

export async function crearUsuario(data: {
  nombre: string
  email: string
  password: string
  rol: string
}) {
  await requireAdmin()
  if (!ROLES_STAFF.includes(data.rol)) throw new Error("Rol no válido")
  if (data.password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres")

  const existe = await prisma.usuario.findUnique({ where: { email: data.email } })
  if (existe) throw new Error("Ya existe un usuario con ese correo")

  const hash = await bcrypt.hash(data.password, 12)
  await prisma.usuario.create({
    data: {
      nombre:   data.nombre.trim(),
      email:    data.email.trim().toLowerCase(),
      password: hash,
      rol:      data.rol as Rol,
    },
  })
  revalidatePath("/usuarios")
}

export async function actualizarUsuario(
  id: string,
  data: { nombre: string; email: string; rol: string; password?: string }
) {
  const session = await requireAdmin()
  if (!ROLES_STAFF.includes(data.rol)) throw new Error("Rol no válido")

  const existe = await prisma.usuario.findFirst({
    where: { email: data.email, NOT: { id } },
  })
  if (existe) throw new Error("Ya existe otro usuario con ese correo")

  // No permitir quitarse el rol ADMIN a sí mismo
  if (session.user.email === (await prisma.usuario.findUnique({ where: { id }, select: { email: true } }))?.email) {
    if (data.rol !== Rol.ADMIN) throw new Error("No puedes cambiar tu propio rol de administrador")
  }

  const update: Record<string, unknown> = {
    nombre: data.nombre.trim(),
    email:  data.email.trim().toLowerCase(),
    rol:    data.rol as Rol,
  }
  if (data.password && data.password.length > 0) {
    if (data.password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres")
    update.password = await bcrypt.hash(data.password, 12)
  }

  await prisma.usuario.update({ where: { id }, data: update })
  revalidatePath("/usuarios")
}

export async function eliminarUsuario(id: string) {
  const session = await requireAdmin()

  const usuario = await prisma.usuario.findUnique({ where: { id }, select: { email: true } })
  if (!usuario) throw new Error("Usuario no encontrado")
  if (usuario.email === session.user.email) throw new Error("No puedes eliminar tu propio usuario")

  await prisma.usuario.delete({ where: { id } })
  revalidatePath("/usuarios")
}
