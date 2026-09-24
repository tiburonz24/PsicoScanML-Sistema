/**
 * lib/sena/scoring.ts
 * Motor de puntuación del SENA — Autoinforme Secundaria
 *
 * Escalas de validez/control:
 *   inc — Inconsistencia: 20 pares de ítems semánticamente similares (15 directos
 *          + 5 con un ítem inverso/protector). Puntuación reportada = promedio de
 *          |resp_a − resp_b| por par (para los inversos, resp_b se transforma a
 *          6 − resp_b antes de restar). Valores altos indican respuesta azarosa.
 *   neg — Impresión negativa: ítems con contenido extremo-patológico raramente
 *          endosados; puntuación alta sugiere exageración de síntomas.
 *   pos — Impresión positiva: ítems de ajuste excepcionalmente positivo;
 *          puntuación alta sugiere minimización de problemas.
 *
 * NOTA: Los pares INC y los ítems NEG/POS fueron derivados por análisis semántico
 * de los reactivos. Verificar contra el manual oficial TEA antes de uso clínico.
 *
 * Informe de Ítems Críticos (IIC): en vez de un único umbral fijo (≥3) para
 * ~30 ítems sueltos, cada reactivo relevante se agrupa en una de 15 áreas
 * clínicas y se clasifica en tres clases con distinto criterio de activación:
 *   - centinela:  una sola respuesta ≥3 activa alerta individual.
 *   - relevante:  ≥4 activa individualmente; ≥3 solo si converge con otro
 *                 ítem de la misma área (evita sobre-alertar por un ítem aislado).
 *   - contextual: no se muestra de forma aislada, solo cuando el área entera
 *                 converge (varios ítems ≥3, o ≥4 en áreas más estrictas).
 * Los ítems "inverso" son protectores (autoestima, apoyo familiar/social): la
 * alerta se activa con respuesta BAJA (1–2), no alta — se evalúan internamente
 * como 6−respuesta para reutilizar la misma lógica de clases/umbrales.
 * Un nivel adicional (interacciones) eleva la prioridad cuando dos o más áreas
 * de riesgo se activan simultáneamente (p. ej. pérdida de control + agresión).
 */

// ─────────────────────────────────────────────
// ÁREAS DEL INFORME DE ÍTEMS CRÍTICOS
// ─────────────────────────────────────────────
export type ClaseItem = "centinela" | "relevante" | "contextual"

export type DefinicionItemCritico = {
  item: number
  clase: ClaseItem
  /** true = ítem protector; se evalúa como 6 − respuesta (alerta si la respuesta real es baja) */
  inverso?: boolean
}

export type AreaCritica = {
  id: string
  label: string
  /** 1 = prioridad clínica máxima (seguridad personal) */
  prioridad: 1 | 2 | 3
  items: DefinicionItemCritico[]
  /** umbral de convergencia del área; por defecto 2 ítems con valor ≥ 3 */
  convergencia?: { minItems: number; minRespuesta: number }
}

const it = (item: number, clase: ClaseItem = "relevante", inverso = false): DefinicionItemCritico =>
  ({ item, clase, ...(inverso ? { inverso } : {}) })

