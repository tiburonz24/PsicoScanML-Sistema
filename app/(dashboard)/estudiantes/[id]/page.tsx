import { notFound } from "next/navigation"
import { getEstudianteById } from "@/lib/data/mock"
import BadgeSemaforo from "@/components/semaforo/BadgeSemaforo"
import GraficaRadar from "@/components/dashboard/GraficaRadar"
import TablaItemsCriticos from "@/components/dashboard/TablaItemsCriticos"
import TarjetaEscalas from "@/components/dashboard/TarjetaEscalas"
import Link from "next/link"
import { Sexo } from "@/lib/enums"

type Props = { params: Promise<{ id: string }> }

export default async function ExpedientePage({ params }: Props) {
  const { id } = await params
  const estudiante = await getEstudianteById(id)
  if (!estudiante) notFound()

  const tamizaje = estudiante.tamizajes[0]
  const cita = estudiante.citas[0]

  const LABELS_SEXO: Record<Sexo, string> = {
    MASCULINO: "Masculino",
    FEMENINO: "Femenino",
    OTRO: "Otro",
  }

  const LABELS_TIPO: Record<string, string> = {
    INCONSISTENCIA:     "Inconsistencia",
    SIN_RIESGO:         "Sin riesgo",
    IMPRESION_POSITIVA: "Impresion positiva",
    IMPRESION_NEGATIVA: "Impresion negativa",
    CON_RIESGO:         "Con riesgo verificado",
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Navegacion */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/estudiantes" className="hover:underline">Estudiantes</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{estudiante.nombre}</span>
      </div>

      {/* Encabezado */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{estudiante.nombre}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {LABELS_SEXO[estudiante.sexo]} · {estudiante.edad} años ·{" "}
            {estudiante.grado} &quot;{estudiante.grupo}&quot; · {estudiante.escuela}
          </p>
          {tamizaje && (
            <p className="text-xs text-gray-400 mt-1">
              Tamizaje: {new Date(tamizaje.fecha).toLocaleDateString("es-MX", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          )}
        </div>

        {tamizaje && (
          <div className="flex flex-col items-center gap-2 shrink-0">
            <BadgeSemaforo semaforo={tamizaje.semaforo} size="lg" />
            <span className="text-xs text-gray-500">{LABELS_TIPO[tamizaje.tipoCaso]}</span>
          </div>
        )}
      </div>

      {!tamizaje && (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          Este estudiante no tiene tamizajes registrados aun.
        </div>
      )}

      {tamizaje && (
        <>
          {/* Escalas de control */}
          <div className="grid grid-cols-3 gap-4">
            <TarjetaControl label="Inconsistencia (INC)" valor={tamizaje.inc} umbral={1.2} />
            <TarjetaControl label="Impresion negativa (NEG)" valor={tamizaje.neg} umbral={5} />
            <TarjetaControl label="Impresion positiva (POS)" valor={tamizaje.pos} umbral={8} />
          </div>

          {/* Grafica de radar + escalas numericas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficaRadar tamizaje={tamizaje} />
            <TarjetaEscalas tamizaje={tamizaje} />
          </div>

          {/* Items criticos */}
          {tamizaje.itemsCriticos.length > 0 && (
            <TablaItemsCriticos items={tamizaje.itemsCriticos} />
          )}

          {/* Observaciones */}
          {tamizaje.observaciones && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Observaciones del sistema</h2>
              <p className="text-sm text-gray-600">{tamizaje.observaciones}</p>
            </div>
          )}

          {/* Cita activa */}
          {cita && (
            <div className={`rounded-xl shadow p-5 border ${
              cita.estado === "PENDIENTE"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-green-50 border-green-200"
            }`}>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Cita programada</h2>
              <p className="text-sm text-gray-600">
                {new Date(cita.fecha).toLocaleDateString("es-MX", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
                {" — "}
                <span className="font-medium">{cita.estado}</span>
              </p>
              {cita.notas && (
                <p className="text-xs text-gray-500 mt-1">{cita.notas}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Componente local: tarjeta de escala de control
function TarjetaControl({
  label,
  valor,
  umbral,
}: {
  label: string
  valor: number
  umbral: number
}) {
  const elevado = valor >= umbral
  return (
    <div className={`rounded-xl shadow p-4 ${
      elevado ? "bg-orange-50 border border-orange-200" : "bg-white"
    }`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${elevado ? "text-orange-600" : "text-gray-900"}`}>
        {valor}
      </p>
      <p className={`text-xs mt-0.5 ${elevado ? "text-orange-500" : "text-gray-400"}`}>
        {elevado ? "PRECAUCION" : "Normal"}
      </p>
    </div>
  )
}
