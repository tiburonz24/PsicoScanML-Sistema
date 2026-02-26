import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { calcularResultado } from "@/lib/sena/scoring"
import { REACTIVOS } from "@/lib/data/reactivos"

const TEXTOS = REACTIVOS.map((r) => r.texto)

// Mapa de nombre de columna XLS → campo del modelo
// Las columnas pt_* del XLS son los T-scores almacenados en el modelo
const COL_MAP: Record<string, string> = {
  pt_inc: "ptInc", pd_inc: "pdInc",
  pt_neg: "ptNeg", pd_neg: "pdNeg",
  pt_pos: "ptPos", pd_pos: "pdPos",
  pt_glo: "gloT",  pt_emo: "emoT",
  pt_con: "conT",  pt_eje: "ejeT",
  pt_ctx: "ctxT",  pt_rec: "recT",
  pt_dep: "depT",  pt_ans: "ansT",
  pt_asc: "ascT",  pt_som: "somT",
  pt_pst: "pstT",  pt_obs: "obsT",
  pt_ate: "ateT",  pt_hip: "hipT",
  pt_ira: "iraT",  pt_agr: "agrT",
  pt_des: "desT",  pt_ant: "antT",
  pt_sus: "susT",  pt_esq: "esqT",
  pt_ali: "aliT",  pt_fam: "famT",
  pt_esc: "escT",  pt_com: "comT",
  pt_reg: "regT",  pt_bus: "busT",
  pt_aut: "autT",  pt_soc: "socT",
  pt_cnc: "cncT",
}

