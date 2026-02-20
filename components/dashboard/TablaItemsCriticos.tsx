import { MockItemCritico } from "@/lib/data/mock"

const COLOR_RESPUESTA: Record<number, string> = {
  5: "bg-red-100 text-red-700",
  4: "bg-orange-100 text-orange-700",
  3: "bg-yellow-100 text-yellow-700",
  2: "bg-gray-100 text-gray-600",
  1: "bg-gray-50 text-gray-500",
}

type Props = { items: MockItemCritico[] }

export default function TablaItemsCriticos({ items }: Props) {
  // Agrupar por categoria
  const grupos = items.reduce<Record<string, MockItemCritico[]>>((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = []
    acc[item.categoria].push(item)
    return acc
  }, {})

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Items criticos activos</h2>
        <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
          {items.length} items
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(grupos).map(([categoria, grupoItems]) => (
          <div key={categoria}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {categoria}
            </p>
            <div className="space-y-1">
              {grupoItems.map((item) => (
                <div
                  key={item.item}
                  className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                      #{item.item}
                    </span>
                    <p className="text-sm text-gray-700">{item.texto}</p>
                  </div>
                  <span
                    className={`text-xs shrink-0 px-2 py-0.5 rounded-full font-medium ${
                      COLOR_RESPUESTA[item.respuesta] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.etiquetaRespuesta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
