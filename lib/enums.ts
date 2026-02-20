// Enums independientes de Prisma — seguros para usar en componentes cliente

export const Semaforo = {
  VERDE: "VERDE",
  AMARILLO: "AMARILLO",
  ROJO: "ROJO",
  ROJO_URGENTE: "ROJO_URGENTE",
} as const
export type Semaforo = (typeof Semaforo)[keyof typeof Semaforo]

export const TipoCaso = {
  INCONSISTENCIA: "INCONSISTENCIA",
  SIN_RIESGO: "SIN_RIESGO",
  IMPRESION_POSITIVA: "IMPRESION_POSITIVA",
  IMPRESION_NEGATIVA: "IMPRESION_NEGATIVA",
  CON_RIESGO: "CON_RIESGO",
} as const
export type TipoCaso = (typeof TipoCaso)[keyof typeof TipoCaso]

export const Rol = {
  ESTUDIANTE: "ESTUDIANTE",
  PSICOLOGO: "PSICOLOGO",
  ORIENTADOR: "ORIENTADOR",
  DIRECTOR: "DIRECTOR",
  ADMIN: "ADMIN",
} as const
export type Rol = (typeof Rol)[keyof typeof Rol]

export const Sexo = {
  MASCULINO: "MASCULINO",
  FEMENINO: "FEMENINO",
  OTRO: "OTRO",
} as const
export type Sexo = (typeof Sexo)[keyof typeof Sexo]

export const EstadoCita = {
  PENDIENTE: "PENDIENTE",
  CONFIRMADA: "CONFIRMADA",
  COMPLETADA: "COMPLETADA",
  CANCELADA: "CANCELADA",
} as const
export type EstadoCita = (typeof EstadoCita)[keyof typeof EstadoCita]
