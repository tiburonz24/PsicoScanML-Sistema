import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { prisma } from "@/lib/db"

// ── Normalización de headers ────────────────────────────────────────────────
function normKey(v: unknown): string {
  return String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-z0-9]/g, "")
}

const HEADER_MAP: Record<string, string> = {
  nombre: "nombre", name: "nombre",
  curp: "curp",
  edad: "edad", age: "edad",
  sexo: "sexo", sex: "sexo", genero: "sexo", gender: "sexo",
  grado: "grado", grade: "grado", semestre: "grado",
  grupo: "grupo", group: "grupo", salon: "grupo", seccion: "grupo",
  escuela: "escuela", school: "escuela", plantel: "escuela", institucion: "escuela",
}

function mapearSexo(v: string): "MASCULINO" | "FEMENINO" | "OTRO" | null {
  const s = v.toUpperCase().trim()
  if (s === "M" || s === "MASCULINO" || s === "HOMBRE" || s === "H") return "MASCULINO"
  if (s === "F" || s === "FEMENINO"  || s === "MUJER"   || s === "ME") return "FEMENINO"
  if (s === "OTRO" || s === "O" || s === "NB") return "OTRO"
  return null
}

const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/

// ── Leer Excel y extraer filas ──────────────────────────────────────────────
async function parsearExcel(buffer: Buffer): Promise<Record<string, string>[]> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buffer as never)

  const ws = wb.worksheets[0]
  if (!ws) throw new Error("El archivo no contiene hojas de cálculo.")

  // Buscar la fila de encabezados (primera fila que tenga "nombre" o "curp")
  let headerRowNum = -1
  let headers: string[] = []

  ws.eachRow((row, rowNum) => {
    if (headerRowNum !== -1) return
    const vals = (row.values as (string | null)[]).slice(1).map(v => normKey(v))
    if (vals.some(v => v === "nombre" || v === "curp" || v === "edad")) {
      headerRowNum = rowNum
      headers = vals.map(v => HEADER_MAP[v] ?? v)
    }
  })

  if (headerRowNum === -1) {
    throw new Error("No se encontró fila de encabezados. Asegúrate de incluir columnas: Nombre, CURP, Edad, Sexo, Grado, Grupo, Escuela.")
  }

  const filas: Record<string, string>[] = []
  ws.eachRow((row, rowNum) => {
    if (rowNum <= headerRowNum) return
    const vals = (row.values as unknown[]).slice(1)
    const fila: Record<string, string> = {}
    headers.forEach((h, i) => {
      fila[h] = String(vals[i] ?? "").trim()
    })
    // Ignorar filas completamente vacías
    if (Object.values(fila).every(v => !v)) return
    filas.push(fila)
  })

  return filas
}

// ── Handler POST ────────────────────────────────────────────────────────────
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
      filas = await parsearExcel(buffer)
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Error al leer el archivo." },
        { status: 400 }
      )
    }

    if (filas.length === 0) {
      return NextResponse.json({ error: "El archivo no contiene datos." }, { status: 400 })
    }

    // ── Procesar cada fila ────────────────────────────────────────────────
    type Fila = {
      nombre: string; curp: string; edad: number
      sexo: "MASCULINO" | "FEMENINO" | "OTRO"
      grado: string; grupo: string; escuela: string
    }

    const validos:   Fila[]   = []
    const errores:   string[] = []
    let filaNum = 0

    for (const f of filas) {
      filaNum++
      const nombre  = f.nombre?.trim()
      const curp    = f.curp?.trim().toUpperCase()
      const edad    = parseInt(f.edad ?? "", 10)
      const sexoRaw = f.sexo?.trim() ?? ""
      const grado   = f.grado?.trim()
      const grupo   = f.grupo?.trim().toUpperCase()
      const escuela = (f.escuela?.trim()) || "CECyTEN Plantel Tepic"

      if (!nombre)  { errores.push(`Fila ${filaNum}: falta el nombre.`);  continue }
      if (!curp)    { errores.push(`Fila ${filaNum}: falta la CURP.`);    continue }
      if (!CURP_REGEX.test(curp)) {
        errores.push(`Fila ${filaNum}: CURP inválida (${curp}).`)
        continue
      }
      if (isNaN(edad) || edad < 10 || edad > 25) {
        errores.push(`Fila ${filaNum}: edad inválida (${f.edad}).`)
        continue
      }
      const sexo = mapearSexo(sexoRaw)
      if (!sexo) {
        errores.push(`Fila ${filaNum}: sexo inválido (${sexoRaw}). Usa MASCULINO, FEMENINO u OTRO.`)
        continue
      }
      if (!grado) { errores.push(`Fila ${filaNum}: falta el grado.`);  continue }
      if (!grupo) { errores.push(`Fila ${filaNum}: falta el grupo.`);  continue }

      validos.push({ nombre, curp, edad, sexo, grado, grupo, escuela })
    }

    if (validos.length === 0) {
      return NextResponse.json({
        insertados: 0, omitidos: filas.length,
        duplicados: 0, errores,
        muestra: [],
        error: "Ningún registro pasó la validación.",
      })
    }

    // ── Insertar en DB (ignorar duplicados por CURP) ──────────────────────
    const result = await prisma.estudiante.createMany({
      data: validos,
      skipDuplicates: true,
    })

    const duplicados = validos.length - result.count

    // ── Muestra de los últimos insertados ────────────────────────────────
    const muestra = await prisma.estudiante.findMany({
      take: 5,
      orderBy: { id: "desc" },
      select: { id: true, nombre: true, curp: true, edad: true, sexo: true, grado: true, grupo: true },
    })

    return NextResponse.json({
      insertados: result.count,
      omitidos:   errores.length,
      duplicados,
      errores:    errores.slice(0, 10), // máximo 10 mensajes de error
      muestra,
    })
  } catch (err) {
    console.error("[estudiantes/importar]", err)
    return NextResponse.json(
      { error: "Error al procesar el archivo: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    )
  }
}
