"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase/config"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isFirebaseReady, setIsFirebaseReady] = useState(false)

  useEffect(() => {
    // Verificar se o Firebase Auth está pronto
    if (auth) {
      setIsFirebaseReady(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFirebaseReady) {
      setError("Sistema de autenticação ainda não está pronto. Por favor, tente novamente em alguns instantes.")
      return
    }

    setError("")
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/admin")
    } catch (error) {
      setError("Falha na autenticação. Verifique suas credenciais.")
      console.error(error)
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
            Gestão Operacional
          </h1>
          <p className="text-xl text-blue-100/80 font-medium max-w-md">
            Acesso exclusivo para controle de frota, motoristas e corridas do Grupo Michelines.
          </p>
        </div>
        
        {/* Glassmorphism info card na base */}
        <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex justify-between items-center shadow-2xl">
          <div>
            <p className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Suporte Técnico</p>
            <p className="text-white text-sm">Problemas com o acesso? Contate a equipe de TI.</p>
          </div>
          <Button variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white hover:text-[#0A192F] transition-colors">
            Solicitar Ajuda
          </Button>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
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
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bem-vindo de volta</h2>
            <p className="text-gray-500 font-medium">Insira suas credenciais para acessar o painel administrativo.</p>
          </div>

          <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-semibold">Email corporativo</Label>
                  <Input
                    id="email"
                    placeholder="admin@grupomichelines.com.br"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 font-semibold">Senha</Label>
                    <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-gray-600 rounded-lg"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">⚠️</span>
                    <p>{error}</p>
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
                      Autenticando...
                    </span>
                  ) : "Entrar no Sistema"}
                </Button>
              </form>
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
