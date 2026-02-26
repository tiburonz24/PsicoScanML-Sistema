"use client"

import { useState } from "react"

type Props = {
  nombre: string
  enlace: string
}

export default function BannerEnlace({ nombre, enlace }: Props) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(enlace)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 space-y-2">
      <p className="text-sm font-semibold text-green-800">
        Estudiante <span className="font-bold">{nombre}</span> registrado correctamente.
      </p>
      <p className="text-sm text-green-700">
        Comparte el siguiente enlace para que el alumno conteste el cuestionario:
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-white border border-green-200 rounded-lg px-3 py-2 truncate text-gray-700 select-all">
          {enlace}
        </code>
        <button
          onClick={copiar}
          className="shrink-0 px-3 py-2 bg-green-600 text-white text-xs font-medium
                     rounded-lg hover:bg-green-700 transition"
        >
          {copiado ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
      <p className="text-xs text-green-600">
        El alumno puede abrir este enlace en cualquier dispositivo sin necesidad de cuenta.
      </p>
    </div>
  )
}