export const AREAS_CRITICAS: AreaCritica[] = [
  {
    id: "autolesion", label: "Riesgo de autolesión / seguridad personal", prioridad: 1,
    items: [
      it(124, "centinela"), it(141, "centinela"),
      it(145, "relevante"),
      it(162, "contextual"), it(85, "contextual"),
    ],
  },
  {
    id: "agresion", label: "Riesgo de agresión o daño a otros", prioridad: 1,
    items: [
      it(103, "centinela"), it(113, "centinela"), it(139, "centinela"),
      it(59, "relevante"), it(120, "relevante"), it(168, "relevante"),
      it(173, "relevante"), it(176, "relevante"),
    ],
  },
  {
    id: "perdida_control", label: "Sensación de pérdida de control", prioridad: 1,
    items: [
      it(76, "centinela"), it(89, "centinela"),
      it(56, "relevante"), it(69, "relevante"), it(114, "relevante"),
      it(135, "relevante"), it(171, "relevante"),
    ],
  },
  {
    id: "alteraciones_pensamiento", label: "Alteraciones del pensamiento / percepción", prioridad: 1,
    items: [
      it(119, "centinela"), it(164, "centinela"),
      it(90, "relevante"), it(122, "relevante"), it(128, "relevante"),
      it(149, "relevante"), it(167, "relevante"), it(175, "relevante"),
    ],
  },
  {
    id: "acoso_escolar", label: "Acoso escolar", prioridad: 2,
    items: [
      it(37, "centinela"), it(147, "centinela"), it(163, "centinela"),
      it(24, "relevante"), it(73, "relevante"), it(96, "relevante"),
      it(115, "relevante"), it(182, "relevante"),
    ],
  },
  {
    id: "riesgo_familiar", label: "Riesgos en el entorno familiar", prioridad: 1,
    items: [
      it(19, "centinela"),
      it(40, "relevante"), it(80, "relevante"), it(99, "relevante"), it(125, "relevante"),
      // protectores: alerta si la percepción de apoyo familiar es baja (1–2)
      it(134, "centinela", true), it(181, "centinela", true), it(186, "centinela", true),
    ],
  },
  {
    id: "sustancias", label: "Abuso / riesgo de consumo de sustancias", prioridad: 2,
    items: [
      it(55, "centinela"), it(74, "centinela"), it(142, "centinela"), it(159, "centinela"),
      it(94, "contextual"), it(106, "contextual"),
    ],
  },
  {
    id: "antisocial", label: "Riesgo de conducta antisocial", prioridad: 2,
    items: [
      it(109, "centinela"), it(136, "centinela"), it(160, "centinela"),
      it(25, "relevante"), it(41, "relevante"), it(70, "relevante"),
      it(102, "relevante"), it(127, "relevante"), it(180, "relevante"),
    ],
  },
  {
    id: "estresores_traumaticos", label: "Estresores / experiencias potencialmente traumáticas", prioridad: 1,
    items: [
      it(21, "contextual"), it(26, "contextual"), it(42, "contextual"),
      it(86, "contextual"), it(97, "contextual"), it(128, "contextual"),
    ],
  },
  {
    id: "imagen_corporal", label: "Riesgo de imagen corporal y conducta alimentaria", prioridad: 2,
    items: [
      it(130, "centinela"),
      it(152, "relevante"), it(177, "relevante"),
      it(16, "contextual"), it(20, "contextual"), it(53, "contextual"), it(61, "contextual"), it(88, "contextual"),
    ],
  },
  {
    id: "peligro_alerta", label: "Sensación de peligro y alerta", prioridad: 1,
    items: [
      it(71, "centinela"), it(140, "centinela"),
      it(90, "relevante"), it(170, "relevante"),
    ],
  },
  {
    id: "peticion_ayuda", label: "Petición de ayuda", prioridad: 1,
    items: [
      it(92, "centinela"), it(118, "centinela"), it(145, "centinela"),
      it(156, "relevante"),
    ],
  },
  {
    id: "apoyo_social", label: "Falta de apoyo social", prioridad: 2,
    items: [
      it(50, "relevante"), it(137, "relevante"),
      it(24, "contextual"),
      // protectores: alerta si la percepción de apoyo/pertenencia es baja (1–2)
      it(143, "centinela", true), it(188, "centinela", true),
      it(134, "centinela", true), it(186, "centinela", true),
    ],
  },
  {
    id: "culpa", label: "Sentimiento de culpa / autovaloración negativa", prioridad: 3,
    items: [it(27, "relevante"), it(75, "relevante"), it(126, "relevante"), it(153, "relevante")],
  },
  {
    id: "indicadores_inespecificos", label: "Indicadores inespecíficos de malestar", prioridad: 3,
    convergencia: { minItems: 3, minRespuesta: 4 },
    items: [
      it(4, "contextual"), it(11, "contextual"), it(14, "contextual"), it(34, "contextual"),
      it(38, "contextual"), it(58, "contextual"), it(63, "contextual"), it(82, "contextual"),
      it(83, "contextual"), it(111, "contextual"), it(129, "contextual"), it(162, "contextual"),
      it(169, "contextual"),
    ],
  },
]

