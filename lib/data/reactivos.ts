/**
 * lib/data/reactivos.ts
 * Reactivos del SENA Autoinorme Secundaria (188 ítems)
 * TODO: Reemplazar cada texto con el reactivo real del cuestionario
 */

export type Reactivo = {
  id: number   // 1 – 188
  texto: string
}

// Placeholder — reemplazar con los textos reales del SENA cuando estén disponibles
export const REACTIVOS: Reactivo[] = Array.from({ length: 188 }, (_, i) => ({
  id: i + 1,
  texto: `Reactivo ${i + 1}`,   // TODO: texto real aquí
}))

// 6 páginas tal como el cuestionario físico impreso
export const PAGINAS_REACTIVOS: Reactivo[][] = [
  REACTIVOS.slice(0, 32),    // Página 1: ítems 1–32
  REACTIVOS.slice(32, 64),   // Página 2: ítems 33–64
  REACTIVOS.slice(64, 96),   // Página 3: ítems 65–96
  REACTIVOS.slice(96, 128),  // Página 4: ítems 97–128
  REACTIVOS.slice(128, 160), // Página 5: ítems 129–160
  REACTIVOS.slice(160, 188), // Página 6: ítems 161–188
]

export const TOTAL_REACTIVOS = 188
export const TOTAL_PAGINAS = PAGINAS_REACTIVOS.length

export const ESCALA_LABELS: Record<number, string> = {
  1: "Nunca o casi nunca",
  2: "Pocas veces",
  3: "Algunas veces",
  4: "Muchas veces",
  5: "Siempre o casi siempre",
}
