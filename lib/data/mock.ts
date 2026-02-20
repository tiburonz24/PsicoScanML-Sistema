/**
 * Datos mockeados — PsicoScan ML
 * Basados en los 5 casos tipo del documento Aranque.txt
 * Para cambiar a base de datos real: reemplazar las funciones de queries
 * en este archivo por llamadas a prisma.
 */

import { Semaforo, TipoCaso, Sexo, EstadoCita } from "@/lib/enums"

// =============================================
// TIPOS LOCALES (espejo de los modelos Prisma)
// =============================================

export type MockItemCritico = {
  item: number
  categoria: string
  texto: string
  respuesta: number
  etiquetaRespuesta: string
}

export type MockTamizaje = {
  id: string
  fecha: Date
  estudianteId: string
  // Escalas de control
  inc: number
  neg: number
  pos: number
  // Indices globales
  glo_t: number
  emo_t: number
  con_t: number
  eje_t: number
  ctx_t: number
  rec_t: number
  // Problemas interiorizados
  dep_t: number
  ans_t: number
  asc_t: number
  som_t: number
  pst_t: number
  obs_t: number
  // Problemas exteriorizados
  ate_t: number
  hip_t: number
  ira_t: number
  agr_t: number
  des_t: number
  ant_t: number
  // Otros problemas
  sus_t: number
  esq_t: number
  ali_t: number
  // Contextuales
  fam_t: number
  esc_t: number
  com_t: number
  // Vulnerabilidades
  reg_t: number
  bus_t: number
  // Recursos personales
  aut_t: number
  soc_t: number
  cnc_t: number
  // Resultado ML
  tipoCaso: TipoCaso
  semaforo: Semaforo
  observaciones: string | null
  itemsCriticos: MockItemCritico[]
}

export type MockEstudiante = {
  id: string
  nombre: string
  edad: number
  sexo: Sexo
  grado: string
  grupo: string
  escuela: string
  tamizajes: MockTamizaje[]
  citas: MockCita[]
}

export type MockCita = {
  id: string
  fecha: Date
  estado: EstadoCita
  notas: string | null
  estudianteId: string
}

// =============================================
// DATOS — LOS 5 CASOS TIPO
// =============================================