// Nivel 5: combinaciones de áreas que elevan la prioridad clínica aunque
// ninguna alcance por sí sola el umbral de urgencia.
export type Interaccion = { id: string; label: string; descripcion: string; areas: string[] }

export const INTERACCIONES: Interaccion[] = [
  {
    id: "control_agresion", label: "Pérdida de control + agresión",
    descripcion: "La combinación de pérdida de control emocional y conductas agresivas eleva el riesgo de daño a terceros.",
    areas: ["perdida_control", "agresion"],
  },
  {
    id: "trauma_peligro", label: "Estresores traumáticos + sensación de peligro",
    descripcion: "Experiencias adversas junto con hipervigilancia o sensación de peligro sugieren posible trauma no resuelto.",
    areas: ["estresores_traumaticos", "peligro_alerta"],
  },
  {
    id: "malestar_ayuda_apoyo", label: "Malestar emocional + petición de ayuda + escaso apoyo",
    descripcion: "Malestar significativo con petición explícita de ayuda y percepción de bajo apoyo social/familiar requiere atención prioritaria.",
    areas: ["autolesion", "peticion_ayuda", "apoyo_social"],
  },
  {
    id: "acoso_aislamiento", label: "Victimización escolar + aislamiento",
    descripcion: "Acoso escolar junto con aislamiento social dificulta la búsqueda de ayuda por cuenta propia.",
    areas: ["acoso_escolar", "apoyo_social"],
  },
  {
    id: "familia_peligro", label: "Problemas familiares + sensación de peligro",
    descripcion: "Conflicto familiar junto con sensación de peligro justifica valorar la seguridad en el entorno doméstico.",
    areas: ["riesgo_familiar", "peligro_alerta"],
  },
]

// ─────────────────────────────────────────────
// ESCALA INC — 20 pares de ítems semánticamente similares
// (15 directos + 5 con un ítem inverso/protector)
// ─────────────────────────────────────────────
export type ParInconsistencia = { a: number; b: number; inverso?: boolean }

export const INC_PAIRS: ParInconsistencia[] = [
  { a: 8, b: 117 },
  { a: 39, b: 65 },
  { a: 31, b: 183 },
  { a: 3, b: 131 },
  { a: 47, b: 154 },
  { a: 56, b: 89 },
  { a: 35, b: 169 },
  { a: 52, b: 133 },
  { a: 11, b: 58 },
  { a: 145, b: 118 },
  { a: 60, b: 116 },
  { a: 53, b: 61 },
  { a: 33, b: 81 },
  { a: 15, b: 187 },
  { a: 7, b: 93 },
  { a: 29, b: 153, inverso: true },
  { a: 2, b: 87, inverso: true },
  { a: 93, b: 24, inverso: true },
  { a: 134, b: 40, inverso: true },
  { a: 181, b: 125, inverso: true },
]

export type ResultadoInconsistencia = {
  detalle: { a: number; b: number; diferencia: number; semaforo: "🟢" | "🟡" | "🟠" | "🔴" }[]
  sumaDiferencias: number
  /** promedio de |diferencia| por par — escala 0-4, comparable al umbral fijo usado en la UI */
  promedio: number
  /** % de pares con diferencia ≥ 3 — Índice Auxiliar de Inconsistencia */
  iai: number
  discrepanciasMarcadas: number
}

