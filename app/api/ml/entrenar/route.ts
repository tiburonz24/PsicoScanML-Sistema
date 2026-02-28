import { NextResponse } from "next/server"
import { execFile } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"
import { prisma } from "@/lib/db"

const execFileAsync = promisify(execFile)

export async function POST() {
  try {
    const scriptDir = path.join(process.cwd(), "ml-api", "scripts")
    const scriptPath = path.join(scriptDir, "entrenar_sena.py")

    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        { error: "Script de entrenamiento no encontrado." },
        { status: 404 }
      )
    }

    // Ejecutar el script Python con timeout de 120s
    const { stdout, stderr } = await execFileAsync(
      "python",
      [scriptPath],
      {
        timeout: 120_000,
        cwd: path.join(process.cwd(), "ml-api"),
        env: { ...process.env },
      }
    )

    if (stderr && stderr.trim()) {
      console.warn("[entrenar] stderr:", stderr)
    }

    // Leer métricas generadas por el script
    const metricsPath = path.join(process.cwd(), "ml-api", "models", "metrics.json")
    const importancePath = path.join(process.cwd(), "ml-api", "models", "feature_importance.json")

    let metrics: Record<string, unknown> = {}
    let importance: Record<string, unknown>[] = []

    if (fs.existsSync(metricsPath)) {
      metrics = JSON.parse(fs.readFileSync(metricsPath, "utf-8"))
    }
    if (fs.existsSync(importancePath)) {
      importance = JSON.parse(fs.readFileSync(importancePath, "utf-8"))
    }

    // Guardar en DB
    await prisma.entrenamientoML.create({
      data: {
        nRegistros:  (metrics.n_registros as number) ?? 0,
        trainSize:   (metrics.train_size as number) ?? 0.75,
        accuracy:    (metrics.accuracy as number) ?? 0,
        cvMean:      (metrics.cv_mean as number) ?? 0,
        cvStd:       (metrics.cv_std as number) ?? 0,
        nEstimators: (metrics.n_estimators as number) ?? 300,
        report:      metrics.report as object,
        importance:  JSON.parse(JSON.stringify(importance)),
      },
    })

    return NextResponse.json({
      ok: true,
      stdout: stdout.trim(),
      metrics,
      importance,
    })
  } catch (err) {
    const error = err as NodeJS.ErrnoException & { stdout?: string; stderr?: string }
    console.error("[entrenar]", error)
    return NextResponse.json(
      {
        error: "Error al entrenar el modelo: " + error.message,
        detalle: error.stderr ?? "",
      },
      { status: 500 }
    )
  }
}
