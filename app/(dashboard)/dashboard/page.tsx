import GraficaSemaforos from "@/components/dashboard/GraficaSemaforos"
import GraficaTiposCaso from "@/components/dashboard/GraficaTiposCaso"
import {
  getResumenSemaforos,
  getResumenTiposCaso,
  getTotalEstudiantes,
  getTotalUrgentes,
} from "@/lib/data/mock"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Rol } from "@/lib/enums"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.rol === Rol.ESTUDIANTE) redirect("/cuestionario/mi-sena")
  const [semaforos, tiposCaso, totalEstudiantes, urgentes] = await Promise.all([
    getResumenSemaforos(),
    getResumenTiposCaso(),
    getTotalEstudiantes(),
    getTotalUrgentes(),
  ])
  const totalTamizajes = semaforos.reduce((acc, s) => acc + s.total, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Salud Mental del Plantel
      </h1>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Total estudiantes</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalEstudiantes}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Tamizajes aplicados</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalTamizajes}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow p-5 border border-red-200">
          <p className="text-sm text-red-600 font-medium">Urgentes activos</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{urgentes}</p>
        </div>
      </div>

      {/* Graficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GraficaSemaforos data={semaforos} />
        <GraficaTiposCaso data={tiposCaso} />
      </div>
    </div>
  )
}
