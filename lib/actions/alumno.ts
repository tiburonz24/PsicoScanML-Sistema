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

  // Verificar si ya completó el cuestionario
  try {
    const yaContesto = await prisma.tamizaje.findFirst({
      where: { estudianteId: estudiante.id },
      select: { id: true },
    })
    if (yaContesto) {
      return { error: "Ya completaste el cuestionario. Si tienes dudas o necesitas repetirlo, acude con tu orientador." }
    }
  } catch {
    return { error: "Error de conexión. Intenta de nuevo." }
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

  // Escalas: PD real (suma bruta de items) donde hay mapeo item->escala.
  // glo/emo/con/eje/ctx/rec/reg/bus quedan null — no hay baremo ni mapeo de
  // items para calcularlas (ver nota en prisma/schema.prisma). No fingir un
  // valor de 50: es un dato que puede llevar a decisiones clinicas.
  const pb = resultado.puntuacionesBrutas

  // ── 6. Guardar en base de datos ───────────────────────────────────────────
  try {
    await prisma.respuestasCuestionario.create({
      data: { estudianteId, respuestas, procesado: true },
    })
    await prisma.tamizaje.create({
      data: {
        estudianteId,
        inc, neg, pos,
        dep_t: pb.dep ?? 0, ans_t: pb.ans ?? 0, asc_t: pb.asc ?? 0,
        som_t: pb.som ?? 0, pst_t: pb.pst ?? 0, obs_t: pb.obs ?? 0,
        ate_t: pb.ate ?? 0, hip_t: pb.hip ?? 0, ira_t: pb.ira ?? 0,
        agr_t: pb.agr ?? 0, des_t: pb.des ?? 0, ant_t: pb.ant ?? 0,
        sus_t: pb.sus ?? 0, esq_t: pb.esq ?? 0, ali_t: pb.ali ?? 0,
        fam_t: pb.fam ?? 0, esc_t: pb.esc ?? 0, com_t: pb.com ?? 0,
        aut_t: pb.aut ?? 0, soc_t: pb.soc ?? 0, cnc_t: pb.cnc ?? 0,
        escalasCalculadas: false,
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
