"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

export type RegistrarEstudianteResult = { error: string } | undefined

const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/

export async function registrarEstudiante(
  _prev: RegistrarEstudianteResult,
  formData: FormData
): Promise<RegistrarEstudianteResult> {
  const nombre  = (formData.get("nombre")  as string)?.trim()
  const curp    = (formData.get("curp")    as string)?.trim().toUpperCase()
  const edad    = Number(formData.get("edad"))
  const sexo    = formData.get("sexo")    as string
  const grado   = formData.get("grado")   as string
  const grupo   = (formData.get("grupo")  as string)?.trim().toUpperCase()
  const escuela = (formData.get("escuela") as string)?.trim()

  if (!nombre || !curp || !edad || !sexo || !grado || !grupo || !escuela) {
    return { error: "Todos los campos son obligatorios." }
  }
  if (!CURP_REGEX.test(curp)) {
    return { error: "CURP inválida. Debe tener 18 caracteres con el formato correcto." }
  }
  if (edad < 10 || edad > 20) {
    return { error: "La edad debe estar entre 10 y 20 años." }
  }

  let token: string
  try {
    const nuevo = await prisma.estudiante.create({
      data: {
        nombre,
        curp,
        edad,
        sexo: sexo as "MASCULINO" | "FEMENINO" | "OTRO",
        grado,
        grupo,
        escuela,
      },
    })
    token = nuevo.tokenEncuesta
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err?.code === "P2002") {
      return { error: "Ya existe un estudiante registrado con esa CURP." }
    }
    return { error: "No se pudo conectar a la base de datos. Verifica la configuración." }
  }

  redirect(
    `/cuestionario?registrado=1&token=${token}&nombre=${encodeURIComponent(nombre)}`
  )
}