export function calcularInconsistencia(respuestas: number[]): ResultadoInconsistencia {
  const detalle = INC_PAIRS.map(({ a, b, inverso }) => {
    const ra = respuestas[a - 1] ?? 0
    const rbRaw = respuestas[b - 1] ?? 0
    const rb = inverso ? 6 - rbRaw : rbRaw
    const diferencia = Math.abs(ra - rb)
    const semaforo = diferencia <= 1 ? "🟢" : diferencia === 2 ? "🟡" : diferencia === 3 ? "🟠" : "🔴"
    return { a, b, diferencia, semaforo } as const
  })
  const sumaDiferencias = detalle.reduce((acc, d) => acc + d.diferencia, 0)
  const promedio = parseFloat((sumaDiferencias / detalle.length).toFixed(2))
  const paresInconsistentes = detalle.filter(d => d.diferencia >= 3).length
  const iai = parseFloat(((paresInconsistentes / detalle.length) * 100).toFixed(1))
  const discrepanciasMarcadas = detalle.filter(d => d.diferencia === 4).length
  return { detalle, sumaDiferencias, promedio, iai, discrepanciasMarcadas }
}

// ─────────────────────────────────────────────
// MAPEO ÍTEMS → ESCALAS (puntuación bruta)
// ─────────────────────────────────────────────
export const ESCALAS: Record<string, { label: string; items: number[] }> = {
  // Escalas de validez/control
  // inc: calculada por calcularInconsistencia (no por suma de items)
  inc: { label: "Inconsistencia",     items: [] },
  // neg: ítems con contenido extremo-patológico raramente endosado
  neg: { label: "Impresión negativa", items: [45, 79, 90, 95, 105, 116, 119, 122, 126, 146, 157, 166, 167] },
  // pos: ítems de ajuste excepcionalmente positivo
  pos: { label: "Impresión positiva", items: [1, 2, 7, 15, 29, 33, 54, 81, 93, 107, 143, 172, 179, 186, 187, 188] },

  // Problemas emocionales
  dep: { label: "Depresión",              items: [4, 11, 14, 27, 38, 50, 58, 75, 82, 84, 85, 111, 137, 141, 153, 162] },
  ans: { label: "Ansiedad",               items: [5, 10, 30, 34, 35, 43, 77, 83, 98, 112, 129, 132, 169, 170] },
  asc: { label: "Ansiedad social",        items: [6, 30, 52, 64, 98, 110, 133] },
  som: { label: "Somatización",           items: [4, 11, 18, 48, 58, 63, 79, 121, 144, 165] },
  pst: { label: "Estrés postraumático",   items: [21, 26, 42, 71, 86, 97, 128, 140] },
  obs: { label: "Obsesivo-compulsivo",    items: [44, 66, 101, 108, 151, 178, 184] },

  // Problemas conductuales
  ate: { label: "Inatención",             items: [8, 12, 31, 39, 65, 91, 117, 150, 155, 183] },
  hip: { label: "Hiperactividad",         items: [3, 13, 28, 47, 67, 100, 131, 154, 161, 185] },
  ira: { label: "Ira / irritabilidad",    items: [9, 23, 34, 51, 56, 69, 89, 114, 135, 148, 171, 176] },
  agr: { label: "Agresión",              items: [9, 23, 49, 59, 78, 89, 103, 113, 120, 139, 168] },
  des: { label: "Conducta desafiante",   items: [62, 68, 87, 102, 127, 138, 158, 174] },
  ant: { label: "Conducta antisocial",   items: [25, 41, 49, 70, 78, 109, 160, 168, 173, 180] },

  // Otros problemas
  sus: { label: "Consumo de sustancias", items: [55, 74, 94, 106, 142, 159] },
  esq: { label: "Esquizotipia",          items: [79, 90, 119, 122, 128, 149, 164, 167, 175] },
  ali: { label: "Problemas alimentarios",items: [16, 20, 53, 61, 88, 130, 152, 177] },

  // Contextuales
  fam: { label: "Problemas familiares",  items: [19, 40, 80, 99, 125, 134, 181] },
  esc: { label: "Problemas escolares",   items: [36, 57, 72, 73, 123, 138, 174] },
  com: { label: "Problemas comunitarios",items: [24, 54, 107, 143, 172] },

  // Recursos personales
  aut: { label: "Autoestima",            items: [1, 7, 15, 29, 81, 93, 179, 186, 187] },
  soc: { label: "Integración social",    items: [7, 33, 54, 81, 93, 107, 143, 172, 188] },
  cnc: { label: "Conciencia de cambio",  items: [32, 46, 68, 156] },
}

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
export type NivelAlerta = "prioritaria" | "importante" | "alerta" | "seguimiento"
export type CriterioActivacion = "centinela" | "proteccion_ausente" | "intensidad" | "convergencia"

