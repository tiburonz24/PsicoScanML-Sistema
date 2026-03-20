"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { REACTIVOS, TOTAL_REACTIVOS } from "@/lib/data/reactivos"
import { calcularResultado, ESCALAS, INC_PAIRS } from "@/lib/sena/scoring"

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
  // ── 1. Validar parámetros de entrada ─────────────────────────────────────
  if (!estudianteId || typeof estudianteId !== "string") {
    return { error: "Sesión inválida. Inicia sesión de nuevo." }
  }
  if (!Array.isArray(respuestas) || respuestas.length !== TOTAL_REACTIVOS) {
    return { error: "Debes completar todos los reactivos antes de enviar." }
  }
  if (respuestas.some(r => typeof r !== "number" || !Number.isInteger(r) || r < 1 || r > 5)) {
    return { error: "Algunas respuestas son inválidas. Verifica que todas estén contestadas." }
  }

  // ── 2. Verificar que el estudiante existe ─────────────────────────────────
  let estudianteExiste = false
  try {
    const est = await prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { id: true },
    })
    estudianteExiste = est !== null
  } catch (err) {
    console.error("[guardarRespuestasAlumno] Error al verificar estudiante:", err)
    return { error: "Error de conexión. Intenta de nuevo." }
  }
  if (!estudianteExiste) {
    return { error: "Sesión expirada. Inicia sesión de nuevo." }
  }

  // ── 3. Protección contra doble envío ─────────────────────────────────────
  try {
    const tamizajeExistente = await prisma.tamizaje.findFirst({
      where: { estudianteId },
      select: { semaforo: true, itemsCriticos: true },
    })
    if (tamizajeExistente) {
      // Ya se guardó correctamente — limpiar cookie y redirigir
      const jar = await cookies()
      jar.delete("alumno_id")
      const criticos = Array.isArray(tamizajeExistente.itemsCriticos)
        ? (tamizajeExistente.itemsCriticos as unknown[]).length
        : 0
      redirect(`/alumno/gracias?s=${tamizajeExistente.semaforo}&c=${criticos}`)
    }
  } catch (err) {
    // Si es un error de redirect de Next.js, re-lanzar
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err
    console.error("[guardarRespuestasAlumno] Error al verificar tamizaje existente:", err)
    // No es bloqueante — continuar con el guardado
  }

  // ── 4. Calcular puntuaciones con el motor SENA ───────────────────────────
  let resultado: ReturnType<typeof calcularResultado>
  let inc: number, neg: number, pos: number
  try {
    const textos = REACTIVOS.map(r => r.texto)
    resultado = calcularResultado(respuestas, textos)

    // Escalas de control normalizadas
    const incBruta = INC_PAIRS.reduce(
      (acc, [a, b]) => acc + Math.abs((respuestas[a - 1] ?? 0) - (respuestas[b - 1] ?? 0)), 0
    )
    inc = parseFloat((incBruta / INC_PAIRS.length).toFixed(2))
    neg = ESCALAS.neg.items.filter(i => (respuestas[i - 1] ?? 0) >= 3).length
    pos = ESCALAS.pos.items.filter(i => (respuestas[i - 1] ?? 0) >= 4).length
  } catch (err) {
    console.error("[guardarRespuestasAlumno] Error en cálculo de scoring:", err)
    return { error: "Error al procesar las respuestas. Intenta de nuevo." }
  }

  // ── 5. Serializar ítems críticos ─────────────────────────────────────────
  const itemsCriticosDb = resultado.itemsCriticos.map(ic => ({
    item:              ic.item,
    texto:             ic.texto,
    categoria:         ic.categoria,
    respuesta:         ic.respuesta,
    etiquetaRespuesta: ic.etiqueta,
  }))

  // T-scores: placeholder 50 hasta que el módulo ML esté disponible
  const t50 = 50

  // ── 6. Guardar en base de datos ───────────────────────────────────────────
  try {
    await prisma.respuestasCuestionario.create({
      data: { estudianteId, respuestas, procesado: true },
    })
    await prisma.tamizaje.create({
      data: {
        estudianteId,
        inc, neg, pos,
        glo_t: t50, emo_t: t50, con_t: t50, eje_t: t50, ctx_t: t50, rec_t: t50,
        dep_t: t50, ans_t: t50, asc_t: t50, som_t: t50, pst_t: t50, obs_t: t50,
        ate_t: t50, hip_t: t50, ira_t: t50, agr_t: t50, des_t: t50, ant_t: t50,
        sus_t: t50, esq_t: t50, ali_t: t50,
        fam_t: t50, esc_t: t50, com_t: t50,
        reg_t: t50, bus_t: t50,
        aut_t: t50, soc_t: t50, cnc_t: t50,
        tipoCaso:     resultado.tipoCaso as "SIN_RIESGO" | "CON_RIESGO" | "INCONSISTENCIA" | "IMPRESION_POSITIVA" | "IMPRESION_NEGATIVA",
        semaforo:     resultado.semaforo as "VERDE" | "AMARILLO" | "ROJO" | "ROJO_URGENTE",
        observaciones: resultado.observaciones,
        itemsCriticos: itemsCriticosDb,
      },
    })
  } catch (err) {
    console.error("[guardarRespuestasAlumno] Error al guardar en DB:", err)
    return { error: "Error al guardar las respuestas. Intenta de nuevo." }
  }

  // ── 7. Limpiar sesión y redirigir ─────────────────────────────────────────
  const jar = await cookies()
  jar.delete("alumno_id")

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
