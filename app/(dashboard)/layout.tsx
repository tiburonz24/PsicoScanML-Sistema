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
    <div className="flex h-screen bg-[#f5f3ff]">
      <NavShell
        rol={session.user.rol}
        nombre={session.user.name ?? undefined}
      />
      {/* pt-14 en mobile para compensar la barra superior fija */}
      <main className="flex-1 overflow-y-auto p-4 pt-18 lg:p-6 lg:pt-6">
        {children}
      </main>
    </div>
  )
}