export type ItemCriticoDetectado = {
  item: number
  texto: string
  /** nombre del área (se mantiene el campo "categoria" por compatibilidad con la UI existente) */
  categoria: string
  areaId: string
  clase: ClaseItem
  respuesta: number
  etiqueta: string
  nivelAlerta: NivelAlerta
  criterio: CriterioActivacion
}

export type AreaActivada = {
  areaId: string
  label: string
  prioridad: 1 | 2 | 3
  activada: boolean
  itemsActivados: ItemCriticoDetectado[]
}

export type InteraccionActivada = Interaccion

export type ResultadoScoring = {
  itemsCriticos: ItemCriticoDetectado[]
  areasActivadas: AreaActivada[]
  interaccionesActivadas: InteraccionActivada[]
  consistencia: ResultadoInconsistencia
  puntuacionesBrutas: Record<string, number>
  totalItemsAltos: number   // respuestas 4-5
  semaforo: "VERDE" | "AMARILLO" | "ROJO" | "ROJO_URGENTE"
  tipoCaso: string
  observaciones: string
}

const ETIQUETAS = ["", "Nunca o casi nunca", "Pocas veces", "Algunas veces", "Muchas veces", "Siempre o casi siempre"]

function nivelDe(clase: ClaseItem, valor: number, prioridad: 1 | 2 | 3): NivelAlerta {
  if (prioridad === 1) return valor >= 4 ? "prioritaria" : "importante"
  if (clase === "centinela") return valor >= 4 ? "importante" : "alerta"
  if (clase === "relevante") return valor >= 4 ? "alerta" : "seguimiento"
  return "seguimiento"
}

function evaluarArea(area: AreaCritica, respuestas: number[], textos: string[]): AreaActivada {
  const conv = area.convergencia ?? { minItems: 2, minRespuesta: 3 }

  const evaluados = area.items
    .map(def => {
      const respuesta = respuestas[def.item - 1] ?? 0
      const valor = def.inverso ? 6 - respuesta : respuesta
      return { def, respuesta, valor }
    })
    .filter(e => e.respuesta >= 1)

  const hayConvergencia = evaluados.filter(e => e.valor >= conv.minRespuesta).length >= conv.minItems

  const itemsActivados: ItemCriticoDetectado[] = []
  for (const { def, respuesta, valor } of evaluados) {
    let criterio: CriterioActivacion | null = null

    if (def.clase === "centinela" && valor >= 3) {
      criterio = def.inverso ? "proteccion_ausente" : "centinela"
    } else if (def.clase === "relevante" && valor >= 4) {
      criterio = "intensidad"
    } else if (def.clase === "relevante" && valor === 3 && hayConvergencia) {
      criterio = "convergencia"
    } else if (def.clase === "contextual" && hayConvergencia && valor >= conv.minRespuesta) {
      criterio = "convergencia"
    }

    if (criterio) {
      itemsActivados.push({
        item: def.item,
        texto: textos[def.item - 1] ?? `Ítem ${def.item}`,
        categoria: area.label,
        areaId: area.id,
        clase: def.clase,
        respuesta,
        etiqueta: ETIQUETAS[respuesta] ?? "",
        nivelAlerta: nivelDe(def.clase, valor, area.prioridad),
        criterio,
      })
    }
  }

  return {
    areaId: area.id,
    label: area.label,
    prioridad: area.prioridad,
    activada: itemsActivados.length > 0,
    itemsActivados,
  }
}

