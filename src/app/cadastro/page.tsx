"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, CheckCircle2, Loader2, Phone, User, ShieldCheck, Check, Clock,
  Car, Sparkles, Key, Plane, Battery, Crown
} from "lucide-react"
import { listVehicles } from "@/lib/db/vehicles"
import { createLead } from "@/lib/db/leads"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CadastroPage() {
  const [step, setStep] = useState(1)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [protocol, setProtocol] = useState("")
  const [campaignId, setCampaignId] = useState("")
  const [campaignName, setCampaignName] = useState("")

  const [formData, setFormData] = useState({
    situation: "", // "taxista" | "futuro_taxista"
    fullName: "",
    whatsapp: "",
    
    // Flow A: Já sou taxista
    hasCondutax: "", // "sim" | "nao" | "renovacao"
    hasOwnAlvara: "", // "sim" | "nao"
    workedInFleet: "", // "sim" | "nao"
    fleetName: "",
    fleetDuration: "",
    experienceYears: "", // "menos_1" | "1_3" | "3_5" | "mais_5"
    interestOper: "Ainda avaliando",
    vehicleInterest: "",

    // Flow B: Quero me tornar taxista
    hasCnh: "", // "sim" | "nao"
    cnhCategory: "", // "B" | "C" | "D" | "E"
    hasEar: "", // "sim" | "nao"
    condutaxProcess: "", // "sim" | "nao" | "nao_sei"
    needsHelpWith: [] as string[],
    passengerExperience: "", // "app" | "particular" | "entregas" | "nenhuma"

    // Preferences (Both).
    // Forma de pagamento e ciclo de contratação foram removidos do formulário:
    // são tema da negociação com o atendente, não do primeiro contato.
    preferredContactTime: "", // "manha" | "tarde" | "noite"
  })

  // Sugestões de veículo. Busca única, não listener: o catálogo muda raramente
  // e um visitante preenchendo o formulário não precisa de tempo real.
  useEffect(() => {
    let cancelado = false

    listVehicles()
      .then((lista) => {
        if (cancelado) return
        setVehicles(lista.filter((v: any) => v.status === "active" && v.available))
      })
      .catch((err) => {
        // Sem catálogo o campo continua livre para digitar — não bloqueia o cadastro
        console.warn("Não foi possível carregar a frota:", err)
      })
      .finally(() => {
        if (!cancelado) setLoadingVehicles(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  // Atribuição de campanha: lida na URL (vinda de /c/{slug}) e guardada por 30
  // dias. Em sessionStorage a atribuição morria ao fechar a aba — quem via o
  // story hoje e se cadastrava amanhã chegava sem origem.
  useEffect(() => {
    if (typeof window === "undefined") return

    const STORAGE_KEY = "michelines_attribution"
    const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

    const params = new URLSearchParams(window.location.search)
    let cId = params.get("campaignId") || params.get("utm_campaign_id") || ""
    let cName = params.get("campaignName") || params.get("utm_campaign") || ""
    const carInterest = params.get("vehicle") || params.get("vehicleInterest") || ""

    try {
      if (cId) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ id: cId, name: cName, at: Date.now() })
        )
      } else {
        const saved = window.localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed?.id && Date.now() - (parsed.at ?? 0) < MAX_AGE_MS) {
            cId = parsed.id
            cName = parsed.name || ""
          } else {
            window.localStorage.removeItem(STORAGE_KEY)
          }
        }
      }
    } catch (e) {
      // Modo privado ou storage cheio: seguimos só com o que veio na URL
      console.warn("Atribuição de campanha não pôde ser persistida:", e)
    }

    setCampaignId(cId)
    setCampaignName(cName)

    if (carInterest) {
      setFormData((prev) => ({ ...prev, vehicleInterest: carInterest }))
    }
  }, [])

  // Input Formatting Masks
  const formatPhone = (value: string) => {
    const clean = value.replace(/\D/g, "")
    if (clean.length <= 2) return clean
    if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
    if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    let formattedValue = value

    if (id === "whatsapp") {
      formattedValue = formatPhone(value)
    }

    setFormData((prev) => ({
      ...prev,
      [id]: formattedValue,
    }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleDirectSelect = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleCheckboxToggle = (id: string) => {
    setFormData((prev) => {
      let updatedList = [...prev.needsHelpWith]
      if (id === "Todos os itens acima") {
        if (updatedList.includes(id)) {
          updatedList = []
        } else {
          updatedList = [id]
        }
      } else {
        updatedList = updatedList.filter(item => item !== "Todos os itens acima")
        if (updatedList.includes(id)) {
          updatedList = updatedList.filter(item => item !== id)
        } else {
          updatedList.push(id)
        }
      }
      return { ...prev, needsHelpWith: updatedList }
    })
  }

  const handleProfileSelect = (profile: string) => {
    setFormData((prev) => ({
      ...prev,
      situation: profile
    }))
    setStep(2)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /** Última etapa do formulário (o passo 1 é a escolha de perfil). */
  const LAST_STEP = 3

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < LAST_STEP) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Generate Protocol: MIC-2026-XXXXXX
    const cleanRandomDigits = Math.floor(100000 + Math.random() * 900000)
    const generatedProtocol = `MIC-2026-${cleanRandomDigits}`
    setProtocol(generatedProtocol)

    // Calculate Lead Score based on business rules
    let score = 20
    if (formData.situation === "taxista") {
      score = formData.hasCondutax === "sim" ? 95 : 70
    } else if (formData.situation === "futuro_taxista") {
      score = formData.hasEar === "sim" ? 60 : 40
    }

    try {
      // CPF, e-mail e endereço não são mais coletados na captação: o atendente
      // preenche pela ficha do painel. Os campos seguem no documento como vazios
      // para não quebrar telas e relatórios que já os leem.
      const leadPayload = {
        fullName: formData.fullName,
        phone: formData.whatsapp,
        whatsapp: formData.whatsapp,
        email: "",
        cpf: "",
        cep: "",
        address: "",

        situation: formData.situation,
        hasCondutax: formData.situation === "taxista" ? formData.hasCondutax : "",
        hasOwnAlvara: formData.situation === "taxista" ? formData.hasOwnAlvara : "",
        workedInFleet: formData.situation === "taxista" ? formData.workedInFleet : "",
        fleetName: formData.situation === "taxista" && formData.workedInFleet === "sim" ? formData.fleetName : "",
        fleetDuration: formData.situation === "taxista" && formData.workedInFleet === "sim" ? formData.fleetDuration : "",
        experienceYears: formData.situation === "taxista" ? formData.experienceYears : "",
        
        hasCnh: formData.situation === "futuro_taxista" ? formData.hasCnh : "",
        cnhCategory: formData.situation === "futuro_taxista" ? formData.cnhCategory : "",
        hasEar: formData.situation === "futuro_taxista" ? formData.hasEar : "",
        condutaxProcess: formData.situation === "futuro_taxista" ? formData.condutaxProcess : "",
        needsHelpWith: formData.situation === "futuro_taxista" ? formData.needsHelpWith : [],
        passengerExperience: formData.situation === "futuro_taxista" ? formData.passengerExperience : "",
        
        operationInterest: formData.interestOper,
        // Campo livre e opcional: sem resposta, o atendente define na conversa
        vehicleInterest: formData.vehicleInterest.trim() || "A definir",
        preferredContactTime: formData.preferredContactTime,

        score,
        protocol: generatedProtocol,
        
        status: "new" as const,
        approvalStatus: "pending" as const,
        source: "Cadastro Site",
        notes: `Smart Funnel Lead. Perfil: ${formData.situation === "taxista" ? "Já é Taxista" : "Futuro Taxista"}. Score calculado: ${score} pts. Protocolo: ${generatedProtocol}.`,
        contacted: false,
        whatsappSent: false,
        campaignId: campaignId || "",
        campaignName: campaignName || "",
        // created_at tem default now() no Postgres — não precisa ser enviado
      }

      // 1. Lead do CRM
      await createLead(leadPayload)

      // 2. Espelho na tabela legada de motoristas.
      //    Não bloqueia o cadastro: se falhar, o lead já foi salvo e é o que importa.
      const { error: driverError } = await supabase.from("drivers").insert({
        full_name: formData.fullName,
        whatsapp: formData.whatsapp,
        phone: formData.whatsapp,
        car_model: formData.vehicleInterest.trim() || "A definir",
        status: "pending",
      })
      if (driverError) {
        console.warn("Lead salvo, mas o espelho em drivers falhou:", driverError.message)
      }

      setFormSubmitted(true)
    } catch (error) {
      console.error("Erro ao enviar cadastro do funil:", error)
      alert("Ocorreu um erro ao enviar seu cadastro. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Help selection options list
  const helpOptions = [
    { id: "EAR", label: "EAR (Exerce Atividade Remunerada na CNH)" },
    { id: "Curso de formação", label: "Curso de formação de taxista" },
    { id: "Condutax", label: "Condutax (Emissão/Regularização)" },
    { id: "Licenciamento", label: "Licenciamento / Alvará de Táxi" },
    { id: "Todos os itens acima", label: "Preciso de ajuda em todos os itens acima" }
  ]

  if (formSubmitted) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1b3e72] via-[#23569c] to-[#142d54] text-white">
        <header className="px-4 lg:px-6 h-16 flex items-center border-b border-white/10 bg-black/10 backdrop-blur-sm shadow-sm justify-between">
          <Link className="flex items-center justify-center" href="/">
            <Image
              src="/images/logos/logo-grupo-michelines.png"
              alt="Logo Grupo Michelines"
              width={160}
              height={50}
              className="h-10 w-auto filter brightness-0 invert"
            />
          </Link>
          <Link href="/" className="text-xs font-bold text-sky-200 hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar para Home
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-white/10 shadow-2xl bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden text-slate-800">
            <div className="h-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
            <CardHeader className="text-center pt-8 px-6 sm:px-8">
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4 animate-bounce" />
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                Cadastro Recebido!
              </CardTitle>
              <CardDescription className="text-slate-500 font-semibold mt-2 leading-relaxed text-sm">
                Olá, <strong>{formData.fullName.split(" ")[0]}</strong>! Seu cadastro foi recebido com sucesso pelo Grupo Michelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-6 text-center space-y-5">
              
              {/* Protocol display widget */}
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 space-y-1 select-all">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Número do Protocolo</span>
                <p className="text-base font-black text-slate-800 tracking-wider uppercase">{protocol}</p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed text-justify">
                Nossa equipe realizará uma análise inicial das informações enviadas e entrará em contato no horário informado por você. Guarde seu protocolo de credenciamento.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pb-8 pt-2">
              <Link href="/">
                <Button className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs h-11 px-8 rounded-xl flex items-center gap-1.5 shadow-sm">
                  Retornar ao Site
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>

        <footer className="py-6 border-t border-white/10 bg-black/10 text-center">
          <p className="text-xs text-sky-200/80 font-medium">© 2026 Grupo Michelines. Todos os direitos reservados.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1b3e72] via-[#23569c] to-[#142d54] text-white selection:bg-sky-600 selection:text-white">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-white/10 bg-black/10 backdrop-blur-sm shadow-sm justify-between">
        <Link className="flex items-center justify-center" href="/">
          <Image
            src="/images/logos/logo-grupo-michelines.png"
            alt="Logo Grupo Michelines"
            width={160}
            height={50}
            className="h-10 w-auto filter brightness-0 invert"
          />
        </Link>
        <Link href="/" className="text-xs font-bold text-sky-200 hover:text-white flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Cancelar
        </Link>
      </header>

      <main className="flex-1 py-12 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3.5 py-1 rounded-full">
                Credenciamento Grupo Michelines
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl mt-2">
                Funil Inteligente de Cadastro
              </h1>
              <p className="max-w-[600px] text-sky-200/80 text-xs sm:text-sm font-semibold leading-relaxed mx-auto">
                Preencha os dados operacionais abaixo para iniciar sua análise comercial.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            
            {/* Step Indicators */}
            {step > 1 && (
              <div className="flex justify-between mb-8 relative px-10">
                <div className="absolute top-5 left-12 right-12 h-0.5 bg-white/10 -z-10" />
                {/* Duas etapas: a barra vai de 0% a 100% entre elas */}
                <div
                  className="absolute top-5 left-12 h-0.5 bg-amber-500 -z-10 transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(step - 2, 0), 1) * 100}%` }}
                />

                {[
                  { s: 2, label: "Contato" },
                  { s: 3, label: "Perfil" }
                ].map((item) => (
                  <div key={item.s} className="flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${
                        step >= item.s
                          ? "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                          : "border-white/20 bg-[#142d54] text-sky-200/50"
                      }`}
                    >
                      {step > item.s ? <Check className="h-4 w-4" /> : item.s - 1}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${step >= item.s ? "text-white" : "text-sky-200/40"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Card className="border-white/10 shadow-2xl bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden text-slate-800">
              <div className="h-1.5 bg-amber-500" />
              <CardContent className="pt-8 px-6 sm:px-10">
                
                {/* STEP 1: SITUAÇÃO ATUAL (IDENTIFICAÇÃO DO PERFIL) */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center pb-2">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Qual é a sua situação hoje?</h3>
                      <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                        Escolha o perfil que melhor descreve sua situação profissional para personalizarmos seu atendimento.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <button
                        type="button"
                        onClick={() => handleProfileSelect("taxista")}
                        className="w-full p-6 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-sky-50/70 hover:border-sky-500/35 hover:scale-[1.01] hover:shadow-md text-left flex items-start gap-4 transition-all duration-300 group"
                      >
                        <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50 text-blue-500 shrink-0">
                          <Key className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-black text-slate-900 group-hover:text-sky-800 transition-colors">Já sou taxista</h4>
                          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                            Possuo CNH EAR, Condutax ou alvará ativo e quero alugar um veículo operacional pronto com suporte premium.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProfileSelect("futuro_taxista")}
                        className="w-full p-6 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-amber-50/70 hover:border-amber-500/35 hover:scale-[1.01] hover:shadow-md text-left flex items-start gap-4 transition-all duration-300 group"
                      >
                        <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50 text-amber-500 shrink-0">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">Quero me tornar taxista</h4>
                          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                            Preciso de apoio com CNH EAR, emissão de Condutax, curso de formação, licenciamento e quero início facilitado.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: IDENTIFICAÇÃO.
                    Primeiro contato pede o mínimo — nome e WhatsApp. CPF, e-mail
                    e endereço eram atrito antes de o candidato falar com alguém;
                    o atendente coleta o que precisar direto na ficha do painel. */}
                {step === 2 && (
                  <form onSubmit={handleNextStep} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                        <User className="h-4 w-4 text-sky-600" /> Nome Completo
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Ex: João da Silva"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-11"
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="whatsapp" className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-sky-600" /> WhatsApp
                      </Label>
                      <Input
                        id="whatsapp"
                        placeholder="(00) 00000-0000"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl font-medium h-11"
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength={15}
                        required
                      />
                      <p className="text-[11px] font-semibold text-slate-400">
                        É por aqui que nossa equipe vai falar com você.
                      </p>
                    </div>

                    <div className="flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/60 p-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                      <p className="text-[11px] font-semibold leading-relaxed text-slate-600">
                        Só isso mesmo. Documentos e endereço a gente resolve na conversa,
                        sem você ter que preencher tudo agora.
                      </p>
                    </div>

                    <div className="flex justify-between pt-5 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-6 h-11 font-bold text-xs"
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl px-8 h-11 shadow-md shadow-amber-500/20"
                      >
                        Próximo
                      </Button>
                    </div>
                  </form>
                )}

                {/* STEP 3: FLUXO-SPECIFIC QUESTIONS */}
                {step === 3 && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* FLOW A: JÁ SOU TAXISTA */}
                    {formData.situation === "taxista" && (
                      <>
                        {/* Condutax */}
                        <div className="space-y-2">
                          <Label className="text-slate-800 font-extrabold text-xs">Possui Condutax?</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { val: "sim", label: "Sim, ativo" },
                              { val: "nao", label: "Não possuo" },
                              { val: "renovacao", label: "Em renovação" }
                            ].map((item) => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => handleDirectSelect("hasCondutax", item.val)}
                                className={`h-10 rounded-xl border text-[11px] font-black transition-all ${
                                  formData.hasCondutax === item.val
                                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Alvará */}
                        <div className="space-y-2">
                          <Label className="text-slate-800 font-extrabold text-xs">Possui alvará próprio?</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { val: "sim", label: "Sim, possuo" },
                              { val: "nao", label: "Não" }
                            ].map((item) => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => handleDirectSelect("hasOwnAlvara", item.val)}
                                className={`h-10 rounded-xl border text-xs font-black transition-all ${
                                  formData.hasOwnAlvara === item.val
                                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Já trabalhou em frota? */}
                        <div className="space-y-2">
                          <Label className="text-slate-800 font-extrabold text-xs">Já trabalhou em alguma frota de táxi?</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { val: "sim", label: "Sim" },
                              { val: "nao", label: "Não" }
                            ].map((item) => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => handleDirectSelect("workedInFleet", item.val)}
                                className={`h-10 rounded-xl border text-xs font-black transition-all ${
                                  formData.workedInFleet === item.val
                                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Conditional fleet inputs */}
                        {formData.workedInFleet === "sim" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl animate-fadeIn">
                            <div className="space-y-1.5">
                              <Label htmlFor="fleetName" className="text-slate-700 font-bold text-xs">Qual frota?</Label>
                              <Input
                                id="fleetName"
                                placeholder="Ex: Frota X..."
                                value={formData.fleetName}
                                onChange={handleInputChange}
                                className="bg-white border-slate-200 text-slate-800 h-10 rounded-xl text-xs"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="fleetDuration" className="text-slate-700 font-bold text-xs">Quanto tempo permaneceu?</Label>
                              <Input
                                id="fleetDuration"
                                placeholder="Ex: 1 ano e 6 meses"
                                value={formData.fleetDuration}
                                onChange={handleInputChange}
                                className="bg-white border-slate-200 text-slate-800 h-10 rounded-xl text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {/* Experiência */}
                        <div className="space-y-1.5">
                          <Label className="text-slate-800 font-extrabold text-xs">Tempo de experiência como taxista</Label>
                          <Select 
                            value={formData.experienceYears} 
                            onValueChange={(val) => handleSelectChange("experienceYears", val)}
                          >
                            <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11">
                              <SelectValue placeholder="Selecione o tempo de experiência" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 text-slate-700">
                              <SelectItem value="menos_1">Menos de 1 ano</SelectItem>
                              <SelectItem value="1_3">1 a 3 anos</SelectItem>
                              <SelectItem value="3_5">3 a 5 anos</SelectItem>
                              <SelectItem value="mais_5">Mais de 5 anos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* FLOW B: QUERO ME TORNAR TAXISTA */}
                    {formData.situation === "futuro_taxista" && (
                      <>
                        {/* Possui CNH? */}
                        <div className="space-y-2">
                          <Label className="text-slate-800 font-extrabold text-xs">Possui CNH ativa?</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { val: "sim", label: "Sim, ativa" },
                              { val: "nao", label: "Não possuo CNH" }
                            ].map((item) => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => handleDirectSelect("hasCnh", item.val)}
                                className={`h-10 rounded-xl border text-xs font-black transition-all ${
                                  formData.hasCnh === item.val
                                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Categoria CNH */}
                        {formData.hasCnh === "sim" && (
                          <div className="space-y-1.5 animate-fadeIn">
                            <Label className="text-slate-800 font-extrabold text-xs">Categoria da CNH</Label>
                            <Select 
                              value={formData.cnhCategory} 
                              onValueChange={(val) => handleSelectChange("cnhCategory", val)}
                            >
                              <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11">
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-slate-200 text-slate-700">
                                <SelectItem value="B">Categoria B (Carros convencionais)</SelectItem>
                                <SelectItem value="C">Categoria C (Caminhões e carga)</SelectItem>
                                <SelectItem value="D">Categoria D (Microônibus e transporte)</SelectItem>
                                <SelectItem value="E">Categoria E (Veículos articulados)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Possui EAR? */}
                        <div className="space-y-2">
                          <Label className="text-slate-800 font-extrabold text-xs">Possui EAR na habilitação? (Exerce Atividade Remunerada)</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { val: "sim", label: "Sim, possuo EAR" },
                              { val: "nao", label: "Não" }
                            ].map((item) => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => handleDirectSelect("hasEar", item.val)}
                                className={`h-10 rounded-xl border text-xs font-black transition-all ${
                                  formData.hasEar === item.val
                                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Processo Condutax */}
                        <div className="space-y-2">
                          <Label className="text-slate-800 font-extrabold text-xs">Já iniciou o processo de emissão do Condutax?</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { val: "sim", label: "Sim, já iniciei" },
                              { val: "nao", label: "Não iniciei" },
                              { val: "nao_sei", label: "Não sei o que é" }
                            ].map((item) => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => handleDirectSelect("condutaxProcess", item.val)}
                                className={`h-10 rounded-xl border text-[10px] font-black transition-all ${
                                  formData.condutaxProcess === item.val
                                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Precisa de ajuda com? */}
                        <div className="space-y-2">
                          <Label className="text-slate-800 font-extrabold text-xs">Precisa de ajuda ou orientação da nossa equipe com quais itens?</Label>
                          <div className="space-y-2">
                            {helpOptions.map((opt) => {
                              const isChecked = formData.needsHelpWith.includes(opt.id)
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleCheckboxToggle(opt.id)}
                                  className={`w-full p-3.5 border rounded-xl flex items-center gap-3 text-left transition-all ${
                                    isChecked
                                      ? "bg-sky-50 border-sky-300 shadow-xs ring-1 ring-sky-500/20"
                                      : "bg-slate-50/50 border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                    isChecked ? "bg-sky-600 border-sky-600 text-white" : "bg-white border-slate-300"
                                  }`}>
                                    {isChecked && <Check className="h-3 w-3" />}
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-700">{opt.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Experiência passageiros */}
                        <div className="space-y-1.5">
                          <Label className="text-slate-800 font-extrabold text-xs">Qual sua experiência com transporte ou entregas?</Label>
                          <Select 
                            value={formData.passengerExperience} 
                            onValueChange={(val) => handleSelectChange("passengerExperience", val)}
                          >
                            <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11">
                              <SelectValue placeholder="Selecione sua experiência anterior" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 text-slate-700">
                              <SelectItem value="app">Motorista de aplicativo (Uber, 99, etc.)</SelectItem>
                              <SelectItem value="particular">Motorista particular ou executivo</SelectItem>
                              <SelectItem value="entregas">Motoboy, entregas ou mototáxi</SelectItem>
                              <SelectItem value="nenhuma">Não possuo experiência anterior</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* DADOS COMUNS AOS DOIS FLUXOS */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      
                      {/* Interesse Operacional */}
                      <div className="space-y-1.5">
                        <Label className="text-slate-800 font-extrabold text-xs">Interesse Operacional (Perfil de Trabalho)</Label>
                        <Select 
                          value={formData.interestOper} 
                          onValueChange={(val) => handleSelectChange("interestOper", val)}
                        >
                          <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11">
                            <SelectValue placeholder="Qual tipo de táxi quer operar?" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-slate-200 text-slate-700">
                            <SelectItem value="Táxi Convencional">Táxi Convencional (Livre circulação e corredores)</SelectItem>
                            <SelectItem value="D-Taxi Congonhas">D-Taxi Congonhas (Fila de embarque exclusivo)</SelectItem>
                            <SelectItem value="Híbridos">Táxi Híbrido Eco (Máxima economia GNV/Elétrico)</SelectItem>
                            <SelectItem value="Executivo">Táxi Executivo Premium (Viagens executivas corporativas)</SelectItem>
                            <SelectItem value="Ainda avaliando">Ainda avaliando perfil ideal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/*
                        Veículo de interesse — campo livre com sugestões da frota.
                        Um <select> obrigava o candidato a caçar o modelo numa lista;
                        aqui ele digita o nome (ou nem responde, já que é opcional)
                        e o atendente fecha o modelo na conversa.
                      */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="vehicleInterest"
                          className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5"
                        >
                          <Car className="h-4 w-4 text-sky-600" /> Qual veículo você tem interesse em alugar?
                          <span className="font-bold text-slate-400">(opcional)</span>
                        </Label>
                        <Input
                          id="vehicleInterest"
                          list="vehicle-options"
                          value={formData.vehicleInterest}
                          onChange={(e) => handleSelectChange("vehicleInterest", e.target.value)}
                          placeholder={
                            loadingVehicles
                              ? "Carregando frota disponível..."
                              : "Digite o modelo ou escolha da lista"
                          }
                          autoComplete="off"
                          className="bg-white border-slate-200 text-slate-800 rounded-xl h-11"
                        />
                        <datalist id="vehicle-options">
                          {(vehicles.length > 0
                            ? vehicles.map((car) => car.name)
                            : [
                                "Toyota Corolla Sedan",
                                "Chevrolet Spin",
                                "Toyota Corolla Cross Híbrido",
                                "Volkswagen Virtus",
                                "Chevrolet Onix",
                              ]
                          ).map((name) => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>
                        <p className="text-[11px] font-semibold text-slate-400">
                          Ainda não sabe? Pode deixar em branco — a gente te ajuda a escolher.
                        </p>
                      </div>
                    </div>

                    {/* Horário de contato — última pergunta antes de enviar.
                        Forma de pagamento e ciclo de contratação saíram do
                        formulário: são assunto da negociação, não do primeiro
                        contato, e só adicionavam atrito antes de falar com alguém. */}
                    <div className="space-y-1.5 pt-4 border-t border-slate-100">
                      <Label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-sky-600" /> Melhor horário para nossa equipe te ligar?
                        <span className="font-bold text-slate-400">(opcional)</span>
                      </Label>
                      <Select
                        value={formData.preferredContactTime}
                        onValueChange={(val) => handleSelectChange("preferredContactTime", val)}
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11">
                          <SelectValue placeholder="Qualquer horário comercial" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 text-slate-700">
                          <SelectItem value="Manhã">Manhã (08:00 às 12:00)</SelectItem>
                          <SelectItem value="Tarde">Tarde (12:00 às 18:00)</SelectItem>
                          <SelectItem value="Noite">Noite (18:00 às 21:00)</SelectItem>
                          <SelectItem value="Qualquer horário">Qualquer horário comercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start space-x-2 pt-3 border-t border-slate-100">
                      <input type="checkbox" id="terms" className="rounded border-gray-300 mt-1 accent-sky-600 h-4 w-4 cursor-pointer" required />
                      <Label htmlFor="terms" className="text-xs font-semibold text-slate-500 leading-relaxed cursor-pointer text-justify">
                        Autorizo o Grupo Michelines a realizar o contato telefônico e via WhatsApp para análise comercial do meu credenciamento comercial. Declaro que concordo com os{" "}
                        <Link href="#" className="text-sky-600 hover:underline font-extrabold">Termos de Uso</Link>{" "}
                        e as{" "}
                        <Link href="#" className="text-sky-600 hover:underline font-extrabold">Políticas de Privacidade</Link>.
                      </Label>
                    </div>

                    <div className="flex justify-between pt-5 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-6 h-11 font-bold text-xs"
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl px-8 h-11 shadow-md shadow-amber-500/20 disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                          </span>
                        ) : (
                          "Finalizar cadastro"
                        )}
                      </Button>
                    </div>
                  </form>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center justify-between px-6 border-t border-white/10 bg-black/10">
        <p className="text-xs text-sky-200/80 font-medium">© 2026 Grupo Michelines. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <Link href="#" className="text-xs text-sky-200/80 hover:text-white font-medium">Termos de Uso</Link>
          <Link href="#" className="text-xs text-sky-200/80 hover:text-white font-medium">Privacidade</Link>
        </div>
      </footer>
    </div>
  )
}
