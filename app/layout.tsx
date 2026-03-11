import type { Metadata } from "next"
import { DM_Sans, Syne } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "700"],
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
})

export const metadata: Metadata = {
  title: "PsicoScan ML — CECyTEN Tepic",
  description: "Sistema de bienestar estudiantil con tamizaje SENA y clasificación ML",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} ${syne.variable}`}>
        {children}
      </body>
    </html>
  )
}
