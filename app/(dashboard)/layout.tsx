import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import NavShell from "@/components/ui/NavShell"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <NavShell
        rol={session.user.rol}
        nombre={session.user.name ?? undefined}
      />
      {/* pt-14 para compensar la barra superior fija */}
      <main className="pt-14 p-4 lg:p-8 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  )
}