// ─────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────
export function calcularResultado(
  respuestas: number[],        // array de 188 valores (índice 0 = ítem 1)
  textos: string[],            // textos de los reactivos
): ResultadoScoring {

  // 1. Informe de Ítems Críticos: evaluar las 15 áreas y sus interacciones
  const areasActivadas = AREAS_CRITICAS.map(area => evaluarArea(area, respuestas, textos))
  const itemsCriticos = areasActivadas.flatMap(a => a.itemsActivados)
  const interaccionesActivadas = INTERACCIONES.filter(inter =>
    inter.areas.every(id => areasActivadas.find(a => a.areaId === id)?.activada)
  )

  // 2. Puntuaciones brutas por escala (suma de ítems)
  const puntuacionesBrutas: Record<string, number> = {}
  for (const [escala, { items }] of Object.entries(ESCALAS)) {
    if (items.length === 0) {
      puntuacionesBrutas[escala] = 0
      continue
    }
    const suma = items.reduce((acc, item) => acc + (respuestas[item - 1] ?? 0), 0)
    puntuacionesBrutas[escala] = suma
  }

  // INC: promedio de diferencias absolutas entre pares semánticamente similares
  // (sobreescribe el 0 asignado arriba; ver calcularInconsistencia para el detalle)
  const consistencia = calcularInconsistencia(respuestas)
  puntuacionesBrutas['inc'] = consistencia.promedio

  // 3. Contar ítems con respuesta alta (4-5) — indicador global
  const totalItemsAltos = respuestas.filter(r => r >= 4).length

  // 4. Clasificación por semáforo
  const areaAutolesion = areasActivadas.find(a => a.areaId === "autolesion")
  const numAreasActivadas = areasActivadas.filter(a => a.activada).length
  const tieneCentinelaGrave = itemsCriticos.some(
    ic => ic.nivelAlerta === "prioritaria" && ic.areaId !== "autolesion"
  )

  let semaforo: ResultadoScoring["semaforo"]
  let tipoCaso: string
  let observaciones: string

  if (areaAutolesion?.activada || interaccionesActivadas.length > 0) {
    semaforo = "ROJO_URGENTE"
    tipoCaso = "CON_RIESGO"
    observaciones = "Se detectaron indicadores de riesgo crítico (seguridad personal y/o combinación de factores de alto riesgo). Atención URGENTE requerida."
  } else if (tieneCentinelaGrave || numAreasActivadas >= 3) {
    semaforo = "ROJO"
    tipoCaso = "CON_RIESGO"
    observaciones = "Se detectaron indicadores de riesgo en múltiples áreas. Programar atención con psicólogo."
  } else if (consistencia.iai > 30) {
    semaforo = "AMARILLO"
    tipoCaso = "INCONSISTENCIA"
    observaciones = `Alta inconsistencia en las respuestas (IAI ${consistencia.iai.toFixed(0)}%). Interpretar el protocolo con cautela; considerar reaplicación.`
  } else if (numAreasActivadas >= 1 || totalItemsAltos >= 12) {
    semaforo = "AMARILLO"
    tipoCaso = "SIN_RIESGO"
    observaciones = "Seguimiento preventivo recomendado. Algunos indicadores requieren monitoreo."
  } else {
    semaforo = "VERDE"
    tipoCaso = "SIN_RIESGO"
    observaciones = "Sin indicadores de riesgo significativos."
  }

  return {
    itemsCriticos,
    areasActivadas,
    interaccionesActivadas,
    consistencia,
    puntuacionesBrutas,
    totalItemsAltos,
    semaforo,
    tipoCaso,
    observaciones,
  }
}