function parsearHtml(html: string) {
  // Normalizar — algunos XLS usan <TD> en mayúsculas
  const normalized = html.replace(/<TD/gi, "<td").replace(/<\/TD>/gi, "</td>")
    .replace(/<TH/gi, "<th").replace(/<\/TH>/gi, "</th>")

  const headers = [...normalized.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim().toLowerCase())

  const cellMatches = [...normalized.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
  const cells = cellMatches.map((m) =>
    m[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").replace(/,/g, ".").trim()
  )

  const rows: Record<string, string>[] = []
  const cols = headers.length
  if (cols === 0) return rows

  for (let i = 0; i < cells.length; i += cols) {
    const row: Record<string, string> = {}
    for (let j = 0; j < cols; j++) {
      row[headers[j]] = cells[i + j] ?? ""
    }
    rows.push(row)
  }
  return rows
}

function parsearRespuestas(cadena: string): number[] {
  // La cadena puede ser "1234512345..." de longitud 188
  return cadena.replace(/\D/g, "").split("").map(Number).slice(0, 188)
}

function toInt(v: string, fallback = 50): number {
  const n = parseInt(v, 10)
  return isNaN(n) ? fallback : n
}

function toFloat(v: string, fallback = 0): number {
  const n = parseFloat(v)
  return isNaN(n) ? fallback : n
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    // Los XLS HTML pueden estar en latin1 o UTF-8 — intentar ambos
    let html: string
    try {
      html = new TextDecoder("utf-8").decode(buffer)
      if (!html.includes("<t")) throw new Error("no html")
    } catch {
      html = new TextDecoder("latin1").decode(buffer)
    }

    const filas = parsearHtml(html)
    if (filas.length === 0) {
      return NextResponse.json({ error: "No se encontraron filas en el archivo." }, { status: 400 })
    }

    type HistoricoRow = {
      origen: string
      fecha: Date
      edad: number
      sexo: string
      baremo: string | null
      respuestas: string | null
      semaforo: "VERDE" | "AMARILLO" | "ROJO" | "ROJO_URGENTE"
      pdInc: number; ptInc: number
      pdNeg: number; ptNeg: number
      pdPos: number; ptPos: number
      gloT: number; emoT: number; conT: number; ejeT: number; ctxT: number; recT: number
      depT: number; ansT: number; ascT: number; somT: number; pstT: number; obsT: number
      ateT: number; hipT: number; iraT: number; agrT: number; desT: number; antT: number
      susT: number; esqT: number; aliT: number
      famT: number; escT: number; comT: number
      regT: number; busT: number
      autT: number; socT: number; cncT: number
    }

    const registros: HistoricoRow[] = []
    let omitidos = 0
    const semaforos = { VERDE: 0, AMARILLO: 0, ROJO: 0, ROJO_URGENTE: 0 }

    for (const fila of filas) {
      // Campos obligatorios
      const edadStr = fila["edad"] ?? fila["age"] ?? ""
      const sexoStr = (fila["sexo"] ?? fila["sex"] ?? "").toUpperCase()
      const fechaStr = fila["fecha"] ?? fila["date"] ?? ""
      const respStr  = fila["respuestas"] ?? fila["responses"] ?? ""

      const edad = parseInt(edadStr, 10)
      if (isNaN(edad) || edad < 10 || edad > 25) { omitidos++; continue }

      const fechaParsed = new Date(fechaStr)
      const fecha = isNaN(fechaParsed.getTime()) ? new Date() : fechaParsed

      const sexoNorm = sexoStr.startsWith("M") ? "MASCULINO"
        : sexoStr.startsWith("F") ? "FEMENINO"
        : "OTRO"

      // Calcular semáforo desde las respuestas brutas
      const arr = parsearRespuestas(respStr)
      let semaforo: "VERDE" | "AMARILLO" | "ROJO" | "ROJO_URGENTE" = "VERDE"
      if (arr.length >= 188) {
        const resultado = calcularResultado(arr, TEXTOS)
        semaforo = resultado.semaforo
      }
      semaforos[semaforo]++

      // Mapear T-scores desde columnas del XLS
      const escalas: Partial<HistoricoRow> = {}
      for (const [col, campo] of Object.entries(COL_MAP)) {
        const val = fila[col] ?? ""
        if (campo.startsWith("pd")) {
          (escalas as Record<string, number>)[campo] = toFloat(val)
        } else {
          (escalas as Record<string, number>)[campo] = toInt(val)
        }
      }

      registros.push({
        origen: "importacion",
        fecha,
        edad,
        sexo: sexoNorm,
        baremo: fila["baremo"] ?? null,
        respuestas: respStr || null,
        semaforo,
        pdInc: toFloat(fila["pd_inc"] ?? ""),
        ptInc: toInt(fila["pt_inc"] ?? ""),
        pdNeg: toFloat(fila["pd_neg"] ?? ""),
        ptNeg: toInt(fila["pt_neg"] ?? ""),
        pdPos: toFloat(fila["pd_pos"] ?? ""),
        ptPos: toInt(fila["pt_pos"] ?? ""),
        gloT: toInt(fila["pt_glo"] ?? ""),
        emoT: toInt(fila["pt_emo"] ?? ""),
        conT: toInt(fila["pt_con"] ?? ""),
        ejeT: toInt(fila["pt_eje"] ?? ""),
        ctxT: toInt(fila["pt_ctx"] ?? ""),
        recT: toInt(fila["pt_rec"] ?? ""),
        depT: toInt(fila["pt_dep"] ?? ""),
        ansT: toInt(fila["pt_ans"] ?? ""),
        ascT: toInt(fila["pt_asc"] ?? ""),
        somT: toInt(fila["pt_som"] ?? ""),
        pstT: toInt(fila["pt_pst"] ?? ""),
        obsT: toInt(fila["pt_obs"] ?? ""),
        ateT: toInt(fila["pt_ate"] ?? ""),
        hipT: toInt(fila["pt_hip"] ?? ""),
        iraT: toInt(fila["pt_ira"] ?? ""),
        agrT: toInt(fila["pt_agr"] ?? ""),
        desT: toInt(fila["pt_des"] ?? ""),
        antT: toInt(fila["pt_ant"] ?? ""),
        susT: toInt(fila["pt_sus"] ?? ""),
        esqT: toInt(fila["pt_esq"] ?? ""),
        aliT: toInt(fila["pt_ali"] ?? ""),
        famT: toInt(fila["pt_fam"] ?? ""),
        escT: toInt(fila["pt_esc"] ?? ""),
        comT: toInt(fila["pt_com"] ?? ""),
        regT: toInt(fila["pt_reg"] ?? ""),
        busT: toInt(fila["pt_bus"] ?? ""),
        autT: toInt(fila["pt_aut"] ?? ""),
        socT: toInt(fila["pt_soc"] ?? ""),
        cncT: toInt(fila["pt_cnc"] ?? ""),
        ...escalas,
      })
    }

    // Insertar en batches de 200
    let insertados = 0
    const BATCH = 200
    for (let i = 0; i < registros.length; i += BATCH) {
      const batch = registros.slice(i, i + BATCH)
      const result = await prisma.historicoSENA.createMany({ data: batch, skipDuplicates: false })
      insertados += result.count
    }

    // Obtener muestra de los primeros 5 registros insertados
    const muestra = await prisma.historicoSENA.findMany({
      take: 5,
      orderBy: { creadoEn: "desc" },
      select: { id: true, fecha: true, edad: true, sexo: true, semaforo: true, gloT: true },
    })

    return NextResponse.json({ insertados, omitidos, semaforos, muestra })
  } catch (err) {
    console.error("[importar]", err)
    return NextResponse.json(
      { error: "Error procesando el archivo: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    )
  }
}
