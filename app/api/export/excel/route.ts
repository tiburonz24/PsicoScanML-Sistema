import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { prisma } from "@/lib/db"

// ─── Helpers de formato ─────────────────────────────────────────────────────

const SEMAFORO_LABEL: Record<string, string> = {
  VERDE:        "Sin riesgo",
  AMARILLO:     "Revisión",
  ROJO:         "Prioritario",
  ROJO_URGENTE: "URGENTE",
}

const SEMAFORO_COLOR: Record<string, string> = {
  VERDE:        "FF22c55e",
  AMARILLO:     "FFf59e0b",
  ROJO:         "FFef4444",
  ROJO_URGENTE: "FFdc2626",
}

const SEMAFORO_BG: Record<string, string> = {
  VERDE:        "FFf0fdf4",
  AMARILLO:     "FFfffbeb",
  ROJO:         "FFfef2f2",
  ROJO_URGENTE: "FFfee2e2",
}

const TIPO_LABEL: Record<string, string> = {
  INCONSISTENCIA:     "Inconsistencia",
  SIN_RIESGO:         "Sin riesgo",
  IMPRESION_POSITIVA: "Impresión positiva",
  IMPRESION_NEGATIVA: "Impresión negativa",
  CON_RIESGO:         "Con riesgo verificado",
}

const SEXO_LABEL: Record<string, string> = {
  MASCULINO: "Masculino",
  FEMENINO:  "Femenino",
  OTRO:      "Otro",
}

// Orden de urgencia para clasificar y ordenar
const URGENCIA_ORDER: Record<string, number> = {
  ROJO_URGENTE: 0,
  ROJO:         1,
  AMARILLO:     2,
  VERDE:        3,
}

