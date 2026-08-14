"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

/**
 * Porteiro das rotas de /admin: só renderiza o painel com uma sessão ativa do Supabase.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "authenticated" | "error">("checking")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        console.error("Erro na verificação de sessão:", sessionError)
        setError("Ocorreu um erro na verificação de autenticação")
        setStatus("error")
        return
      }

      if (session?.user) {
        setStatus("authenticated")
      } else {
        setStatus("checking")
        router.replace("/login")
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setStatus("authenticated")
      } else {
        setStatus("checking")
        router.replace("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="h-11 rounded-xl bg-sky-600 px-5 text-sm font-bold text-white transition-colors hover:bg-sky-700"
        >
          Voltar para o login
        </button>
      </div>
    )
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          role="status"
          aria-label="Verificando autenticação"
          className="h-12 w-12 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"
        />
      </div>
    )
  }

  return <>{children}</>
}