// ─────────────────────────────────────────────
// PRIORIDAD DENTRO DEL SEMÁFORO — desempate clínico entre casos del mismo
// nivel (ej. varios ROJO_URGENTE): quién se atiende primero.
// Criterio operativo provisional (no un baremo oficial), basado en:
//   - ideación de muerte explícita (ítem 124) > pérdida de sentido vital (141)
//     > área de seguridad personal activada por otro ítem (145/162/85)
//   - número de interacciones de nivel 5 activadas (combinaciones de áreas)
//   - número total de áreas activadas
// Solo requiere { item, respuesta } de cada ítem crítico ya guardado — no
// depende de que el registro tenga los campos nuevos (areaId/clase/etc.),
// así que funciona igual con tamizajes guardados antes de este cambio.
// ─────────────────────────────────────────────
export type NivelPrioridad = "maxima" | "alta" | "media" | "estandar"

export type PrioridadUrgencia = {
  score: number
  nivel: NivelPrioridad
  etiqueta: string
  motivo: string
}

const NIVEL_PRIORIDAD_ETIQUETA: Record<NivelPrioridad, string> = {
  maxima: "🔴🔴🔴 Máxima",
  alta: "🔴🔴 Alta",
  media: "🔴 Media",
  estandar: "Estándar",
}

/** Extrae de forma segura los pares {item, respuesta} de un JSON guardado en `Tamizaje.itemsCriticos`. */
export function extraerItemsCriticos(json: unknown): { item: number; respuesta: number }[] {
  if (!Array.isArray(json)) return []
  return json.filter(
    (x): x is { item: number; respuesta: number } =>
      typeof x === "object" && x !== null &&
      typeof (x as Record<string, unknown>).item === "number" &&
      typeof (x as Record<string, unknown>).respuesta === "number"
  )
}

export function calcularPrioridad(itemsCriticos: { item: number; respuesta: number }[]): PrioridadUrgencia {
  const itemsMap = new Map(itemsCriticos.map(ic => [ic.item, ic.respuesta]))

  const areasActivas = new Set<string>()
  for (const area of AREAS_CRITICAS) {
    if (area.items.some(def => itemsMap.has(def.item))) areasActivas.add(area.id)
  }
  const interacciones = INTERACCIONES.filter(inter => inter.areas.every(id => areasActivas.has(id)))

  const r124 = itemsMap.get(124)
  const r141 = itemsMap.get(141)

  let score = 0
  const motivos: string[] = []

  if (r124 !== undefined && r124 >= 4) {
    score += 100
    motivos.push("Ideación de muerte explícita (ítem 124)")
  } else if (r124 !== undefined) {
    score += 80
    motivos.push("Ideación de muerte (ítem 124)")
  } else if (r141 !== undefined && r141 >= 4) {
    score += 80
    motivos.push("Pérdida de sentido vital marcada (ítem 141)")
  } else if (r141 !== undefined) {
    score += 65
    motivos.push("Pérdida de sentido vital (ítem 141)")
  } else if (areasActivas.has("autolesion")) {
    score += 40
    motivos.push("Área de seguridad personal activada")
  }

  if (interacciones.length > 0) {
    score += interacciones.length * 20
    motivos.push(
      `${interacciones.length} ${interacciones.length > 1 ? "combinaciones" : "combinación"} de riesgo (${interacciones.map(i => i.label).join(", ")})`
    )
  }

  score += areasActivas.size * 3

  let nivel: NivelPrioridad
  if (score >= 90) nivel = "maxima"
  else if (score >= 50) nivel = "alta"
  else if (score >= 20) nivel = "media"
  else nivel = "estandar"

  return {
    score,
    nivel,
    etiqueta: NIVEL_PRIORIDAD_ETIQUETA[nivel],
    motivo: motivos.length > 0 ? motivos.join(" · ") : "Sin factores adicionales detectados",
  }
}
