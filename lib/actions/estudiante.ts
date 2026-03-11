"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type RegistrarEstudianteResult = {
  error?: string
  fieldErrors?: Record<string, string>
} | undefined

const CURP_RE = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z][0-9]$/

export async function registrarEstudiante(
  _prev: RegistrarEstudianteResult,
  formData: FormData
): Promise<RegistrarEstudianteResult> {
  const nombre   = (formData.get("nombre")   as string ?? "").trim()
  const curp     = (formData.get("curp")     as string ?? "").trim().toUpperCase()
  const fechaNac = (formData.get("fechaNac") as string ?? "").trim()
  const sexo     = (formData.get("sexo")     as string ?? "").trim()
  const grado    = (formData.get("grado")    as string ?? "").trim()
  const grupo    = (formData.get("grupo")    as string ?? "").trim().toUpperCase()
  const escuela  = (formData.get("escuela")  as string ?? "").trim()

  // ── Validaciones por campo ───────────────────────────────────────────
  const fieldErrors: Record<string, string> = {}

  if (nombre.length < 3)
    fieldErrors.nombre = "Ingresa el nombre completo"

  if (!CURP_RE.test(curp))
    fieldErrors.curp = "CURP inválida — verifica el formato (18 caracteres)"

  if (!fechaNac)
    fieldErrors.fechaNac = "Selecciona la fecha de nacimiento"

  if (!["MASCULINO", "FEMENINO", "OTRO"].includes(sexo))
    fieldErrors.sexo = "Selecciona el sexo"

  if (!grado)
    fieldErrors.grado = "Selecciona el grado"

  if (!grupo)
    fieldErrors.grupo = "Ingresa el grupo (ej. A, B, C)"

  if (!escuela)
    fieldErrors.escuela = "Ingresa el nombre del plantel"

  if (Object.keys(fieldErrors).length > 0)
    return { fieldErrors }

  // ── Calcular edad desde fecha de nacimiento ──────────────────────────
  const hoy  = new Date()
  const nac  = new Date(fechaNac)
  let edad   = hoy.getFullYear() - nac.getFullYear()
  const mes  = hoy.getMonth() - nac.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--

  // ── Persistir ───────────────────────────────────────────────────────
  let estudianteId: string
  try {
    const nuevo = await prisma.estudiante.create({
      data: {
        nombre, curp, edad,
        sexo: sexo as "MASCULINO" | "FEMENINO" | "OTRO",
        grado, grupo, escuela,
      },
    })
    estudianteId = nuevo.id
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002")
      return { fieldErrors: { curp: "Ya existe un estudiante con esa CURP" } }
    return { error: "Error al guardar. Inténtalo de nuevo." }
  }

  revalidatePath("/estudiantes")
  redirect(`/estudiantes/${estudianteId}?nuevo=1`)
}
