import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { prisma } from "@/lib/db"
import { procesarYGuardarTamizaje } from "@/lib/actions/tamizaje"

// ── Parser 1: XLS-HTML (archivos .xls guardados como "Página web") ───────────

function parsearHtml(html: string): Record<string, string>[] {
  const normalized = html
    .replace(/<TD/gi, "<td").replace(/<\/TD>/gi, "</td>")
    .replace(/<TH/gi, "<th").replace(/<\/TH>/gi, "</th>")

  const headers = [...normalized.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim().toLowerCase())

  const cells = [...normalized.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").replace(/,/g, ".").trim()
  )

  const rows: Record<string, string>[] = []
  const cols = headers.length
  if (cols === 0) return rows

  for (let i = 0; i < cells.length; i += cols) {
    const row: Record<string, string> = {}
    for (let j = 0; j < cols; j++) row[headers[j]] = cells[i + j] ?? ""
    rows.push(row)
  }
  return rows
}

// ── Parser 2: XLSX real usando ExcelJS ────────────────────────────────────────

function normKey(v: unknown): string {
  return String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]/g, "")
}

async function parsearXlsx(buffer: Buffer): Promise<Record<string, string>[]> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buffer as never)

  const ws = wb.worksheets[0]
  if (!ws) throw new Error("El archivo no contiene hojas de cálculo.")

  // Buscar fila de encabezados (primera que tenga id/edad/sexo/respuestas)
  let headerRowNum = -1
  let headers: string[] = []

  ws.eachRow((row, rowNum) => {
    if (headerRowNum !== -1) return
    const vals = (row.values as unknown[]).slice(1).map((v) => normKey(v))
    if (vals.some((v) => v === "id" || v === "respuestas" || v === "edad")) {
      headerRowNum = rowNum
      headers = vals
    }
  })

  if (headerRowNum === -1) {
    throw new Error("No se encontró fila de encabezados con columnas id/edad/sexo/respuestas.")
  }

  const rows: Record<string, string>[] = []
  ws.eachRow((row, rowNum) => {
    if (rowNum <= headerRowNum) return
    const vals = (row.values as unknown[]).slice(1)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = String(vals[i] ?? "").trim() })
    if (Object.values(obj).every((v) => !v)) return  // fila vacía
    rows.push(obj)
  })

  return rows
}

// ── Parseo unificado: HTML → fallback XLSX ────────────────────────────────────

async function parsearArchivo(buffer: Buffer, nombreArchivo: string): Promise<Record<string, string>[]> {
  const ext = nombreArchivo.split(".").pop()?.toLowerCase()

  // Para .xlsx siempre usar ExcelJS
  if (ext === "xlsx") {
    return parsearXlsx(buffer)
  }

  // Para .xls intentar HTML primero
  let html: string
  try {
    html = new TextDecoder("utf-8").decode(buffer)
    if (!html.includes("<t")) throw new Error("no html")
  } catch {
    html = new TextDecoder("latin1").decode(buffer)
  }

  const filas = parsearHtml(html)
  if (filas.length > 0) return filas

  // Si el .xls no es HTML, intentar con ExcelJS
  return parsearXlsx(buffer)
}

// ── Normalización ─────────────────────────────────────────────────────────────

