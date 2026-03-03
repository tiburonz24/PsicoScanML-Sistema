"use server"

import { redirect } from "next/navigation"
import { REACTIVOS, TOTAL_REACTIVOS } from "@/lib/data/reactivos"
import { calcularResultado } from "@/lib/sena/scoring"
import { prisma } from "@/lib/db"
import type { Semaforo, TipoCaso } from "@/lib/enums"

export type GuardarTamizajeResult = { error: string } | undefined

// Mapea los valores de tipoCaso del scoring al enum de Prisma
function normalizarTipoCaso(tipoCaso: string): TipoCaso {
  const validos = ["INCONSISTENCIA", "SIN_RIESGO", "IMPRESION_POSITIVA", "IMPRESION_NEGATIVA", "CON_RIESGO"]
  if (validos.includes(tipoCaso)) return tipoCaso as TipoCaso
  // "SEGUIMIENTO" y otros → SIN_RIESGO (monitoreo preventivo sin riesgo confirmado)
  return "SIN_RIESGO"
}

/**
 * Núcleo del tamizaje: scoring + ML + guardado en DB.
 * No valida longitud ni hace redirect — apta para importación masiva.
 */
export async function procesarYGuardarTamizaje(
  estudianteId: string,
  respuestas: number[],
  { skipML = false }: { skipML?: boolean } = {}
): Promise<{ semaforo: string; tipoCaso: string }> {
  // ── 1. Scoring local (siempre disponible, no depende del ML API) ──────────
  const textos = REACTIVOS.map((r) => r.texto)
  const scoring = calcularResultado(respuestas, textos)
  const pb = scoring.puntuacionesBrutas

  let semaforo: Semaforo = scoring.semaforo
  let tipoCaso: TipoCaso = normalizarTipoCaso(scoring.tipoCaso)
  let observaciones: string = scoring.observaciones

  // ── 2. Intentar clasificación ML (con fallback transparente) ──────────────
  const estudiante = await prisma.estudiante.findUnique({
    where: { id: estudianteId },
    select: { edad: true, sexo: true },
  })
  const cadenaRespuestas = respuestas.join("")
  if (!skipML) try {
    const mlUrl = process.env.ML_API_URL ?? "http://localhost:8000"
    const mlRes = await fetch(`${mlUrl}/api/v1/clasificar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estudiante_id: estudianteId,
        // Escalas de control — valores reales del scoring
        inc: pb.inc ?? 0,
        neg: pb.neg ?? 0,
        pos: pb.pos ?? 0,
        // Índices globales — puntuaciones brutas como proxy (sin baremos T)
        glo_t: pb.dep ?? 50,
        emo_t: pb.ans ?? 50,
        con_t: pb.ate ?? 50,
        eje_t: pb.hip ?? 50,
        ctx_t: pb.fam ?? 50,
        rec_t: pb.aut ?? 50,
        // Escalas clínicas
        dep_t: pb.dep ?? 50, ans_t: pb.ans ?? 50, asc_t: pb.asc ?? 50,
        som_t: pb.som ?? 50, pst_t: pb.pst ?? 50, obs_t: pb.obs ?? 50,
        ate_t: pb.ate ?? 50, hip_t: pb.hip ?? 50, ira_t: pb.ira ?? 50,
        agr_t: pb.agr ?? 50, des_t: pb.des ?? 50, ant_t: pb.ant ?? 50,
        sus_t: pb.sus ?? 50, esq_t: pb.esq ?? 50, ali_t: pb.ali ?? 50,
        fam_t: pb.fam ?? 50, esc_t: pb.esc ?? 50, com_t: pb.com ?? 50,
        reg_t: 50, bus_t: 50,
        aut_t: pb.aut ?? 50, soc_t: pb.soc ?? 50, cnc_t: pb.cnc ?? 50,
        items_criticos_count: scoring.itemsCriticos.length,
        respuestas: cadenaRespuestas,
        edad: estudiante?.edad ?? 15,
        sexo: estudiante?.sexo ?? "MASCULINO",
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (mlRes.ok) {
      const ml = await mlRes.json()
      semaforo = ml.semaforo as Semaforo
      tipoCaso = normalizarTipoCaso(ml.tipo_caso)
      if (ml.observaciones) observaciones = ml.observaciones
    }
  } catch {
    // ML API no disponible — el resultado del scoring local ya está en semaforo/tipoCaso
  } // end if (!skipML)

  // ── 3. Guardar tamizaje en base de datos ──────────────────────────────────
  await prisma.tamizaje.create({
    data: {
      estudianteId,
      inc: pb.inc ?? 0, neg: pb.neg ?? 0, pos: pb.pos ?? 0,
      glo_t: 50, emo_t: 50, con_t: 50, eje_t: 50, ctx_t: 50, rec_t: 50,
      dep_t: pb.dep ?? 0, ans_t: pb.ans ?? 0, asc_t: pb.asc ?? 0,
      som_t: pb.som ?? 0, pst_t: pb.pst ?? 0, obs_t: pb.obs ?? 0,
      ate_t: pb.ate ?? 0, hip_t: pb.hip ?? 0, ira_t: pb.ira ?? 0,
      agr_t: pb.agr ?? 0, des_t: pb.des ?? 0, ant_t: pb.ant ?? 0,
      sus_t: pb.sus ?? 0, esq_t: pb.esq ?? 0, ali_t: pb.ali ?? 0,
      fam_t: pb.fam ?? 0, esc_t: pb.esc ?? 0, com_t: pb.com ?? 0,
      reg_t: 0, bus_t: 0,
      aut_t: pb.aut ?? 0, soc_t: pb.soc ?? 0, cnc_t: pb.cnc ?? 0,
      semaforo,
      tipoCaso,
      observaciones,
      itemsCriticos: scoring.itemsCriticos,
    },
  })

  // ── 4. Guardar respuestas crudas ──────────────────────────────────────────
  await prisma.respuestasCuestionario.create({
    data: {
      estudianteId,
      respuestas,
      procesado: true,
    },
  })

  return { semaforo, tipoCaso }
}

export async function guardarTamizaje(
  estudianteId: string,
  respuestas: number[],
  esEstudiante = false
): Promise<GuardarTamizajeResult> {
  // ── 1. Validar ────────────────────────────────────────────────────────────
  if (respuestas.length !== TOTAL_REACTIVOS) {
    return { error: "Debe completar todos los reactivos antes de enviar." }
  }
  if (respuestas.some((r) => r < 1 || r > 5)) {
    return { error: "Respuestas fuera de rango (1–5)." }
  }

  // ── 2. Procesar y guardar ─────────────────────────────────────────────────
  try {
    await procesarYGuardarTamizaje(estudianteId, respuestas)
  } catch (err) {
    console.error("[guardarTamizaje] Error al guardar en DB:", err)
    return { error: "Error al guardar el tamizaje. Intente de nuevo." }
  }

  // ── 3. Redirect ───────────────────────────────────────────────────────────
  if (esEstudiante) {
    redirect("/cuestionario/mi-sena/completado")
  } else {
    redirect(`/cuestionario/${estudianteId}/completado`)
  }
}