const TAMIZAJES: MockTamizaje[] = [
  // -------------------------------------------------------
  // CASO 1 — Inconsistencia | GFH1P | Varon, 14 años
  // -------------------------------------------------------
  {
    id: "tam-1",
    fecha: new Date("2025-10-10"),
    estudianteId: "est-1",
    inc: 1.2, neg: 2, pos: 6,
    glo_t: 43, emo_t: 49, con_t: 41, eje_t: 38, ctx_t: 45, rec_t: 47,
    dep_t: 66, ans_t: 52, asc_t: 48, som_t: 50, pst_t: 44, obs_t: 46,
    ate_t: 42, hip_t: 40, ira_t: 43, agr_t: 41, des_t: 38, ant_t: 36,
    sus_t: 44, esq_t: 48, ali_t: 45,
    fam_t: 66, esc_t: 50, com_t: 47,
    reg_t: 48, bus_t: 44,
    aut_t: 46, soc_t: 49, cnc_t: 51,
    tipoCaso: TipoCaso.INCONSISTENCIA,
    semaforo: Semaforo.AMARILLO,
    observaciones: "INC elevado (1.2). Solicitar repeticion del cuestionario.",
    itemsCriticos: [
      { item: 124, categoria: "Riesgo de autolesion", texto: "Quiero morirme", respuesta: 3, etiquetaRespuesta: "Algunas veces" },
      { item: 76, categoria: "Perdida de control", texto: "Siento que voy a perder el control", respuesta: 3, etiquetaRespuesta: "Algunas veces" },
    ],
  },

  // -------------------------------------------------------
  // CASO 2 — Sin riesgo | GRA1E | Mujer, 15 años
  // -------------------------------------------------------
  {
    id: "tam-2",
    fecha: new Date("2025-10-12"),
    estudianteId: "est-2",
    inc: 0.6, neg: 0, pos: 3,
    glo_t: 44, emo_t: 46, con_t: 46, eje_t: 46, ctx_t: 43, rec_t: 52,
    dep_t: 45, ans_t: 44, asc_t: 46, som_t: 43, pst_t: 42, obs_t: 45,
    ate_t: 44, hip_t: 43, ira_t: 42, agr_t: 41, des_t: 40, ant_t: 38,
    sus_t: 43, esq_t: 44, ali_t: 42,
    fam_t: 45, esc_t: 46, com_t: 44,
    reg_t: 43, bus_t: 45,
    aut_t: 52, soc_t: 54, cnc_t: 48,
    tipoCaso: TipoCaso.SIN_RIESGO,
    semaforo: Semaforo.VERDE,
    observaciones: "Sin indicadores de riesgo. Seguimiento periodico normal.",
    itemsCriticos: [],
  },

  // -------------------------------------------------------
  // CASO 3 — Impresion positiva | MGS1E | Varon, 15 años
  // -------------------------------------------------------
  {
    id: "tam-3",
    fecha: new Date("2025-10-14"),
    estudianteId: "est-3",
    inc: 0.5, neg: 0, pos: 9,
    glo_t: 43, emo_t: 49, con_t: 42, eje_t: 43, ctx_t: 41, rec_t: 55,
    dep_t: 44, ans_t: 46, asc_t: 43, som_t: 42, pst_t: 40, obs_t: 43,
    ate_t: 43, hip_t: 42, ira_t: 41, agr_t: 40, des_t: 39, ant_t: 37,
    sus_t: 42, esq_t: 43, ali_t: 41,
    fam_t: 44, esc_t: 43, com_t: 45,
    reg_t: 42, bus_t: 44,
    aut_t: 56, soc_t: 55, cnc_t: 50,
    tipoCaso: TipoCaso.IMPRESION_POSITIVA,
    semaforo: Semaforo.AMARILLO,
    observaciones: "POS elevado (9). Sesgo de impresion positiva. Revision con psicologo.",
    itemsCriticos: [
      { item: 15, categoria: "Peligro", texto: "Me meto en situaciones de peligro", respuesta: 5, etiquetaRespuesta: "Siempre o casi siempre" },
      { item: 88, categoria: "Peligro", texto: "Busco situaciones de riesgo", respuesta: 5, etiquetaRespuesta: "Siempre o casi siempre" },
    ],
  },

  // -------------------------------------------------------
  // CASO 4 — Impresion negativa | RPA1E | Mujer, 15 años
  // -------------------------------------------------------
  {
    id: "tam-4",
    fecha: new Date("2025-10-15"),
    estudianteId: "est-4",
    inc: 1.0, neg: 5, pos: 1,
    glo_t: 80, emo_t: 76, con_t: 68, eje_t: 84, ctx_t: 72, rec_t: 38,
    dep_t: 72, ans_t: 68, asc_t: 64, som_t: 85, pst_t: 70, obs_t: 66,
    ate_t: 75, hip_t: 72, ira_t: 85, agr_t: 78, des_t: 70, ant_t: 66,
    sus_t: 68, esq_t: 105, ali_t: 62,
    fam_t: 74, esc_t: 68, com_t: 70,
    reg_t: 86, bus_t: 62,
    aut_t: 38, soc_t: 42, cnc_t: 68,
    tipoCaso: TipoCaso.IMPRESION_NEGATIVA,
    semaforo: Semaforo.ROJO,
    observaciones: "NEG elevado (5) con indices muy altos. Atencion prioritaria independiente del sesgo.",
    itemsCriticos: [
      { item: 124, categoria: "Riesgo de autolesion", texto: "Quiero morirme", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 149, categoria: "Perdida de control", texto: "Siento que me estoy volviendo loco", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 119, categoria: "Alteraciones del pensamiento", texto: "Creo que otras personas pueden leer mis pensamientos", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
    ],
  },

  // -------------------------------------------------------
  // CASO 5 — Con riesgo | RPB1E | Mujer, 15 años
  // -------------------------------------------------------
  {
    id: "tam-5",
    fecha: new Date("2025-10-16"),
    estudianteId: "est-5",
    inc: 0.9, neg: 1, pos: 0,
    glo_t: 66, emo_t: 71, con_t: 54, eje_t: 61, ctx_t: 76, rec_t: 28,
    dep_t: 86, ans_t: 61, asc_t: 56, som_t: 64, pst_t: 69, obs_t: 61,
    ate_t: 55, hip_t: 55, ira_t: 58, agr_t: 57, des_t: 51, ant_t: 47,
    sus_t: 45, esq_t: 78, ali_t: 75,
    fam_t: 76, esc_t: 58, com_t: 71,
    reg_t: 67, bus_t: 58,
    aut_t: 25, soc_t: 38, cnc_t: 82,
    tipoCaso: TipoCaso.CON_RIESGO,
    semaforo: Semaforo.ROJO_URGENTE,
    observaciones: "Instrumento 100% confiable. Ideacion suicida activa, aislamiento severo, posible violencia en el hogar. ATENCION URGENTE.",
    itemsCriticos: [
      { item: 124, categoria: "Riesgo de autolesion", texto: "Quiero morirme", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 141, categoria: "Riesgo de autolesion", texto: "Pienso que mi vida no tiene sentido", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 86, categoria: "Estresores traumaticos", texto: "Me han pasado cosas horribles", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 118, categoria: "Peticion de ayuda", texto: "Hay cosas que van mal y necesitaria ayuda", respuesta: 5, etiquetaRespuesta: "Siempre o casi siempre" },
      { item: 145, categoria: "Peticion de ayuda", texto: "Lo estoy pasando mal y necesitaria que me ayudaran", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 119, categoria: "Alteraciones del pensamiento", texto: "Creo que otras personas pueden leer mis pensamientos", respuesta: 3, etiquetaRespuesta: "Algunas veces" },
      { item: 76, categoria: "Perdida de control", texto: "Siento que voy a perder el control", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 149, categoria: "Perdida de control", texto: "Siento que me estoy volviendo loco", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 19, categoria: "Riesgos familiares", texto: "Mis padres me pegan", respuesta: 2, etiquetaRespuesta: "Pocas veces" },
      { item: 96, categoria: "Acoso escolar", texto: "Me insultan por telefono o internet", respuesta: 3, etiquetaRespuesta: "Algunas veces" },
      { item: 163, categoria: "Acoso escolar", texto: "Me amenazan en el instituto", respuesta: 2, etiquetaRespuesta: "Pocas veces" },
      { item: 50, categoria: "Falta de apoyo social", texto: "Siento que a nadie le importa lo que hago", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 137, categoria: "Falta de apoyo social", texto: "Me siento solo", respuesta: 5, etiquetaRespuesta: "Siempre o casi siempre" },
      { item: 143, categoria: "Falta de apoyo social", texto: "Cuando tengo problemas, hay personas que me escuchan", respuesta: 2, etiquetaRespuesta: "Pocas veces" },
      { item: 53, categoria: "Imagen corporal", texto: "Creo que mi cuerpo es horrible", respuesta: 5, etiquetaRespuesta: "Siempre o casi siempre" },
      { item: 63, categoria: "Indicadores inespecificos", texto: "Me siento enfermo", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 104, categoria: "Indicadores inespecificos", texto: "Duermo mal", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
      { item: 75, categoria: "Culpa", texto: "Me siento culpable", respuesta: 5, etiquetaRespuesta: "Siempre o casi siempre" },
      { item: 126, categoria: "Culpa", texto: "Cometo errores imperdonables", respuesta: 4, etiquetaRespuesta: "Muchas veces" },
    ],
  },
]

const ESTUDIANTES: MockEstudiante[] = [
  {
    id: "est-1",
    nombre: "G. F. H.",
    edad: 14,
    sexo: Sexo.MASCULINO,
    grado: "2°",
    grupo: "A",
    escuela: "CECyTEN Plantel Tepic",
    tamizajes: [TAMIZAJES[0]],
    citas: [],
  },
  {
    id: "est-2",
    nombre: "G. R. A.",
    edad: 15,
    sexo: Sexo.FEMENINO,
    grado: "2°",
    grupo: "B",
    escuela: "CECyTEN Plantel Tepic",
    tamizajes: [TAMIZAJES[1]],
    citas: [],
  },
  {
    id: "est-3",
    nombre: "M. G. S.",
    edad: 15,
    sexo: Sexo.MASCULINO,
    grado: "3°",
    grupo: "A",
    escuela: "CECyTEN Plantel Tepic",
    tamizajes: [TAMIZAJES[2]],
    citas: [],
  },
  {
    id: "est-4",
    nombre: "R. P. A.",
    edad: 15,
    sexo: Sexo.FEMENINO,
    grado: "1°",
    grupo: "C",
    escuela: "CECyTEN Plantel Tepic",
    tamizajes: [TAMIZAJES[3]],
    citas: [
      {
        id: "cita-4",
        fecha: new Date("2025-10-17"),
        estado: EstadoCita.PENDIENTE,
        notas: "Atencion prioritaria por indices muy elevados.",
        estudianteId: "est-4",
      },
    ],
  },
  {
    id: "est-5",
    nombre: "R. P. B.",
    edad: 15,
    sexo: Sexo.FEMENINO,
    grado: "2°",
    grupo: "D",
    escuela: "CECyTEN Plantel Tepic",
    tamizajes: [TAMIZAJES[4]],
    citas: [
      {
        id: "cita-5",
        fecha: new Date("2025-10-16"),
        estado: EstadoCita.CONFIRMADA,
        notas: "URGENTE — Ideacion suicida activa. Atencion inmediata.",
        estudianteId: "est-5",
      },
    ],
  },
]

// =============================================
// QUERIES — misma interfaz que usaria Prisma
// =============================================

export function getEstudiantes(): MockEstudiante[] {
  return ESTUDIANTES
}

export function getEstudianteById(id: string): MockEstudiante | undefined {
  return ESTUDIANTES.find((e) => e.id === id)
}

export function getTamizajeById(id: string): MockTamizaje | undefined {
  return TAMIZAJES.find((t) => t.id === id)
}

export function getResumenSemaforos() {
  const conteo: Partial<Record<Semaforo, number>> = {}
  for (const t of TAMIZAJES) {
    conteo[t.semaforo] = (conteo[t.semaforo] ?? 0) + 1
  }
  return (Object.entries(conteo) as [Semaforo, number][]).map(
    ([semaforo, total]) => ({ semaforo, total })
  )
}

export function getResumenTiposCaso() {
  const conteo: Partial<Record<TipoCaso, number>> = {}
  for (const t of TAMIZAJES) {
    conteo[t.tipoCaso] = (conteo[t.tipoCaso] ?? 0) + 1
  }
  return (Object.entries(conteo) as [TipoCaso, number][]).map(
    ([tipoCaso, total]) => ({ tipoCaso, total })
  )
}

export function getTotalEstudiantes(): number {
  return ESTUDIANTES.length
}

export function getTotalUrgentes(): number {
  return TAMIZAJES.filter((t) => t.semaforo === Semaforo.ROJO_URGENTE).length
}
