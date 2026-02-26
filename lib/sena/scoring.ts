/**
 * lib/sena/scoring.ts
 * Motor de puntuación del SENA — Autoinforme Secundaria
 *
 * Escalas de validez/control:
 *   inc — Inconsistencia: 10 pares de ítems semánticamente similares.
 *          Puntuación = Σ|resp_a − resp_b|. Valores altos indican respuesta azarosa.
 *   neg — Impresión negativa: ítems con contenido extremo-patológico raramente
 *          endosados; puntuación alta sugiere exageración de síntomas.
 *   pos — Impresión positiva: ítems de ajuste excepcionalmente positivo;
 *          puntuación alta sugiere minimización de problemas.
 *
 * NOTA: Los pares INC y los ítems NEG/POS fueron derivados por análisis semántico
 * de los reactivos. Verificar contra el manual oficial TEA antes de uso clínico.
 */

// ─────────────────────────────────────────────
// ÍTEMS CRÍTICOS — siempre se revisan sin importar la escala
// Respuestas ≥ 3 en estos ítems activan alerta
// ─────────────────────────────────────────────
export const ITEMS_CRITICOS: Record<number, string> = {
  // Riesgo de autolesión / ideación suicida
  124: "Riesgo de autolesión",
  141: "Riesgo de autolesión",
  149: "Pérdida de control",
  76:  "Pérdida de control",

  // Petición de ayuda directa
  92:  "Petición de ayuda",
  118: "Petición de ayuda",
  145: "Petición de ayuda",

  // Violencia familiar
  19:  "Riesgo familiar",
  80:  "Riesgo familiar",
  125: "Riesgo familiar",

  // Violencia escolar / acoso
  37:  "Acoso escolar",
  96:  "Acoso / ciberbullying",
  115: "Acoso escolar",
  147: "Acoso escolar",
  163: "Acoso escolar",

  // Posible abuso
  71:  "Estresores traumáticos",
  21:  "Estresores traumáticos",
  86:  "Estresores traumáticos",
  97:  "Estresores traumáticos",

  // Síntomas psicóticos
  119: "Alteraciones del pensamiento",
  164: "Alteraciones del pensamiento",
  167: "Alteraciones del pensamiento",
  90:  "Alteraciones del pensamiento",

  // Imagen corporal grave
  88:  "Imagen corporal",
  130: "Imagen corporal",
}

// ─────────────────────────────────────────────
// ESCALA INC — pares de ítems semánticamente similares
// Puntuación = Σ |resp_a − resp_b|  (ver calcularResultado)
// ─────────────────────────────────────────────
export const INC_PAIRS: [number, number][] = [
  [4,   11],  // cansancio al despertar / sentirse cansado
  [9,   56],  // enfadarse con los demás / explotar
  [23,  89],  // gritar al enfadarse / perder el control al enfadarse
  [35, 129],  // preocupaciones duraderas / agobio de problemas
  [38, 162],  // sufrir mucho / estar triste
  [50, 137],  // nadie le importa / sentirse solo
  [65, 117],  // no atender cuando explican / dificultad concentrarse
  [77, 169],  // estar nervioso / preocuparse-agobiarse
  [83, 178],  // dar vueltas a las cosas / pensamientos repetitivos
  [100, 131], // le llaman por no parar de moverse / le dicen que no sabe estar quieto
]

// ─────────────────────────────────────────────
// MAPEO ÍTEMS → ESCALAS (puntuación bruta)
// ─────────────────────────────────────────────
export const ESCALAS: Record<string, { label: string; items: number[] }> = {
  // Escalas de validez/control
  // inc: calculada por INC_PAIRS (diferencias absolutas), no por suma
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
export type ItemCriticoDetectado = {
  item: number
  texto: string
  categoria: string
  respuesta: number
  etiqueta: string
}

export type ResultadoScoring = {
  itemsCriticos: ItemCriticoDetectado[]
  puntuacionesBrutas: Record<string, number>
  totalItemsAltos: number   // respuestas 4-5
  semaforo: "VERDE" | "AMARILLO" | "ROJO" | "ROJO_URGENTE"
  tipoCaso: string
  observaciones: string
}

const ETIQUETAS = ["", "Nunca o casi nunca", "Pocas veces", "Algunas veces", "Muchas veces", "Siempre o casi siempre"]

// ─────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────
export function calcularResultado(
  respuestas: number[],        // array de 188 valores (índice 0 = ítem 1)
  textos: string[],            // textos de los reactivos
): ResultadoScoring {

  // 1. Detectar ítems críticos (respuesta ≥ 3)
  const itemsCriticos: ItemCriticoDetectado[] = []
  for (const [itemStr, categoria] of Object.entries(ITEMS_CRITICOS)) {
    const item = Number(itemStr)
    const respuesta = respuestas[item - 1] ?? 0
    if (respuesta >= 3) {
      itemsCriticos.push({
        item,
        texto: textos[item - 1] ?? `Ítem ${item}`,
        categoria,
        respuesta,
        etiqueta: ETIQUETAS[respuesta] ?? "",
      })
    }
  }

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

  // INC: suma de diferencias absolutas entre pares semánticamente similares
  // (sobreescribe el 0 asignado arriba)
  puntuacionesBrutas['inc'] = INC_PAIRS.reduce((acc, [a, b]) => {
    return acc + Math.abs((respuestas[a - 1] ?? 0) - (respuestas[b - 1] ?? 0))
  }, 0)

  // 3. Contar ítems con respuesta alta (4-5) — indicador global
  const totalItemsAltos = respuestas.filter(r => r >= 4).length

  // 4. Clasificación básica por semáforo
  const tieneCriticosUrgentes = itemsCriticos.some(
    ic => [124, 141, 164, 119].includes(ic.item) && ic.respuesta >= 4
  )
  const tieneCriticosGraves = itemsCriticos.some(
    ic => [92, 118, 145, 71, 19, 80].includes(ic.item) && ic.respuesta >= 3
  )

  let semaforo: ResultadoScoring["semaforo"]
  let tipoCaso: string
  let observaciones: string

  if (tieneCriticosUrgentes || (itemsCriticos.length >= 8 && totalItemsAltos >= 30)) {
    semaforo = "ROJO_URGENTE"
    tipoCaso = "CON_RIESGO"
    observaciones = "Se detectaron indicadores de riesgo crítico. Atención URGENTE requerida."
  } else if (tieneCriticosGraves || (itemsCriticos.length >= 4 && totalItemsAltos >= 20)) {
    semaforo = "ROJO"
    tipoCaso = "CON_RIESGO"
    observaciones = "Se detectaron indicadores de riesgo. Programar atención con psicólogo."
  } else if (itemsCriticos.length >= 2 || totalItemsAltos >= 12) {
    semaforo = "AMARILLO"
    tipoCaso = "SEGUIMIENTO"
    observaciones = "Algunos indicadores requieren seguimiento preventivo."
  } else {
    semaforo = "VERDE"
    tipoCaso = "SIN_RIESGO"
    observaciones = "Sin indicadores de riesgo significativos."
  }

  return {
    itemsCriticos,
    puntuacionesBrutas,
    totalItemsAltos,
    semaforo,
    tipoCaso,
    observaciones,
  }
}