function normalizarSexo(raw: string): "MASCULINO" | "FEMENINO" | "OTRO" {
  const s = raw.toUpperCase().trim()
  if (s.startsWith("H") || s.startsWith("M") || s.includes("MASC")) return "MASCULINO"
  if (s.startsWith("F") || s.includes("MUJ") || s.includes("FEM")) return "FEMENINO"
  return "OTRO"
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let filas: Record<string, string>[]

    try {
      filas = await parsearArchivo(buffer, file.name)
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Error al leer el archivo." },
        { status: 400 }
      )
    }

    if (filas.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron filas en el archivo. Verifica que tenga columnas: id, edad, sexo, respuestas." },
        { status: 400 }
      )
    }

    // Diagnóstico: columnas encontradas en la primera fila
    const columnasEncontradas = filas.length > 0 ? Object.keys(filas[0]) : []

    let insertados = 0
    let omitidos = 0
    let duplicados = 0
    const errores: string[] = []
    const muestra: Array<{ nombre: string; semaforo: string; tipoCaso: string; edad: number; sexo: string }> = []

    // Contadores de razón de omisión (para diagnóstico)
    let sinId = 0, sinEdad = 0, sinRespuestas = 0, respInvalida = 0

    for (const fila of filas) {
      // Buscar id (puede ser alfanumérico: MCG05, 123, etc.)
      const idStr   = (fila["id"] ?? fila["folio"] ?? fila["no"] ?? fila["num"] ?? fila["numero"] ?? "").trim()
      const edadStr = (fila["edad"] ?? fila["age"] ?? "").trim()
      const sexoStr = (fila["sexo"] ?? fila["sex"] ?? fila["genero"] ?? "").trim()
      // "Respuestas " con espacio → normKey lo convierte a "respuestas"
      const respStr = (fila["respuestas"] ?? fila["responses"] ?? fila["resp"] ?? "").trim()

      const edad = parseInt(edadStr, 10)

      if (!idStr)                                { omitidos++; sinId++; continue }
      if (isNaN(edad) || edad < 10 || edad > 25) { omitidos++; sinEdad++; continue }

      // Validar cadena de respuestas (188 dígitos 1-5)
      const soloDigitos = respStr.replace(/\D/g, "")
      if (soloDigitos.length !== 188)            { omitidos++; sinRespuestas++; continue }

      const respuestasArray = soloDigitos.split("").map(Number)
      if (respuestasArray.some((r) => r < 1 || r > 5)) { omitidos++; respInvalida++; continue }

      const sexo   = normalizarSexo(sexoStr)
      // CURP sintética: HIST + id alfanumérico relleno hasta 14 chars = 18 total
      const idNorm = idStr.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 14).padStart(14, "0")
      const curp   = `HIST${idNorm}`
      const nombre = `Alumno ${idStr}`

      // Crear estudiante — skip silencioso si la CURP ya existe
      const estudiante = await prisma.estudiante
        .create({
          data: { curp, nombre, edad, sexo, grado: "Histórico", grupo: "Histórico", escuela: "Histórico SENA" },
        })
        .catch(() => null)

      if (!estudiante) { duplicados++; continue }

      try {
        const { semaforo, tipoCaso } = await procesarYGuardarTamizaje(
          estudiante.id,
          respuestasArray,
          { skipML: true }   // import masivo: solo scoring local, sin llamada ML
        )
        insertados++
        muestra.push({ nombre, semaforo, tipoCaso, edad, sexo })
      } catch (err) {
        errores.push(`Alumno ${idStr}: ${err instanceof Error ? err.message : String(err)}`)
        await prisma.estudiante.delete({ where: { id: estudiante.id } }).catch(() => {})
      }
    }

    return NextResponse.json({
      insertados,
      omitidos,
      duplicados,
      errores,
      muestra: muestra.slice(-5),
      // Diagnóstico (visible en la consola del servidor y en la respuesta)
      _debug: {
        totalFilas: filas.length,
        columnas: columnasEncontradas,
        omitidosPorSinId: sinId,
        omitidosPorEdad: sinEdad,
        omitidosPorRespuestas: sinRespuestas,
        omitidosPorRespInvalida: respInvalida,
        ejemploPrimeraFila: filas[0] ? {
          id: filas[0]["id"] ?? filas[0]["folio"] ?? "(no encontrado)",
          edad: filas[0]["edad"] ?? "(no encontrado)",
          sexo: filas[0]["sexo"] ?? "(no encontrado)",
          respuestas_len: (filas[0]["respuestas"] ?? "").replace(/\D/g, "").length,
        } : null,
      },
    })
  } catch (err) {
    console.error("[importar-respuestas]", err)
    return NextResponse.json(
      { error: "Error procesando el archivo: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    )
  }
}
