import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { Rol } from "@/lib/enums"

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",      type: "email"    },
        password: { label: "Contrasena", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        let user
        try {
          user = await prisma.usuario.findUnique({
            where: { email: credentials.email },
          })
        } catch (e) {
          console.error("[auth] Error al consultar DB:", e)
          return null
        }

        if (!user) {
          console.warn("[auth] Usuario no encontrado:", credentials.email)
          return null
        }

        const passwordOk = await bcrypt.compare(credentials.password, user.password)
        if (!passwordOk) {
          console.warn("[auth] Contraseña incorrecta para:", credentials.email)
          return null
        }

        return {
          id:           user.id,
          email:        user.email,
          name:         user.nombre,
          rol:          user.rol,
          estudianteId: user.estudianteId,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.rol          = (user as { rol: Rol }).rol
        token.estudianteId = (user as { estudianteId: string | null }).estudianteId
      }
      return token
    },
    session({ session, token }) {
      session.user.rol          = token.rol as Rol
      session.user.estudianteId = token.estudianteId as string | null
      return session
    },
  },
}
