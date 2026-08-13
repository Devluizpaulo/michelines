import type React from "react"
import type { Metadata, Viewport } from "next"
import AuthGuard from "@/components/auth-guard"
import { AdminPWA } from "@/components/admin/shared/AdminPWA"

/**
 * O PWA vive apenas aqui. O site institucional continua sendo um site comum:
 * o manifest é declarado neste layout (e não no root), e o service worker é
 * registrado pelo <AdminPWA/> com escopo restrito a /admin.
 */
export const metadata: Metadata = {
  title: {
    default: "Intranet — Grupo Michelines",
    template: "%s | Intranet Michelines",
  },
  description: "Painel de gestão comercial e operacional do Grupo Michelines.",
  manifest: "/admin.webmanifest",
  applicationName: "Michelines Intranet",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Intranet",
  },
  icons: {
    icon: [
      { url: "/icons/admin-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/admin-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/admin-apple-180.png", sizes: "180x180", type: "image/png" }],
  },
  // O painel é privado: nunca deve ser indexado.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  // `viewportFit: cover` habilita as env(safe-area-inset-*) usadas no layout
  // quando o app roda instalado, em tela cheia.
  viewportFit: "cover",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      {children}
      <AdminPWA />
    </AuthGuard>
  )
}
