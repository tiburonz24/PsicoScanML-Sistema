import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Rol } from "@/lib/enums"

const USUARIOS_MOCK = [
  { id: "u-1", email: "psicologo@cecyten.edu.mx", password: "psico123", nombre: "Psicologa Demo",  rol: Rol.PSICOLOGO,  estudianteId: null },
  { id: "u-2", email: "admin@cecyten.edu.mx",     password: "admin123", nombre: "Admin Demo",      rol: Rol.ADMIN,      estudianteId: null },
  { id: "u-3", email: "director@cecyten.edu.mx",  password: "dir123",   nombre: "Director Demo",   rol: Rol.DIRECTOR,   estudianteId: null },
  { id: "u-4", email: "estudiante@cecyten.edu.mx",password: "est123",   nombre: "G. F. H.",        rol: Rol.ESTUDIANTE, estudianteId: "est-1" },
]

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

        const user = USUARIOS_MOCK.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        )
        if (!user) return null

        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          rol: user.rol,
          estudianteId: user.estudianteId,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.rol = (user as { rol: Rol }).rol
        token.estudianteId = (user as { estudianteId: string | null }).estudianteId
      }
      return token
    },
    session({ session, token }) {
      session.user.rol = token.rol as Rol
      session.user.estudianteId = token.estudianteId as string | null
      return session
    },
  },
}
