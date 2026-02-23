export { Rol, Semaforo, TipoCaso, Sexo, EstadoCita } from "@/lib/enums"
import type { Rol, Semaforo, TipoCaso } from "@/lib/enums"
// lib/auth.ts y lib/db.ts siguen usando @prisma/client en el servidor

// Extiende el tipo de sesion de NextAuth para incluir el rol
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      rol: Rol
      estudianteId?: string | null
    }
  }

  interface User {
    rol: Rol
    estudianteId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol: Rol
    estudianteId?: string | null
  }
}

// Tipos de datos para el dashboard
export type DatoSemaforo = {
  semaforo: Semaforo
  _count: { semaforo: number }
}

export type DatoTipoCaso = {
  tipoCaso: TipoCaso
  _count: { tipoCaso: number }
}

// Item critico del SENA
export type ItemCritico = {
  item: number
  categoria: string
  texto: string
  respuesta: number
  etiquetaRespuesta: string
}

// Etiquetas de respuesta Likert
export const ETIQUETAS_LIKERT: Record<number, string> = {
  1: "Nunca o casi nunca",
  2: "Pocas veces",
  3: "Algunas veces",
  4: "Muchas veces",
  5: "Siempre o casi siempre",
}

// Colores del semaforo
export const COLORES_SEMAFORO: Record<Semaforo, string> = {
  VERDE: "#22c55e",
  AMARILLO: "#eab308",
  ROJO: "#ef4444",
  ROJO_URGENTE: "#7f1d1d",
}

// Labels del semaforo
export const LABELS_SEMAFORO: Record<Semaforo, string> = {
  VERDE: "Sin riesgo",
  AMARILLO: "Revision",
  ROJO: "Prioritario",
  ROJO_URGENTE: "URGENTE",
}

// Labels del tipo de caso
export const LABELS_TIPO_CASO: Record<TipoCaso, string> = {
  INCONSISTENCIA: "Inconsistencia",
  SIN_RIESGO: "Sin riesgo",
  IMPRESION_POSITIVA: "Impresion positiva",
  IMPRESION_NEGATIVA: "Impresion negativa",
  CON_RIESGO: "Con riesgo",
}
