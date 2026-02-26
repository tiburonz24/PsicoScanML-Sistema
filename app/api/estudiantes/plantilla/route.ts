import { NextResponse } from "next/server"
import ExcelJS from "exceljs"

export async function GET() {
  const wb = new ExcelJS.Workbook()
  wb.creator = "PsicoScan ML"

  const ws = wb.addWorksheet("Estudiantes")

  // ── Fila 1: título ──────────────────────────────────────────────────────
  ws.mergeCells("A1:G1")
  const title = ws.getCell("A1")
  title.value = "Plantilla de carga masiva de estudiantes — PsicoScan ML"
  title.font  = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }
  title.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FF312e81" } }
  title.alignment = { horizontal: "center" }
  ws.getRow(1).height = 22

  // ── Fila 2: instrucciones ───────────────────────────────────────────────
  ws.mergeCells("A2:G2")
  const inst = ws.getCell("A2")
  inst.value = "Completa una fila por estudiante. Campos con * son obligatorios. Sexo: MASCULINO / FEMENINO / OTRO. Grado: 1° / 2° / 3°"
  inst.font  = { italic: true, size: 9, color: { argb: "FF475569" } }
  inst.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFe0e7ff" } }
  inst.alignment = { horizontal: "left" }
  ws.getRow(2).height = 16

  // ── Fila 3: encabezados ─────────────────────────────────────────────────
  const COLS = [
    { header: "Nombre *",   key: "nombre",  width: 30 },
    { header: "CURP *",     key: "curp",    width: 20 },
    { header: "Edad *",     key: "edad",    width: 8  },
    { header: "Sexo *",     key: "sexo",    width: 14 },
    { header: "Grado *",    key: "grado",   width: 10 },
    { header: "Grupo *",    key: "grupo",   width: 10 },
    { header: "Escuela *",  key: "escuela", width: 30 },
  ]

  ws.columns = COLS.map(c => ({ key: c.key, width: c.width }))

  const headerRow = ws.addRow(COLS.map(c => c.header))
  headerRow.eachCell(cell => {
    cell.font      = { bold: true, size: 10, color: { argb: "FFFFFFFF" } }
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3730a3" } }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border    = { bottom: { style: "thin", color: { argb: "FFa5b4fc" } } }
  })
  ws.getRow(3).height = 20

  // ── Filas de ejemplo ────────────────────────────────────────────────────
  const ejemplos = [
    ["García López Juan Carlos", "GALJ050312HNRRCR01", 17, "MASCULINO", "2°", "A", "CECyTEN Plantel Tepic"],
    ["Martínez Ruiz Ana Sofía",  "MARA060814MNRRZN02", 16, "FEMENINO",  "1°", "B", "CECyTEN Plantel Tepic"],
    ["Torres Vega Luis Ernesto", "TOVL070920HNRRGR03", 15, "MASCULINO", "3°", "C", "CECyTEN Plantel Tepic"],
  ]

  for (const [i, ej] of ejemplos.entries()) {
    const row = ws.addRow(ej)
    row.eachCell(cell => {
      cell.font      = { size: 9, color: { argb: "FF334155" } }
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? "FFf8fafc" : "FFffffff" } }
      cell.alignment = { vertical: "middle" }
    })
    row.height = 15
  }

  // Freeze headers
  ws.views = [{ state: "frozen", ySplit: 3 }]

  const buffer = await wb.xlsx.writeBuffer()
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="plantilla_estudiantes.xlsx"',
      "Cache-Control":       "no-store",
    },
  })
}
