import type React from "react"
import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import WhatsAppNotification from "@/components/whatsapp-notification"
import { ToastProvider } from "@/components/ui/toast-simple"

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  // Sem `maximumScale`/`userScalable`: travar o zoom quebra a acessibilidade
  // e faz o iOS ampliar a página sozinho ao focar inputs pequenos.
}

export const metadata: Metadata = {
  title: "Grupo Michelines - 45 Anos de Tradição em Táxis",
  description: "Empresa especializada em locação de táxis para motoristas que desejam ingressar nesta nobre profissão.",
  icons: {
    icon: "/images/logos/logo-grupo-michelines.png",
    apple: "/images/logos/logo-grupo-michelines.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          {children}
          <WhatsAppNotification />
        </ToastProvider>
      </body>
    </html>
  )
}
