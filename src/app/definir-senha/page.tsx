"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react"
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth"
import { auth } from "../firebase/config"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DefinirSenhaPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [tempPassword, setTempPassword] = useState("")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isFirebaseReady, setIsFirebaseReady] = useState(false)

  useEffect(() => {
    if (auth) {
      setIsFirebaseReady(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const emailParam = params.get("email")
      const tempParam = params.get("temp")
      if (emailParam) setEmail(emailParam)
      if (tempParam) setTempPassword(tempParam)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFirebaseReady) {
      setError("Sistema de autenticação ainda não está pronto. Por favor, tente novamente.")
      return
    }

    if (!email || !tempPassword) {
      setError("Link de convite inválido ou incompleto. Solicite um novo link ao administrador.")
      return
    }

    if (password.length !== 6) {
      setError("A senha deve ter exatamente 6 dígitos.")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      // 1. Faz o login silencioso usando as credenciais temporárias do link
      const userCredential = await signInWithEmailAndPassword(auth, email, tempPassword)
      
      // 2. Atualiza a senha para a nova senha de 6 dígitos definida pelo usuário
      if (userCredential.user) {
        await updatePassword(userCredential.user, password)
        setSuccess(true)
        
        // 3. Aguarda 1.5s e redireciona direto para o painel
        setTimeout(() => {
          router.push("/admin")
        }, 1500)
      }
    } catch (err: any) {
      console.error("Erro ao definir senha:", err)
      if (err.code === "auth/wrong-password") {
        setError("O link de convite já foi utilizado ou expirou. Solicite um novo convite.")
      } else if (err.code === "auth/user-not-found") {
        setError("Nenhum usuário correspondente a este convite foi encontrado.")
      } else {
        setError(err.message || "Ocorreu um erro ao definir sua senha. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex bg-white select-none">
      {/* Lado Esquerdo - Branding */}
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
            Definir Senha
          </h1>
          <p className="text-xl text-blue-100/80 font-medium max-w-md">
            Defina sua senha numérica de 6 dígitos para ativar seu acesso ao CRM do Grupo Michelines.
          </p>
        </div>
        
        {/* Glassmorphism info card */}
        <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex justify-between items-center shadow-2xl">
          <div>
            <p className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Suporte ao Acesso</p>
            <p className="text-white text-sm">Problemas na definição de senha? Fale com a TI.</p>
          </div>
          <a href="https://wa.me/5511944830851" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white hover:text-[#0A192F] transition-colors">
              Suporte
            </Button>
          </a>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
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
              Primeiro Acesso
            </h2>
            <p className="text-gray-500 font-medium">
              Crie uma senha de acesso fácil e segura com exatamente 6 dígitos.
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
                    <h3 className="text-lg font-black text-slate-800">Senha ativada com sucesso!</h3>
                    <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                      Sua senha foi registrada. Redirecionando você para o painel operacional...
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sky-600 font-bold text-sm animate-pulse">
                    <span>Acessando painel</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-gray-500 font-semibold text-xs">Email Convidado</Label>
                    <Input
                      type="email"
                      value={email}
                      disabled
                      className="h-11 rounded-xl bg-slate-100 border-gray-200 text-gray-400 font-medium select-none cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-gray-700 font-semibold">Nova Senha (6 dígitos)</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        maxLength={6}
                        placeholder="Ex: 123456"
                        value={password}
                        onChange={(e) => setPassword(e.target.value.replace(/\D/g, ""))}
                        className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all pr-12 text-center text-lg font-mono tracking-widest"
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
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">Confirme a Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        maxLength={6}
                        placeholder="Ex: 123456"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, ""))}
                        className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all pr-12 text-center text-lg font-mono tracking-widest"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-gray-600 rounded-lg"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                        Definindo Senha...
                      </span>
                    ) : (
                      "Ativar Acesso"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
              ← Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
