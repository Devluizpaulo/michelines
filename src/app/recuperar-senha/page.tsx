"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase/config"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RecuperarSenhaPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isFirebaseReady, setIsFirebaseReady] = useState(false)

  useEffect(() => {
    if (auth) {
      setIsFirebaseReady(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFirebaseReady) {
      setError("Sistema de autenticação ainda não está pronto. Por favor, tente novamente.")
      return
    }

    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess(true)
    } catch (err: any) {
      console.error(err)
      if (err.code === "auth/user-not-found") {
        setError("Nenhum usuário correspondente a este e-mail foi encontrado no sistema.")
      } else if (err.code === "auth/invalid-email") {
        setError("O endereço de e-mail inserido é inválido.")
      } else {
        setError("Ocorreu um erro ao tentar enviar o e-mail de recuperação. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex bg-white">
      {/* Lado Esquerdo - Branding (Visível apenas em telas médias para cima) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0A192F] overflow-hidden items-center justify-center">
        {/* Animated glowing orbs */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-blue-600/40 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-yellow-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <Image
            src="/images/logos/logo-grupo-michelines-banner.png"
            alt="Logo Grupo Michelines"
            width={300}
            height={100}
            className="mb-8 drop-shadow-2xl object-contain"
            priority
          />
          <h1 className="text-4xl font-black text-white tracking-tight mb-4">
            Acesso por Convite
          </h1>
          <p className="text-xl text-blue-100/80 font-medium max-w-md">
            Defina ou recupere sua senha de acesso ao CRM institucional do Grupo Michelines.
          </p>
        </div>
        
        {/* Glassmorphism info card na base */}
        <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex justify-between items-center shadow-2xl">
          <div>
            <p className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Suporte Técnico</p>
            <p className="text-white text-sm">Precisa de ajuda com o seu convite? Fale com o administrador.</p>
          </div>
          <a href="https://wa.me/5511944830851" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white hover:text-[#0A192F] transition-colors">
              Suporte
            </Button>
          </a>
        </div>
      </div>

      {/* Lado Direito - Formulário de Recuperação */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-gray-50 relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <Link href="/">
            <Image
              src="/images/logos/logo-grupo-michelines.png"
              alt="Logo Grupo Michelines"
              width={120}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Recuperar senha / Convite
            </h2>
            <p className="text-gray-500 font-medium text-justify">
              Insira o e-mail corporativo cadastrado ou no qual você recebeu o convite para configurar sua senha de acesso.
            </p>
          </div>

          <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              {success ? (
                <div className="space-y-6 py-4 text-center">
                  <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-xs">
                    <CheckCircle2 className="h-6 w-6 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-800">E-mail de convite enviado!</h3>
                    <p className="text-sm text-slate-500 font-semibold leading-relaxed text-justify">
                      Enviamos um e-mail com as instruções para redefinição ou criação de senha para <strong className="text-slate-700">{email}</strong>.
                    </p>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed text-justify">
                      Caso não receba nos próximos minutos, por favor cheque sua caixa de Spam ou Lixo Eletrônico.
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push("/login")} 
                    className="w-full h-12 text-base font-bold bg-[#0A192F] hover:bg-[#112240] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Ir para a página de Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-semibold">Email cadastrado / convidado</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        placeholder="nome@grupomichelines.com.br"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all pl-11"
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">⚠️</span>
                      <p className="text-justify">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-bold bg-[#0A192F] hover:bg-[#112240] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" 
                    disabled={loading || !isFirebaseReady}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando instruções...
                      </span>
                    ) : (
                      "Enviar Link de Recuperação / Acesso"
                    )}
                  </Button>
                </form>
              )}

              {!success && (
                <div className="mt-6 text-center border-t border-gray-100 pt-4">
                  <Link href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1.5">
                    <ArrowLeft className="h-4 w-4" /> Voltar para o login
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors inline-flex items-center gap-1">
              ← Voltar para o site institucional
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
