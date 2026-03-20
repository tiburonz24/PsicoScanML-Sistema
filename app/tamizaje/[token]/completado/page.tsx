import Image from "next/image"

export default function TamizajeCompletadoPage() {
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

      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "white",
        borderRadius: 24,
        boxShadow: "0 24px 64px rgba(13,71,90,0.35)",
        overflow: "hidden",
      }}>

        {/* Barra superior verde */}
        <div style={{ height: 5, background: "#16a34a" }} />

        {/* Header con logo */}
        <div className="completado-header" style={{
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
        <div className="completado-body" style={{ padding: "32px 28px 28px", textAlign: "center" }}>

          {/* Ícono éxito */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#f0fdf4",
            border: "2px solid #bbf7d0",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                 stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1 style={{
            fontSize: 22, fontWeight: 800, color: "#0D475A",
            margin: "0 0 10px", lineHeight: 1.2,
          }}>
            ¡Cuestionario enviado!
          </h1>

          <p style={{
            fontSize: 14, color: "#4B5563",
            lineHeight: 1.7, margin: "0 0 24px",
          }}>
            Gracias por completar el cuestionario. Tus respuestas han sido
            registradas de forma segura y confidencial.
          </p>

          <div style={{ height: 1, background: "#E5E7EB", margin: "0 0 20px" }} />

          <div style={{
            background: "#F0F9FF",
            border: "1px solid #BAE6FD",
            borderLeft: "4px solid #0D475A",
            borderRadius: 12,
            padding: "14px 16px",
            textAlign: "left",
            marginBottom: 20,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0D475A", margin: "0 0 5px" }}>
              Recuerda que no estás solo/a
            </p>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0 }}>
              Si sientes que necesitas hablar con alguien, acércate al
              departamento de orientación o psicología de tu plantel.
            </p>
          </div>

          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, lineHeight: 1.5 }}>
            Tus respuestas son completamente confidenciales.<br />
            Puedes cerrar esta ventana.
          </p>
        </div>
      </div>

      <p style={{
        marginTop: 20, fontSize: 12,
        color: "rgba(255,255,255,0.45)", textAlign: "center",
      }}>
        Sistema PsicoScan ML · CECyTEN Plantel Tepic
      </p>

      <style>{`
        @media (max-width: 480px) {
          .completado-header { padding: 16px 20px !important; }
          .completado-body   { padding: 24px 20px 20px !important; }
        }
        @media (max-width: 360px) {
          .completado-header { padding: 14px 16px !important; }
          .completado-body   { padding: 20px 16px 18px !important; }
        }
      `}</style>
    </div>
  )
}
