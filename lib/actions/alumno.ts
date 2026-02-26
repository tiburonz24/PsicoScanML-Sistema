"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { REACTIVOS, TOTAL_REACTIVOS } from "@/lib/data/reactivos"
import { calcularResultado } from "@/lib/sena/scoring"

// ─────────────────────────────────────────────
// LOGIN CON CURP
// ─────────────────────────────────────────────
export type LoginCurpResult = { error: string } | undefined

export async function loginConCurp(
  _prev: LoginCurpResult,
  formData: FormData
): Promise<LoginCurpResult> {
  const curp = (formData.get("curp") as string)?.trim().toUpperCase()

  if (!curp) return { error: "Ingresa tu CURP." }
  if (curp.length !== 18) return { error: "La CURP debe tener exactamente 18 caracteres." }

  let estudiante: { id: string; nombre: string } | null = null
  try {
    estudiante = await prisma.estudiante.findUnique({
      where: { curp },
      select: { id: true, nombre: true },
    })
  } catch {
    return { error: "Error de conexión. Intenta de nuevo." }
  }

  if (!estudiante) {
    return { error: "No se encontró ningún alumno con esa CURP. Verifica con tu orientador." }
  }

  // Guardar sesión en cookie (httpOnly, 2 horas)
  const jar = await cookies()
  jar.set("alumno_id", estudiante.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 2,
    path: "/",
    sameSite: "lax",
  })

  redirect("/alumno/test")
}

// ─────────────────────────────────────────────
// GUARDAR RESPUESTAS + SCORING
// ─────────────────────────────────────────────
export type GuardarAlumnoResult = { error: string } | undefined

export async function guardarRespuestasAlumno(
  estudianteId: string,
  respuestas: number[]
): Promise<GuardarAlumnoResult> {
  if (respuestas.length !== TOTAL_REACTIVOS) {
    return { error: "Debes completar todos los reactivos antes de enviar." }
  }
  if (respuestas.some(r => r < 1 || r > 5)) {
    return { error: "Respuestas fuera de rango (1–5)." }
  }

  // Calcular puntuaciones básicas con el motor SENA
  const textos = REACTIVOS.map(r => r.texto)
  const resultado = calcularResultado(respuestas, textos)

  try {
    await prisma.respuestasCuestionario.create({
      data: {
        estudianteId,
        respuestas,
        procesado: true,
      },
    })
  } catch {
    return { error: "Error al guardar las respuestas. Intenta de nuevo." }
  }

  // Limpiar cookie de sesión
  const jar = await cookies()
  jar.delete("alumno_id")

  // Guardar resultado en la sesión temporal para mostrarlo en /alumno/gracias
  // (pasamos el semáforo como query param para la página de gracias)
  redirect(`/alumno/gracias?s=${resultado.semaforo}&c=${resultado.itemsCriticos.length}`)
}

// ─────────────────────────────────────────────
// OBTENER ALUMNO DESDE COOKIE
// ─────────────────────────────────────────────
export async function obtenerAlumnoDeCookie() {
  const jar = await cookies()
  const alumnoId = jar.get("alumno_id")?.value
  if (!alumnoId) return null

  try {
    return await prisma.estudiante.findUnique({
      where: { id: alumnoId },
      select: { id: true, nombre: true, grado: true, grupo: true },
    })
  } catch {
    return null
  }
}
