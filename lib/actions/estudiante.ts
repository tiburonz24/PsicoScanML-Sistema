"use server"

import { redirect } from "next/navigation"

export type RegistrarEstudianteResult = { error: string } | undefined

export async function registrarEstudiante(
  _prev: RegistrarEstudianteResult,
  formData: FormData
): Promise<RegistrarEstudianteResult> {
  const nombre  = (formData.get("nombre")  as string)?.trim()
  const edad    = Number(formData.get("edad"))
  const sexo    = formData.get("sexo")    as string
  const grado   = formData.get("grado")   as string
  const grupo   = (formData.get("grupo")  as string)?.trim().toUpperCase()
  const escuela = (formData.get("escuela") as string)?.trim()

  if (!nombre || !edad || !sexo || !grado || !grupo || !escuela) {
    return { error: "Todos los campos son obligatorios." }
  }
  if (edad < 10 || edad > 20) {
    return { error: "La edad debe estar entre 10 y 20 años." }
  }

  // TODO: Cuando la BD esté conectada:
  //   const nuevo = await prisma.estudiante.create({
  //     data: { nombre, edad, sexo, grado, grupo, escuela }
  //   })
  //   redirect(`/cuestionario/${nuevo.id}`)

  redirect("/cuestionario?registrado=1")
}
