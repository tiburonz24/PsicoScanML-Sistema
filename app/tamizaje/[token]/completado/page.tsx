export default function TamizajeCompletadoPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ff] flex flex-col">
      {/* Encabezado institucional */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">PS</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">PsicoScan ML</p>
            <p className="text-xs text-gray-400">CECyTEN — Cuestionario SENA</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-4">
          {/* Ícono de éxito */}
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            ¡Cuestionario enviado!
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Gracias por completar el cuestionario. Tus respuestas han sido
            registradas de forma segura y confidencial.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Si sientes que necesitas hablar con alguien, acércate al
            departamento de orientación o psicología de tu plantel.
            <strong> No estás solo/a.</strong>
          </p>

          <div className="pt-2">
            <p className="text-xs text-gray-400">
              Puedes cerrar esta ventana.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
