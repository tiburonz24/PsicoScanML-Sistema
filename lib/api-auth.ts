import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { Rol } from "@/lib/enums"

type AuthOk = { ok: true; session: NonNullable<Awaited<ReturnType<typeof getServerSession>>> }
type AuthFail = { ok: false; response: NextResponse }

/**
 * Verifica sesión y rol en API routes.
 * Uso:
 *   const auth = await requireSession([Rol.ADMIN])
 *   if (!auth.ok) return auth.response
 */
export async function requireSession(roles?: Rol[]): Promise<AuthOk | AuthFail> {
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    }
  }

  if (roles && !roles.includes(session.user.rol as Rol)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }),
    }
  }

  return { ok: true, session }
}
