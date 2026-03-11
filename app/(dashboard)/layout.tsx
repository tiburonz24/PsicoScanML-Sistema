import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import NavShell from "@/components/ui/NavShell"
import Image from "next/image"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F4F8FA", position: "relative", overflow: "hidden" }}>

      {/* Marca de agua — logo como gota de fondo */}
      <div style={{
        position: "fixed",
        bottom: "-80px",
        right: "-80px",
        width: 520,
        height: 520,
        opacity: 0.045,
        pointerEvents: "none",
        zIndex: 0,
        userSelect: "none",
      }}>
        <Image
          src="/logo.png"
          alt=""
          fill
          sizes="520px"
          style={{ objectFit: "contain" }}
          priority={false}
        />
      </div>

      <NavShell rol={session.user.rol} nombre={session.user.name ?? undefined} />
      <style>{`
        @media (min-width: 1024px) { .psico-main { margin-left: 240px; padding: 32px; } }
        @media (max-width: 1023px)  { .psico-main { padding-top: 56px; padding: 56px 16px 16px; } }
        .psico-main { position: relative; z-index: 1; }
      `}</style>
      <main className="psico-main">
        {children}
      </main>
    </div>
  )
}
