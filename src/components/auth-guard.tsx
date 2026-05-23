"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../app/firebase/config"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar se o Firebase Auth está inicializado
    if (!auth) {
      setError("Erro ao inicializar o sistema de autenticação")
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          router.push("/login")
        } else {
          setLoading(false)
        }
      },
      (error) => {
        console.error("Erro na autenticação:", error)
        setError("Ocorreu um erro na verificação de autenticação")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [router])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Voltar para o login
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return <>{children}</>
}
