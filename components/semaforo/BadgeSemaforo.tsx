import { Semaforo } from "@/lib/enums"

const config: Record<Semaforo, { label: string; clase: string }> = {
  VERDE:        { label: "Sin riesgo",  clase: "bg-green-100 text-green-800" },
  AMARILLO:     { label: "Revision",    clase: "bg-yellow-100 text-yellow-800" },
  ROJO:         { label: "Prioritario", clase: "bg-red-100 text-red-800" },
  ROJO_URGENTE: { label: "URGENTE",     clase: "bg-red-900 text-white animate-pulse" },
}

const tamaños = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2 py-1 text-xs",
  lg: "px-4 py-2 text-sm",
}

type Props = {
  semaforo: Semaforo
  size?: "sm" | "md" | "lg"
}

export default function BadgeSemaforo({ semaforo, size = "md" }: Props) {
  const { label, clase } = config[semaforo]
  return (
    <span className={`rounded-full font-bold ${clase} ${tamaños[size]}`}>
      {label}
    </span>
  )
}
