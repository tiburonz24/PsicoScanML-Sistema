import Link from "next/link"

export default function MiSenaCompletadoPage() {
  return (
    <div className="max-w-lg mx-auto mt-10 text-center space-y-6">
      <div className="bg-white rounded-2xl shadow p-10 space-y-4">
        {/* Ícono de éxito */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">¡Gracias por completar el cuestionario!</h1>
          <p className="text-sm text-gray-500 mt-2">
            Tus respuestas fueron registradas. El psicólogo del plantel las revisará
            y se comunicará contigo si es necesario.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 text-left">
          Recuerda que si en algún momento necesitas hablar con alguien, puedes
          acudir directamente al departamento de psicología de tu plantel.
        </div>

        <Link
          href="/cuestionario/mi-sena"
          className="inline-block px-4 py-2 border border-gray-200 text-gray-600 text-sm
                     rounded-lg hover:bg-gray-50 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
