/**
 * Datos mockeados — PsicoScan ML
 * Basados en los 5 casos tipo del documento Arranque.txt
 */

import { Semaforo, TipoCaso, Sexo, EstadoCita } from "@/lib/enums"
import { prisma } from "@/lib/db"

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
  inc: number
  neg: number
  pos: number
  glo_t: number
  emo_t: number
  con_t: number
  eje_t: number
  ctx_t: number
  rec_t: number
  dep_t: number
  ans_t: number
  asc_t: number
  som_t: number
  pst_t: number
  obs_t: number
  ate_t: number
  hip_t: number
  ira_t: number
  agr_t: number
  des_t: number
  ant_t: number
  sus_t: number
  esq_t: number
  ali_t: number
  fam_t: number
  esc_t: number
  com_t: number
  reg_t: number
  bus_t: number
  aut_t: number
  soc_t: number
  cnc_t: number
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
// QUERIES — leen de la base de datos real (Prisma)
// =============================================

const URGENCIA: Record<string, number> = {
  ROJO_URGENTE: 0,
  ROJO:         1,
  AMARILLO:     2,
  VERDE:        3,
}

export async function getEstudiantes(): Promise<MockEstudiante[]> {
  const rows = await prisma.estudiante.findMany({
    include: {
      tamizajes: { orderBy: { fecha: "desc" }, take: 1 },
      citas:     { orderBy: { fecha: "desc" } },
    },
  })

  // Ordenar: ROJO_URGENTE → ROJO → AMARILLO → VERDE,
  // dentro de cada nivel por fecha de tamizaje más reciente
  rows.sort((a, b) => {
    const semA = (a.tamizajes[0] as { semaforo?: string } | undefined)?.semaforo ?? "VERDE"
    const semB = (b.tamizajes[0] as { semaforo?: string } | undefined)?.semaforo ?? "VERDE"
    const ua = URGENCIA[semA] ?? 4
    const ub = URGENCIA[semB] ?? 4
    if (ua !== ub) return ua - ub
    const fa = (a.tamizajes[0] as { fecha?: Date } | undefined)?.fecha?.getTime() ?? 0
    const fb = (b.tamizajes[0] as { fecha?: Date } | undefined)?.fecha?.getTime() ?? 0
    return fb - fa  // más reciente primero
  })

  return rows as unknown as MockEstudiante[]
}

export async function getEstudianteById(id: string): Promise<MockEstudiante | undefined> {
  const row = await prisma.estudiante.findUnique({
    where: { id },
    include: {
      tamizajes: { orderBy: { fecha: "desc" } },
      citas:     { orderBy: { fecha: "desc" } },
    },
  })
  return (row ?? undefined) as unknown as MockEstudiante | undefined
}

export async function getTamizajeById(id: string): Promise<MockTamizaje | undefined> {
  const row = await prisma.tamizaje.findUnique({ where: { id } })
  return (row ?? undefined) as unknown as MockTamizaje | undefined
}

export async function getResumenSemaforos(): Promise<{ semaforo: Semaforo; total: number }[]> {
  const grupos = await prisma.tamizaje.groupBy({
    by: ["semaforo"],
    _count: { semaforo: true },
  })
  return grupos.map((g) => ({ semaforo: g.semaforo as Semaforo, total: g._count.semaforo }))
}

export async function getResumenTiposCaso(): Promise<{ tipoCaso: TipoCaso; total: number }[]> {
  const grupos = await prisma.tamizaje.groupBy({
    by: ["tipoCaso"],
    _count: { tipoCaso: true },
  })
  return grupos.map((g) => ({ tipoCaso: g.tipoCaso as TipoCaso, total: g._count.tipoCaso }))
}

export async function getTotalEstudiantes(): Promise<number> {
  return prisma.estudiante.count()
}

export async function getTotalUrgentes(): Promise<number> {
  return prisma.tamizaje.count({ where: { semaforo: "ROJO_URGENTE" } })
}