function fmtFecha(fecha: Date | null | undefined): string {
  if (!fecha) return "—"
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

function itemsCriticosTexto(itemsCriticos: unknown): string {
  if (!Array.isArray(itemsCriticos) || itemsCriticos.length === 0) return "Ninguno"
  return (itemsCriticos as Array<{ item: number; categoria: string; etiqueta: string }>)
    .map((ic) => `#${ic.item} ${ic.categoria} (${ic.etiqueta})`)
    .join(" | ")
}

// ─── Definición de columnas ─────────────────────────────────────────────────

const COLS_PERSONALES = [
  { header: "Nombre",   key: "nombre",  width: 30 },
  { header: "CURP",     key: "curp",    width: 20 },
  { header: "Edad",     key: "edad",    width: 7  },
  { header: "Sexo",     key: "sexo",    width: 12 },
  { header: "Grado",    key: "grado",   width: 9  },
  { header: "Grupo",    key: "grupo",   width: 9  },
  { header: "Escuela",  key: "escuela", width: 26 },
]

const COLS_RESULTADO = [
  { header: "Fecha tamizaje",    key: "fecha",          width: 16 },
  { header: "Nivel de riesgo",   key: "semaforo",       width: 16 },
  { header: "Tipo de caso",      key: "tipoCaso",       width: 22 },
  { header: "Observaciones",     key: "observaciones",  width: 40 },
]

const COLS_ESCALAS = [
  { header: "GLO",  key: "glo_t", width: 7 },
  { header: "EMO",  key: "emo_t", width: 7 },
  { header: "CON",  key: "con_t", width: 7 },
  { header: "EJE",  key: "eje_t", width: 7 },
  { header: "CTX",  key: "ctx_t", width: 7 },
  { header: "REC",  key: "rec_t", width: 7 },
  { header: "DEP",  key: "dep_t", width: 7 },
  { header: "ANS",  key: "ans_t", width: 7 },
  { header: "ASC",  key: "asc_t", width: 7 },
  { header: "SOM",  key: "som_t", width: 7 },
  { header: "PST",  key: "pst_t", width: 7 },
  { header: "OBS",  key: "obs_t", width: 7 },
  { header: "ATE",  key: "ate_t", width: 7 },
  { header: "HIP",  key: "hip_t", width: 7 },
  { header: "IRA",  key: "ira_t", width: 7 },
  { header: "AGR",  key: "agr_t", width: 7 },
  { header: "DES",  key: "des_t", width: 7 },
  { header: "ANT",  key: "ant_t", width: 7 },
  { header: "SUS",  key: "sus_t", width: 7 },
  { header: "ESQ",  key: "esq_t", width: 7 },
  { header: "ALI",  key: "ali_t", width: 7 },
  { header: "FAM",  key: "fam_t", width: 7 },
  { header: "ESC",  key: "esc_t", width: 7 },
  { header: "COM",  key: "com_t", width: 7 },
  { header: "AUT",  key: "aut_t", width: 7 },
  { header: "SOC",  key: "soc_t", width: 7 },
  { header: "CNC",  key: "cnc_t", width: 7 },
]

const COLS_CRITICOS = [
  { header: "Ítems críticos", key: "itemsCriticos", width: 60 },
]

const TODAS_COLS = [
  ...COLS_PERSONALES,
  ...COLS_RESULTADO,
  ...COLS_ESCALAS,
  ...COLS_CRITICOS,
]

// ─── Fetch ───────────────────────────────────────────────────────────────────

type EstudianteRow = Awaited<ReturnType<typeof fetchEstudiantes>>[number]

async function fetchEstudiantes(id?: string) {
  const rows = await prisma.estudiante.findMany({
    where: id ? { id } : undefined,
    select: {
      id: true, nombre: true, curp: true, edad: true,
      sexo: true, grado: true, grupo: true, escuela: true,
      tamizajes: {
        orderBy: { fecha: "desc" },
        take: 1,
        select: {
          fecha: true, semaforo: true, tipoCaso: true, observaciones: true,
          itemsCriticos: true,
          glo_t: true, emo_t: true, con_t: true, eje_t: true, ctx_t: true, rec_t: true,
          dep_t: true, ans_t: true, asc_t: true, som_t: true, pst_t: true, obs_t: true,
          ate_t: true, hip_t: true, ira_t: true, agr_t: true, des_t: true, ant_t: true,
          sus_t: true, esq_t: true, ali_t: true,
          fam_t: true, esc_t: true, com_t: true,
          aut_t: true, soc_t: true, cnc_t: true,
        },
      },
    },
  })

  // Ordenar por urgencia, luego por fecha de tamizaje más reciente
  rows.sort((a, b) => {
    const ua = URGENCIA_ORDER[a.tamizajes[0]?.semaforo ?? "VERDE"] ?? 4
    const ub = URGENCIA_ORDER[b.tamizajes[0]?.semaforo ?? "VERDE"] ?? 4
    if (ua !== ub) return ua - ub
    const fa = a.tamizajes[0]?.fecha?.getTime() ?? 0
    const fb = b.tamizajes[0]?.fecha?.getTime() ?? 0
    return fb - fa
  })

  return rows
}

// ─── Agregar hoja al workbook ─────────────────────────────────────────────────

function addSheet(
  wb: ExcelJS.Workbook,
  estudiantes: EstudianteRow[],
  sheetName: string,
  headerColor: string = "FF312e81"
) {
  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 4 }],
    properties: { tabColor: { argb: headerColor } },
  })

  // Fila 1: título
  ws.mergeCells(1, 1, 1, TODAS_COLS.length)
  const titleCell = ws.getCell("A1")
  titleCell.value = `PsicoScan ML — ${sheetName}`
  titleCell.font  = { bold: true, size: 13, color: { argb: "FFFFFFFF" } }
  titleCell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: headerColor } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  ws.getRow(1).height = 26

  // Fila 2: subtítulo
  ws.mergeCells(2, 1, 2, TODAS_COLS.length)
  const subCell = ws.getCell("A2")
  subCell.value = `Generado: ${fmtFecha(new Date())}  ·  CECyTEN Tepic  ·  ${estudiantes.length} registro(s)`
  subCell.font  = { italic: true, size: 10, color: { argb: "FF6366f1" } }
  subCell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFe0e7ff" } }
  subCell.alignment = { horizontal: "center" }
  ws.getRow(2).height = 16

  // Fila 3: encabezados de sección
  ws.getRow(3).height = 28
  const secciones = [
    { label: "DATOS PERSONALES",            desde: 1,
      hasta: COLS_PERSONALES.length,                                                              bg: "FF1e3a5f" },
    { label: "RESULTADO SENA/ML",           desde: COLS_PERSONALES.length + 1,
      hasta: COLS_PERSONALES.length + COLS_RESULTADO.length,                                      bg: "FF14532d" },
    { label: "PUNTUACIONES ESCALAS (brutas)",
      desde: COLS_PERSONALES.length + COLS_RESULTADO.length + 1,
      hasta: COLS_PERSONALES.length + COLS_RESULTADO.length + COLS_ESCALAS.length,                bg: "FF1e3a5f" },
    { label: "ÍTEMS CRÍTICOS",
      desde: COLS_PERSONALES.length + COLS_RESULTADO.length + COLS_ESCALAS.length + 1,
      hasta: TODAS_COLS.length,                                                                    bg: "FF7f1d1d" },
  ]
  for (const sec of secciones) {
    ws.mergeCells(3, sec.desde, 3, sec.hasta)
    const c = ws.getCell(3, sec.desde)
    c.value = sec.label
    c.font  = { bold: true, size: 10, color: { argb: "FFFFFFFF" } }
    c.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: sec.bg } }
    c.alignment = { horizontal: "center", vertical: "middle" }
  }

  // Fila 4: encabezados de columna
  ws.getRow(4).height = 22
  ws.columns = TODAS_COLS.map((c) => ({ key: c.key, width: c.width }))
  const headerRow = ws.addRow(TODAS_COLS.map((c) => c.header))
  headerRow.eachCell((cell) => {
    cell.font      = { bold: true, size: 9, color: { argb: "FFFFFFFF" } }
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3730a3" } }
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
    cell.border    = { bottom: { style: "thin", color: { argb: "FFa5b4fc" } } }
  })

  // Filas de datos
  for (const est of estudiantes) {
    const t = est.tamizajes[0] ?? null
    const rowData = {
      nombre: est.nombre, curp: est.curp, edad: est.edad,
      sexo:    SEXO_LABEL[est.sexo] ?? est.sexo,
      grado: est.grado, grupo: est.grupo, escuela: est.escuela,
      fecha:         t ? fmtFecha(t.fecha)                        : "Sin tamizaje",
      semaforo:      t ? SEMAFORO_LABEL[t.semaforo] ?? t.semaforo : "—",
      tipoCaso:      t ? TIPO_LABEL[t.tipoCaso]     ?? t.tipoCaso : "—",
      observaciones: t?.observaciones ?? "—",
      glo_t: t?.glo_t ?? "—", emo_t: t?.emo_t ?? "—", con_t: t?.con_t ?? "—",
      eje_t: t?.eje_t ?? "—", ctx_t: t?.ctx_t ?? "—", rec_t: t?.rec_t ?? "—",
      dep_t: t?.dep_t ?? "—", ans_t: t?.ans_t ?? "—", asc_t: t?.asc_t ?? "—",
      som_t: t?.som_t ?? "—", pst_t: t?.pst_t ?? "—", obs_t: t?.obs_t ?? "—",
      ate_t: t?.ate_t ?? "—", hip_t: t?.hip_t ?? "—", ira_t: t?.ira_t ?? "—",
      agr_t: t?.agr_t ?? "—", des_t: t?.des_t ?? "—", ant_t: t?.ant_t ?? "—",
      sus_t: t?.sus_t ?? "—", esq_t: t?.esq_t ?? "—", ali_t: t?.ali_t ?? "—",
      fam_t: t?.fam_t ?? "—", esc_t: t?.esc_t ?? "—", com_t: t?.com_t ?? "—",
      aut_t: t?.aut_t ?? "—", soc_t: t?.soc_t ?? "—", cnc_t: t?.cnc_t ?? "—",
      itemsCriticos: t ? itemsCriticosTexto(t.itemsCriticos) : "—",
    }

    const dataRow = ws.addRow(TODAS_COLS.map((c) => rowData[c.key as keyof typeof rowData] ?? ""))
    dataRow.height = 16
    dataRow.eachCell((cell, colNum) => {
      cell.font      = { size: 9 }
      cell.alignment = { vertical: "middle", wrapText: colNum === TODAS_COLS.length }
      cell.border    = { bottom: { style: "hair", color: { argb: "FFe2e8f0" } } }
    })

    if (t) {
      const semIdx  = COLS_PERSONALES.length + 2
      const semCell = dataRow.getCell(semIdx)
      semCell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: SEMAFORO_BG[t.semaforo] ?? "FFFFFFFF" } }
      semCell.font  = { bold: true, size: 9, color: { argb: SEMAFORO_COLOR[t.semaforo] ?? "FF000000" } }
      semCell.alignment = { horizontal: "center", vertical: "middle" }
    }
  }

  // Borde exterior
  const lastRow = ws.rowCount
  for (let r = 1; r <= lastRow; r++) {
    ws.getRow(r).getCell(1).border = {
      ...ws.getRow(r).getCell(1).border,
      left: { style: "thin", color: { argb: "FFc7d2fe" } },
    }
    ws.getRow(r).getCell(TODAS_COLS.length).border = {
      ...ws.getRow(r).getCell(TODAS_COLS.length).border,
      right: { style: "thin", color: { argb: "FFc7d2fe" } },
    }
  }
}

