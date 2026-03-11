"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { crearUsuario, actualizarUsuario, eliminarUsuario } from "@/lib/actions/usuario"

type UsuarioDto = {
  id:       string
  nombre:   string
  email:    string
  rol:      string
  creadoEn: string
}

const ROL_META: Record<string, { label: string; bg: string; color: string; border: string; avatar: string }> = {
  ADMIN:      { label: "Admin",       bg: "rgba(13,71,90,0.08)",   color: "#0D475A", border: "rgba(13,71,90,0.2)",   avatar: "#0D475A" },
  PSICOLOGO:  { label: "Psicóloga/o", bg: "rgba(42,191,191,0.12)", color: "#1A7A8A", border: "rgba(42,191,191,0.3)", avatar: "#1A7A8A" },
  DIRECTOR:   { label: "Director",    bg: "rgba(26,122,138,0.1)",  color: "#0D475A", border: "rgba(26,122,138,0.25)",avatar: "#2ABFBF" },
  ORIENTADOR: { label: "Orientador",  bg: "rgba(246,173,85,0.12)", color: "#975a16", border: "rgba(246,173,85,0.3)", avatar: "#b45309" },
}

const ROLES_STAFF = ["PSICOLOGO", "ADMIN", "DIRECTOR", "ORIENTADOR"]

function iniciales(nombre: string) {
  return nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

// ── Modal crear / editar ─────────────────────────────────────────────────────
function ModalUsuario({
  usuario, onClose, onSave, loading, error,
}: {
  usuario: UsuarioDto | null
  onClose: () => void
  onSave: (d: { nombre: string; email: string; rol: string; password: string }) => void
  loading: boolean
  error: string
}) {
  const [nombre,   setNombre]   = useState(usuario?.nombre ?? "")
  const [email,    setEmail]    = useState(usuario?.email  ?? "")
  const [rol,      setRol]      = useState(usuario?.rol    ?? "PSICOLOGO")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "white", borderRadius: 16,
        width: "100%", maxWidth: 440,
        padding: 28,
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0D475A", margin: "0 0 2px" }}>
              {usuario ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              {usuario ? "Modifica los datos del usuario" : "Completa los datos para crear la cuenta"}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", cursor: "pointer",
            width: 32, height: 32, borderRadius: 8,
            fontSize: 18, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); onSave({ nombre, email, rol, password }) }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Nombre */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Nombre completo
            </label>
            <input
              value={nombre} onChange={e => setNombre(e.target.value)}
              required placeholder="Ej. María García López"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px", borderRadius: 8,
                border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
              }}
            />
          </div>

          {/* Usuario */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Usuario
            </label>
            <input
              type="text" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="Nombre de usuario"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px", borderRadius: 8,
                border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
              }}
            />
          </div>

          {/* Rol */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Rol
            </label>
            <select
              value={rol} onChange={e => setRol(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 12px", borderRadius: 8,
                border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
                background: "white", cursor: "pointer",
              }}
            >
              {ROLES_STAFF.map(r => (
                <option key={r} value={r}>{ROL_META[r].label}</option>
              ))}
            </select>
          </div>

          {/* Contraseña */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              {usuario ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password} onChange={e => setPassword(e.target.value)}
                required={!usuario} placeholder={usuario ? "••••••••" : "Mínimo 6 caracteres"}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 40px 10px 12px", borderRadius: 8,
                  border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
                }}
              />
              <button
                type="button" onClick={() => setShowPass(s => !s)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
                  fontSize: 16, padding: 0, lineHeight: 1,
                }}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "10px", borderRadius: 8,
              border: "1.5px solid #e2e8f0", background: "white",
              fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#374151",
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: "10px", borderRadius: 8, border: "none",
              background: loading ? "#1A7A8A" : "#0D475A",
              color: "white", fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Guardando…" : usuario ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal confirmar eliminar ──────────────────────────────────────────────────
