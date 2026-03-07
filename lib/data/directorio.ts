export type InstitucionDirectorio = {
  nombre:       string
  responsable?: string
  direccion:    string
  telefono?:    string
  horario?:     string
  atencion:     string
  costo?:       string
  tipo:         "PUBLICA" | "PRIVADA"
  urgente?:     boolean  // recomendada para casos urgentes
}

export const DIRECTORIO_CANALIZACIONES: InstitucionDirectorio[] = [
  // ── PÚBLICAS ─────────────────────────────────────────────────────────────
  {
    tipo:        "PUBLICA",
    nombre:      "CECOSAMA TEPIC",
    responsable: "Dr. Lenin David Vallarta Duarte",
    direccion:   "Av. Aguamilpa #333 B, esquina con Niño Obrero, Cd. Industrial",
    telefono:    "311 181 7752",
    horario:     "8:00 – 15:00",
    atencion:    "Prevención de adicciones y depresión",
  },
  {
    tipo:        "PUBLICA",
    nombre:      "CESAME TEPIC",
    responsable: "Lic. Zinthia Del Rayo Martínez Velázquez",
    direccion:   "Calle 21 de Marzo S/N esquina Av. Insurgentes",
    atencion:    "Trastornos mentales",
  },
  {
    tipo:        "PUBLICA",
    urgente:     true,
    nombre:      "Centro de Integración Juvenil",
    responsable: "Dr. Héctor Manuel Rentería Gómez",
    direccion:   "Cd. Industrial, a espaldas del Museo Interactivo",
    telefono:    "311 217 1758",
    horario:     "8:00 – 15:30",
    atencion:    "Todo tipo de casos",
  },
  {
    tipo:        "PUBLICA",
    nombre:      "PANNAR",
    responsable: "C. Mayra Carolina Hernández Parra (Coordinadora)",
    direccion:   "Rayón #86, Col. Acayapan",
    telefono:    "311 212 6251 / 311 395 5542",
    horario:     "8:30 – 15:00",
    costo:       "$30 pesos",
    atencion:    "Psicología, autismo, modificación conductual / preventivo. Capacitación a escuelas",
  },
  {
    tipo:        "PUBLICA",
    nombre:      "INMUNAY Municipal",
    responsable: "Mtra. Magaly Ramírez Hermosillo (Directora)",
    direccion:   "Luis G. Urbina, Col. Amado Nervo (costado del Mercado del Mar)",
    telefono:    "311 160 4002",
    horario:     "8:00 – 13:00 y 15:00 – 19:00",
    atencion:    "Violencia y cualquier caso",
  },
  {
    tipo:        "PUBLICA",
    nombre:      "INMUNAY Estatal (Instituto de la Mujer Nayarita)",
    responsable: "Lic. Margarita Morán Flores (Directora General)",
    direccion:   "Av. México #191 Sur, esq. Insurgentes",
    telefono:    "311 217 6515",
    horario:     "9:00 – 15:00 y 17:00 – 19:00",
    atencion:    "Violencia y cualquier caso",
  },
  {
    tipo:        "PUBLICA",
    nombre:      "DIF Nayarit Estatal — Duelos",
    responsable: "Dra. Irlanda Xiomara Gómez Valtierra / At'n Ma. De La Luz Casillas",
    direccion:   "Blvd. Luis Donaldo Colosio #93, Col. Ciudad Industrial",
    atencion:    "Exclusivamente duelos (Programa \"Recuerdos de Alegría\")",
  },
  {
    tipo:        "PUBLICA",
    nombre:      "DIF Nayarit Estatal — General",
    responsable: "Dra. Irlanda Xiomara Gómez Valtierra",
    direccion:   "Blvd. Luis Donaldo Colosio #93, Col. Ciudad Industrial",
    atencion:    "Atención psicológica en general",
  },
  {
    tipo:        "PUBLICA",
    nombre:      "DIF Municipal",
    responsable: "Lic. Gisele Ponce Méndez",
    direccion:   "Blvd. Luis Donaldo Colosio #1094, Fracc. Jacarandas",
    atencion:    "Atención psicológica en general",
  },

  // ── PRIVADAS ─────────────────────────────────────────────────────────────
  {
    tipo:        "PRIVADA",
    nombre:      "Serendipia",
    responsable: "Psic. Lidia Patricia Rodríguez Guardado",
    direccion:   "Málaga #35 B, Cd. Del Valle",
    telefono:    "311 107 9721",
    costo:       "$250 (solicitar consulta a bajo costo)",
    atencion:    "Atención psicológica general",
  },
  {
    tipo:        "PRIVADA",
    nombre:      "A.C. Cuenta Conmigo",
    responsable: "Lic. Karina",
    direccion:   "Paseo de Hamburgo, Cd. Del Valle",
    telefono:    "311 112 1360",
    costo:       "Primera consulta $400, posteriores $200",
    atencion:    "Atención psicológica general",
  },
  {
    tipo:        "PRIVADA",
    nombre:      "Centro León Eisenberg",
    direccion:   "Prol. Constitución #65, Col. Paseo de la Constitución",
    telefono:    "311 103 5083 / 311 103 5084",
    costo:       "Desde $250 (varios)",
    atencion:    "TDAH, autismo, ansiedad, neurología, aprendizaje",
  },
  {
    tipo:        "PRIVADA",
    nombre:      "Jardines de San Juan — Tanatología",
    direccion:   "Boulevard Tepic-Xalisco",
    telefono:    "311 218 0557",
    horario:     "Martes 19:30",
    atencion:    "Tanatología (Grupo de Ayuda Mutua)",
  },
]
