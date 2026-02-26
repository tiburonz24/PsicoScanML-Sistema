type Props = { searchParams: Promise<{ s?: string; c?: string }> }

const SEMAFORO_INFO = {
  VERDE: {
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    emoji: "✓",
    titulo: "Cuestionario completado",
    mensaje: "Gracias por completar el cuestionario. Tus respuestas han sido registradas correctamente.",
  },
  AMARILLO: {
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    emoji: "!",
    titulo: "Cuestionario completado",
    mensaje: "Gracias por tu sinceridad. El equipo de orientación revisará tus respuestas pronto.",
  },
  ROJO: {
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    emoji: "!",
    titulo: "Cuestionario completado",
    mensaje: "Gracias por completar el cuestionario. Alguien del equipo de orientación se pondrá en contacto contigo.",
  },
  ROJO_URGENTE: {
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    emoji: "!",
    titulo: "Cuestionario completado",
    mensaje: "Gracias por tu valentía al responder. Si en este momento necesitas hablar con alguien, acércate de inmediato a orientación o al psicólogo de tu plantel.",
  },
}

export default async function GraciasPage({ searchParams }: Props) {
  const { s, c } = await searchParams
  const semaforo = (s ?? "VERDE") as keyof typeof SEMAFORO_INFO
  const itemsCriticos = Number(c ?? 0)
  const info = SEMAFORO_INFO[semaforo] ?? SEMAFORO_INFO.VERDE

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
         style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)" }}>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-2 w-full"
             style={{ background: `linear-gradient(90deg, ${info.color}, #4f46e5)` }} />

        <div className="px-8 py-8 text-center space-y-5">
          {/* Ícono */}
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold"
               style={{ background: info.bg, border: `2px solid ${info.border}`, color: info.color }}>
            {info.emoji}
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold" style={{ color: "#1e1b4b" }}>
              {info.titulo}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              {info.mensaje}
            </p>
          </div>

          {/* Mensaje de ayuda siempre visible */}
          <div className="rounded-xl px-4 py-3 text-sm text-left space-y-1"
               style={{ background: "#f5f3ff", borderLeft: "3px solid #6366f1" }}>
            <p className="font-medium" style={{ color: "#1e1b4b" }}>
              Recuerda que no estás solo/a
            </p>
            <p className="text-gray-600 text-xs leading-relaxed">
              Si en algún momento necesitas apoyo, el departamento de orientación y psicología
              de tu plantel está disponible para escucharte.
            </p>
          </div>

          {itemsCriticos > 0 && (
            <div className="rounded-xl px-4 py-3 text-sm"
                 style={{ background: "#fff7ed", borderLeft: "3px solid #f97316" }}>
              <p className="text-orange-700 text-xs">
                El equipo de orientación revisará tus respuestas con atención especial.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400 pt-2">
            Puedes cerrar esta ventana.
          </p>
        </div>
      </div>
    </div>
  )
}