function ModalEliminar({
  usuario, onClose, onConfirm, loading,
}: {
  usuario: UsuarioDto
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "white", borderRadius: 16,
        width: "100%", maxWidth: 400,
        padding: 28,
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      }}>
        {/* Icono advertencia */}
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: "#fef2f2", margin: "0 auto 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0D475A", textAlign: "center", margin: "0 0 8px" }}>
          Eliminar usuario
        </h3>
        <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", margin: "0 0 6px" }}>
          ¿Estás segura de que deseas eliminar a
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0D475A", textAlign: "center", margin: "0 0 20px" }}>
          {usuario.nombre}
        </p>
        <p style={{ fontSize: 12, color: "#ef4444", textAlign: "center", margin: "0 0 24px" }}>
          Esta acción no se puede deshacer.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", borderRadius: 8,
            border: "1.5px solid #e2e8f0", background: "white",
            fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#374151",
          }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} style={{
            flex: 1, padding: "10px", borderRadius: 8, border: "none",
            background: loading ? "#fca5a5" : "#dc2626",
            color: "white", fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Eliminando…" : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function UsuariosContent({
  usuarios,
  sesionEmail,
}: {
  usuarios:     UsuarioDto[]
  sesionEmail:  string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalUsuario,      setModalUsuario]      = useState<UsuarioDto | "nuevo" | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<UsuarioDto | null>(null)
  const [error, setError] = useState("")

  function handleSave(data: { nombre: string; email: string; rol: string; password: string }) {
    setError("")
    startTransition(async () => {
      try {
        if (modalUsuario === "nuevo") {
          await crearUsuario(data)
        } else if (modalUsuario) {
          await actualizarUsuario(modalUsuario.id, data)
        }
        setModalUsuario(null)
        router.refresh()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al guardar")
      }
    })
  }

  function handleEliminar() {
    if (!confirmarEliminar) return
    setError("")
    startTransition(async () => {
      try {
        await eliminarUsuario(confirmarEliminar.id)
        setConfirmarEliminar(null)
        router.refresh()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al eliminar")
        setConfirmarEliminar(null)
      }
    })
  }

  // Agrupar por rol para el resumen
  const porRol = ROLES_STAFF.map(r => ({
    rol: r,
    count: usuarios.filter(u => u.rol === r).length,
  })).filter(r => r.count > 0)

  return (
    <div style={{ paddingTop: 8 }}>

      {/* ── Encabezado ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", flexWrap: "wrap",
        gap: 16, marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D475A", margin: "0 0 4px" }}>
            Usuarios
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            {usuarios.length} {usuarios.length === 1 ? "usuario registrado" : "usuarios registrados"} · CECyTEN Tepic
          </p>
        </div>
        <button
          onClick={() => { setError(""); setModalUsuario("nuevo") }}
          style={{
            background: "#0D475A", color: "white", border: "none",
            borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* ── Resumen por rol ── */}
      <div style={{
        display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24,
      }}>
        {porRol.map(({ rol, count }) => {
          const m = ROL_META[rol]
          return (
            <div key={rol} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: m.bg, border: `1px solid ${m.border}`,
              borderRadius: 8, padding: "8px 14px",
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: "50%",
                background: m.avatar, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "white",
              }}>
                {count}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>
                {m.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Error global ── */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b",
          borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, fontWeight: 500,
        }}>
          {error}
        </div>
      )}

      {/* ── Tabla ── */}
      <div style={{
        background: "white", borderRadius: 14,
        border: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 560 }}>
        {/* Encabezado */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr 1fr 100px",
          padding: "10px 20px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}>
          {["Usuario", "Nombre de usuario", "Rol", "Alta", ""].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 700, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Filas */}
        {usuarios.map((u, i) => {
          const m   = ROL_META[u.rol]
          const soy = u.email === sesionEmail
          return (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr 100px",
                padding: "14px 20px",
                borderBottom: i < usuarios.length - 1 ? "1px solid #f1f5f9" : "none",
                alignItems: "center",
              }}
            >
              {/* Nombre + avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: m.avatar, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "white",
                }}>
                  {iniciales(u.nombre)}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0D475A", margin: 0 }}>
                    {u.nombre}
                    {soy && (
                      <span style={{
                        marginLeft: 6, fontSize: 10, fontWeight: 700,
                        background: "#ede9fe", color: "#5b21b6",
                        borderRadius: 4, padding: "1px 6px",
                      }}>
                        Tú
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Email */}
              <span style={{ fontSize: 13, color: "#64748b" }}>{u.email}</span>

              {/* Rol badge */}
              <span style={{
                display: "inline-flex", alignItems: "center",
                background: m.bg, color: m.color,
                border: `1px solid ${m.border}`,
                borderRadius: 20, padding: "3px 10px",
                fontSize: 11, fontWeight: 700, width: "fit-content",
              }}>
                {m.label}
              </span>

              {/* Fecha alta */}
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                {new Date(u.creadoEn).toLocaleDateString("es-MX", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>

              {/* Acciones */}
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => { setError(""); setModalUsuario(u) }}
                  style={{
                    fontSize: 11, fontWeight: 600, padding: "5px 10px",
                    borderRadius: 6, cursor: "pointer",
                    background: "#f8fafc", color: "#374151",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  Editar
                </button>
                {!soy && (
                  <button
                    onClick={() => setConfirmarEliminar(u)}
                    style={{
                      fontSize: 11, fontWeight: 600, padding: "5px 10px",
                      borderRadius: 6, cursor: "pointer",
                      background: "#fff1f2", color: "#9f1239",
                      border: "1px solid #fecdd3",
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {usuarios.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontWeight: 600, fontSize: 14, margin: 0 }}>
              No hay usuarios registrados.
            </p>
          </div>
        )}
        </div>{/* minWidth */}
        </div>{/* overflowX */}
      </div>

      {/* ── Modales ── */}
      {modalUsuario !== null && (
        <ModalUsuario
          usuario={modalUsuario === "nuevo" ? null : modalUsuario}
          onClose={() => setModalUsuario(null)}
          onSave={handleSave}
          loading={isPending}
          error={error}
        />
      )}

      {confirmarEliminar && (
        <ModalEliminar
          usuario={confirmarEliminar}
          onClose={() => setConfirmarEliminar(null)}
          onConfirm={handleEliminar}
          loading={isPending}
        />
      )}
    </div>
  )
}
