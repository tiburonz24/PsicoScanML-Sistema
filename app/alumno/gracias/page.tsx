import Image from "next/image"

type Props = { searchParams: Promise<{ s?: string; c?: string }> }

const SEMAFORO_INFO = {
  VERDE: {
    accentColor: "#16a34a",
    accentBg:    "#f0fdf4",
    accentBorder:"#bbf7d0",
    icono: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
           stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    titulo:  "Cuestionario completado",
    mensaje: "Gracias por completar el cuestionario. Tus respuestas han sido registradas de forma segura y confidencial.",
  },
  AMARILLO: {
    accentColor: "#b45309",
    accentBg:    "#fffbeb",
    accentBorder:"#fde68a",
    icono: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
           stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    titulo:  "Cuestionario completado",
    mensaje: "Gracias por tu sinceridad. El equipo de orientación revisará tus respuestas y te dará seguimiento pronto.",
  },
  ROJO: {
    accentColor: "#dc2626",
    accentBg:    "#fef2f2",
    accentBorder:"#fecaca",
    icono: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
           stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    titulo:  "Cuestionario completado",
    mensaje: "Gracias por completar el cuestionario. Alguien del equipo de orientación se pondrá en contacto contigo a la brevedad.",
  },
  ROJO_URGENTE: {
    accentColor: "#dc2626",
    accentBg:    "#fef2f2",
    accentBorder:"#fecaca",
    icono: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
           stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    titulo:  "Cuestionario completado",
    mensaje: "Gracias por tu valentía al responder. Si en este momento necesitas apoyo, acércate de inmediato a orientación o al psicólogo de tu plantel.",
  },
}

export default async function GraciasPage({ searchParams }: Props) {
  const { s, c } = await searchParams
  const semaforo     = (s ?? "VERDE") as keyof typeof SEMAFORO_INFO
  const itemsCriticos = Number(c ?? 0)
  const info          = SEMAFORO_INFO[semaforo] ?? SEMAFORO_INFO.VERDE

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0D475A 0%, #1A7A8A 60%, #2ABFBF 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>

      {/* Tarjeta principal */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "white",
        borderRadius: 24,
        boxShadow: "0 24px 64px rgba(13,71,90,0.35)",
        overflow: "hidden",
      }}>

        {/* Barra superior del color del semáforo */}
        <div style={{ height: 5, background: info.accentColor }} />

        {/* Header con logo */}
        <div className="gracias-header" style={{
          background: "#0D475A",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          <Image
            src="/logo.png"
            alt="PsicoScan ML"
            width={40}
            height={40}
            style={{ borderRadius: 10, background: "white", padding: 3, flexShrink: 0 }}
          />
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0 }}>
              PsicoScan ML
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "2px 0 0" }}>
              CECyTEN · Plantel Tepic
            </p>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="gracias-body" style={{ padding: "32px 28px 28px", textAlign: "center" }}>

          {/* Ícono de estado */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: info.accentBg,
            border: `2px solid ${info.accentBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            {info.icono}
          </div>

          {/* Título */}
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0D475A",
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}>
            {info.titulo}
          </h1>

          {/* Mensaje principal */}
          <p style={{
            fontSize: 14,
            color: "#4B5563",
            lineHeight: 1.7,
            margin: "0 0 24px",
          }}>
            {info.mensaje}
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: "#E5E7EB", margin: "0 0 20px" }} />

          {/* Bloque de apoyo */}
          <div style={{
            background: "#F0F9FF",
            border: "1px solid #BAE6FD",
            borderLeft: "4px solid #0D475A",
            borderRadius: 12,
            padding: "14px 16px",
            textAlign: "left",
            marginBottom: itemsCriticos > 0 ? 12 : 20,
          }}>
            <p style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0D475A",
              margin: "0 0 5px",
            }}>
              Recuerda que no estás solo/a
            </p>
            <p style={{
              fontSize: 13,
              color: "#374151",
              lineHeight: 1.6,
              margin: 0,
            }}>
              El departamento de orientación y psicología de tu plantel
              está disponible para escucharte en cualquier momento.
            </p>
          </div>

          {/* Alerta items críticos */}
          {itemsCriticos > 0 && (
            <div style={{
              background: "#FFF7ED",
              border: "1px solid #FED7AA",
              borderLeft: "4px solid #F97316",
              borderRadius: 12,
              padding: "12px 16px",
              textAlign: "left",
              marginBottom: 20,
            }}>
              <p style={{
                fontSize: 13,
                color: "#92400E",
                lineHeight: 1.6,
                margin: 0,
              }}>
                El equipo de orientación revisará tus respuestas
                con atención especial y te contactará pronto.
              </p>
            </div>
          )}

          {/* Pie */}
          <p style={{
            fontSize: 12,
            color: "#9CA3AF",
            margin: 0,
            lineHeight: 1.5,
          }}>
            Tus respuestas son completamente confidenciales.<br />
            Puedes cerrar esta ventana.
          </p>
        </div>
      </div>

      {/* Marca inferior */}
      <p style={{
        marginTop: 20,
        fontSize: 12,
        color: "rgba(255,255,255,0.45)",
        textAlign: "center",
      }}>
        Sistema PsicoScan ML · CECyTEN Plantel Tepic
      </p>

      <style>{`
        @media (max-width: 480px) {
          .gracias-header { padding: 16px 20px !important; }
          .gracias-body   { padding: 24px 20px 20px !important; }
        }
        @media (max-width: 360px) {
          .gracias-header { padding: 14px 16px !important; }
          .gracias-body   { padding: 20px 16px 18px !important; }
        }
      `}</style>
    </div>
  )
}
