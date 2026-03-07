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

export const EstadoExpediente = {
  ACTIVO:    "ACTIVO",
  CERRADO:   "CERRADO",
  DERIVADO:  "DERIVADO",
  EN_ESPERA: "EN_ESPERA",
} as const
export type EstadoExpediente = (typeof EstadoExpediente)[keyof typeof EstadoExpediente]

export const TipoSesion = {
  EVALUACION_INICIAL: "EVALUACION_INICIAL",
  SEGUIMIENTO:        "SEGUIMIENTO",
  INTERVENCION:       "INTERVENCION",
  CRISIS:             "CRISIS",
  CIERRE:             "CIERRE",
  DEVOLUCION:         "DEVOLUCION",
} as const
export type TipoSesion = (typeof TipoSesion)[keyof typeof TipoSesion]

export const TipoContacto = {
  LLAMADA:             "LLAMADA",
  MENSAJE_TEXTO:       "MENSAJE_TEXTO",
  CONTACTO_POR_ALUMNO: "CONTACTO_POR_ALUMNO",
  CITA_PADRES:         "CITA_PADRES",
} as const
export type TipoContacto = (typeof TipoContacto)[keyof typeof TipoContacto]

export const ResultadoContacto = {
  CONTESTO:       "CONTESTO",
  NO_CONTESTO:    "NO_CONTESTO",
  MENSAJE_ENVIADO:"MENSAJE_ENVIADO",
  SIN_RESPUESTA:  "SIN_RESPUESTA",
  ACUDIO:         "ACUDIO",
  NO_ACUDIO:      "NO_ACUDIO",
} as const
export type ResultadoContacto = (typeof ResultadoContacto)[keyof typeof ResultadoContacto]

export const TipoInstitucion = {
  PUBLICA:  "PUBLICA",
  PRIVADA:  "PRIVADA",
} as const
export type TipoInstitucion = (typeof TipoInstitucion)[keyof typeof TipoInstitucion]

export const EstadoCanalizacion = {
  PENDIENTE:       "PENDIENTE",
  EN_PROCESO:      "EN_PROCESO",
  COMPLETADA:      "COMPLETADA",
  SIN_SEGUIMIENTO: "SIN_SEGUIMIENTO",
} as const
export type EstadoCanalizacion = (typeof EstadoCanalizacion)[keyof typeof EstadoCanalizacion]
