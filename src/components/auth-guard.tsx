"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../app/firebase/config"

/**
 * Porteiro das rotas de /admin: só renderiza o painel com uma sessão do Firebase.
 * A autorização fina (papel, perfil ativo) fica no AuthContext e nas regras do
 * Firestore — aqui é apenas o corte entre "logado" e "não logado".
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "authenticated" | "error">("checking")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!auth) {
      setError("Erro ao inicializar o sistema de autenticação")
      setStatus("error")
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          setStatus("authenticated")
        } else {
          // Sem exceção para localhost: liberar o painel em dev mascara bugs de
          // autenticação e é fácil de esquecer ligado ao publicar.
          setStatus("checking")
          router.replace("/login")
        }
      },
      (err) => {
        console.error("Erro na autenticação:", err)
        setError("Ocorreu um erro na verificação de autenticação")
        setStatus("error")
      }
    )

    return () => unsubscribe()
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