// ─── Construir workbook ───────────────────────────────────────────────────────

function buildWorkbook(estudiantes: EstudianteRow[], individual: boolean): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook()
  wb.creator = "PsicoScan ML"
  wb.created = new Date()

  if (individual) {
    // Expediente individual: una sola hoja
    addSheet(wb, estudiantes, "Expediente SENA", "FF312e81")
    return wb
  }

  // Reporte masivo: 5 hojas
  const urgente     = estudiantes.filter((e) => e.tamizajes[0]?.semaforo === "ROJO_URGENTE")
  const prioritario = estudiantes.filter((e) => e.tamizajes[0]?.semaforo === "ROJO")
  const revision    = estudiantes.filter((e) => e.tamizajes[0]?.semaforo === "AMARILLO")
  const sinRiesgo   = estudiantes.filter((e) => e.tamizajes[0]?.semaforo === "VERDE")
  const sinTamizaje = estudiantes.filter((e) => !e.tamizajes[0])

  // Hoja 1 — Concentrado (todos, ordenados por urgencia)
  addSheet(wb, estudiantes, "Concentrado", "FF312e81")

  // Hoja 2 — Urgente
  addSheet(wb, urgente, "Urgente", "FF991b1b")

  // Hoja 3 — Prioritario
  addSheet(wb, prioritario, "Prioritario", "FFb91c1c")

  // Hoja 4 — Revisión
  addSheet(wb, revision, "Revisión", "FF92400e")

  // Hoja 5 — Sin riesgo (+ sin tamizaje)
  addSheet(wb, [...sinRiesgo, ...sinTamizaje], "Sin riesgo", "FF14532d")

  return wb
}

// ─── Handler GET ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id") ?? undefined

  try {
    const estudiantes = await fetchEstudiantes(id)

    if (estudiantes.length === 0) {
      return NextResponse.json({ error: "No se encontraron registros." }, { status: 404 })
    }

    const wb    = buildWorkbook(estudiantes, !!id)
    const buffer = await wb.xlsx.writeBuffer()
    const fecha  = new Date().toISOString().slice(0, 10)
    const nombre = id
      ? `expediente_${estudiantes[0].nombre.replace(/\s+/g, "_")}_${fecha}.xlsx`
      : `psicoscan_concentrado_${fecha}.xlsx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nombre}"`,
        "Cache-Control":       "no-store",
      },
    })
  } catch (err) {
    console.error("[export/excel] Error:", err)
    return NextResponse.json({ error: "Error al generar el archivo Excel." }, { status: 500 })
  }
}
