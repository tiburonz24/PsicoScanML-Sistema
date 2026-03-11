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
  if (respuestas.length !== TOTAL_REACTIVOS) {
    return { error: "Debes completar todos los reactivos antes de enviar." }
  }
  if (respuestas.some(r => r < 1 || r > 5)) {
    return { error: "Respuestas fuera de rango (1–5)." }
  }

  // Calcular puntuaciones con el motor SENA
  const textos  = REACTIVOS.map(r => r.texto)
  const resultado = calcularResultado(respuestas, textos)

  // ── Escalas de control normalizadas ──────────────────────────────────────
  // inc: media de diferencias absolutas entre pares similares (rango 0-4)
  const incBruta = INC_PAIRS.reduce(
    (acc, [a, b]) => acc + Math.abs((respuestas[a - 1] ?? 0) - (respuestas[b - 1] ?? 0)), 0
  )
  const inc = parseFloat((incBruta / INC_PAIRS.length).toFixed(2))
  // neg: cuenta de ítems con respuesta ≥ 3 (contenido extremo patológico)
  const neg = ESCALAS.neg.items.filter(i => (respuestas[i - 1] ?? 0) >= 3).length
  // pos: cuenta de ítems con respuesta ≥ 4 (sesgo de ajuste positivo)
  const pos = ESCALAS.pos.items.filter(i => (respuestas[i - 1] ?? 0) >= 4).length

  // ── T-scores ─────────────────────────────────────────────────────────────
  // Se usan 50 (media normativa) como placeholder.
  // El módulo ML los actualizará cuando el modelo entrenado esté disponible.
  const t50 = 50

  // Serializar ítems críticos al formato del modelo Tamizaje
  const itemsCriticosDb = resultado.itemsCriticos.map(ic => ({
    item:              ic.item,
    texto:             ic.texto,
    categoria:         ic.categoria,
    respuesta:         ic.respuesta,
    etiquetaRespuesta: ic.etiqueta,
  }))

  try {
    await prisma.$transaction([
      prisma.respuestasCuestionario.create({
        data: { estudianteId, respuestas, procesado: true },
      }),
      prisma.tamizaje.create({
        data: {
          estudianteId,
          inc, neg, pos,
          // Índices globales (placeholder T=50)
          glo_t: t50, emo_t: t50, con_t: t50, eje_t: t50, ctx_t: t50, rec_t: t50,
          // Problemas interiorizados (placeholder T=50)
          dep_t: t50, ans_t: t50, asc_t: t50, som_t: t50, pst_t: t50, obs_t: t50,
          // Problemas exteriorizados (placeholder T=50)
          ate_t: t50, hip_t: t50, ira_t: t50, agr_t: t50, des_t: t50, ant_t: t50,
          // Otros problemas (placeholder T=50)
          sus_t: t50, esq_t: t50, ali_t: t50,
          // Contextuales (placeholder T=50)
          fam_t: t50, esc_t: t50, com_t: t50,
          // Vulnerabilidades (placeholder T=50)
          reg_t: t50, bus_t: t50,
          // Recursos personales (placeholder T=50)
          aut_t: t50, soc_t: t50, cnc_t: t50,
          // Resultado del scoring
          tipoCaso:     resultado.tipoCaso as "SIN_RIESGO" | "CON_RIESGO" | "INCONSISTENCIA" | "IMPRESION_POSITIVA" | "IMPRESION_NEGATIVA",
          semaforo:     resultado.semaforo as "VERDE" | "AMARILLO" | "ROJO" | "ROJO_URGENTE",
          observaciones: resultado.observaciones,
          itemsCriticos: itemsCriticosDb,
        },
      }),
    ])
  } catch {
    return { error: "Error al guardar las respuestas. Intenta de nuevo." }
  }

  // Limpiar cookie de sesión
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
