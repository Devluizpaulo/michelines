"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, CheckCircle2, Loader2, Phone, User, ShieldCheck, Check, Clock, 
  Car, Sparkles, Key, Plane, Battery, Crown, MapPin, Mail, Home, CreditCard, Shield, FileText
} from "lucide-react"
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/config"

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
  const [loadingCep, setLoadingCep] = useState(false)
  const [protocol, setProtocol] = useState("")

  const [formData, setFormData] = useState({
    situation: "", // "taxista" | "futuro_taxista"
    fullName: "",
    cpf: "",
    whatsapp: "",
    email: "",
    cep: "",
    addressStreet: "",
    addressNeighborhood: "",
    addressCity: "",
    addressState: "",
    addressNumber: "",
    addressComplement: "",
    
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

    // Preferences (Both)
    paymentPreference: "", // "pix" | "debito" | "credito" | "indefinido"
    contractType: "", // "diaria" | "semanal" | "mensal" | "indefinido"
    preferredContactTime: "", // "manha" | "tarde" | "noite"
  })

  // Load vehicles from Firestore
  useEffect(() => {
    const q = query(collection(db, "vehicles"), orderBy("showroomOrder", "asc"))
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list: any[] = []
        snap.forEach((doc) => {
          const car = doc.data()
          if (car.status === "active" && car.available === true) {
            list.push({ id: doc.id, ...car })
          }
        })
        setVehicles(list)
        setLoadingVehicles(false)
      },
      (error) => {
        console.warn("Erro ao buscar veículos em tempo real:", error)
        setLoadingVehicles(false)
      }
    )
    return () => unsubscribe()
  }, [])

  // Input Formatting Masks
  const formatPhone = (value: string) => {
    const clean = value.replace(/\D/g, "")
    if (clean.length <= 2) return clean
    if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
    if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`
  }

  const formatCPF = (val: string) => {
    const clean = val.replace(/\D/g, "")
    if (clean.length <= 3) return clean
    if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
    if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
  }

  const formatCEP = (val: string) => {
    const clean = val.replace(/\D/g, "")
    if (clean.length <= 5) return clean
    return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`
  }

  // Fetch address from ViaCEP API
  const fetchAddress = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "")
    if (cleanCep.length === 8) {
      setLoadingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            addressStreet: data.logradouro || "",
            addressNeighborhood: data.bairro || "",
            addressCity: data.localidade || "",
            addressState: data.uf || "",
          }))
        }
      } catch (err) {
        console.warn("Erro ao buscar CEP:", err)
      } finally {
        setLoadingCep(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    let formattedValue = value

    if (id === "whatsapp") {
      formattedValue = formatPhone(value)
    } else if (id === "cpf") {
      formattedValue = formatCPF(value)
    } else if (id === "cep") {
      formattedValue = formatCEP(value)
      fetchAddress(formattedValue)
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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 4) {
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
      const fullAddress = [
        formData.addressStreet,
        formData.addressNumber && `nº ${formData.addressNumber}`,
        formData.addressComplement && `(${formData.addressComplement})`,
        formData.addressNeighborhood,
        formData.addressCity,
        formData.addressState
      ].filter(Boolean).join(", ")

      const leadPayload = {
        fullName: formData.fullName,
        phone: formData.whatsapp,
        whatsapp: formData.whatsapp,
        email: formData.email,
        cpf: formData.cpf,
        cep: formData.cep,
        address: fullAddress,
        addressStreet: formData.addressStreet,
        addressNumber: formData.addressNumber,
        addressComplement: formData.addressComplement,
        addressNeighborhood: formData.addressNeighborhood,
        addressCity: formData.addressCity,
        addressState: formData.addressState,
        
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
        vehicleInterest: formData.vehicleInterest,
        preferredContactTime: formData.preferredContactTime,
        paymentPreference: formData.paymentPreference,
        contractType: formData.contractType,
        
        score,
        protocol: generatedProtocol,
        
        status: "new" as const,
        approvalStatus: "pending" as const,
        source: "Cadastro Site",
        notes: `Smart Funnel Lead. Perfil: ${formData.situation === "taxista" ? "Já é Taxista" : "Futuro Taxista"}. CPF: ${formData.cpf}. Score calculado: ${score} pts. Protocolo: ${generatedProtocol}.`,
        contacted: false,
        whatsappSent: false,
        createdAt: serverTimestamp(),
      }

      // 1. Add to leads collection
      await addDoc(collection(db, "leads"), leadPayload)

      // 2. Add to drivers collection for data consistency
      await addDoc(collection(db, "drivers"), {
        fullName: formData.fullName,
        whatsapp: formData.whatsapp,
        phone: formData.whatsapp,
        cityNeighborhood: `${formData.addressCity} - ${formData.addressNeighborhood}`,
        carModel: formData.vehicleInterest,
        status: "pending",
        createdAt: serverTimestamp(),
      })

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
                <div
                  className="absolute top-5 left-12 h-0.5 bg-amber-500 -z-10 transition-all duration-500"
                  style={{ width: `${(step - 2) * 50}%` }}
                />

                {[
                  { s: 2, label: "Contato" },
                  { s: 3, label: "Ficha Técnica" },
                  { s: 4, label: "Preferências" }
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

                {/* STEP 2: DADOS BÁSICOS & ENDEREÇO */}
                {step === 2 && (
                  <form onSubmit={handleNextStep} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-slate-850 font-extrabold text-xs flex items-center gap-1.5">
                        <User className="h-4 w-4 text-sky-600" /> Nome Completo
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Ex: João da Silva"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-11"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="cpf" className="text-slate-850 font-extrabold text-xs flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-sky-600" /> CPF
                        </Label>
                        <Input
                          id="cpf"
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl font-medium h-11"
                          maxLength={14}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="whatsapp" className="text-slate-850 font-extrabold text-xs flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-sky-600" /> WhatsApp
                        </Label>
                        <Input
                          id="whatsapp"
                          placeholder="(00) 00000-0000"
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl font-medium h-11"
                          maxLength={15}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-slate-850 font-extrabold text-xs flex items-center gap-1.5">
                          <Mail className="h-4 w-4 text-sky-600" /> E-mail
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="exemplo@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="cep" className="text-slate-850 font-extrabold text-xs flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-sky-600" /> CEP
                        </Label>
                        <div className="relative">
                          <Input
                            id="cep"
                            placeholder="00000-000"
                            value={formData.cep}
                            onChange={handleInputChange}
                            className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-11 font-medium pr-10"
                            maxLength={9}
                          />
                          {loadingCep && (
                            <span className="absolute right-3 top-3.5">
                              <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address block (dynamic and editable) */}
                    {(formData.cep.replace(/\D/g, "").length >= 8 || formData.addressStreet || formData.addressNeighborhood) && (
                      <div className="space-y-4 pt-3 border-t border-slate-100 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="addressStreet" className="text-slate-850 font-extrabold text-xs">Rua / Logradouro</Label>
                            <Input
                              id="addressStreet"
                              value={formData.addressStreet}
                              onChange={handleInputChange}
                              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-10 font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="addressNeighborhood" className="text-slate-850 font-extrabold text-xs">Bairro</Label>
                            <Input
                              id="addressNeighborhood"
                              value={formData.addressNeighborhood}
                              onChange={handleInputChange}
                              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-10 font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="addressCity" className="text-slate-850 font-extrabold text-xs">Cidade</Label>
                            <Input
                              id="addressCity"
                              value={formData.addressCity}
                              onChange={handleInputChange}
                              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-10 font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="addressState" className="text-slate-850 font-extrabold text-xs">Estado</Label>
                            <Input
                              id="addressState"
                              value={formData.addressState}
                              onChange={handleInputChange}
                              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-10 font-medium"
                            />
                          </div>
                          <div className="space-y-1.5 col-span-1">
                            <Label htmlFor="addressNumber" className="text-slate-850 font-extrabold text-xs">Número</Label>
                            <Input
                              id="addressNumber"
                              placeholder="Ex: 450"
                              value={formData.addressNumber}
                              onChange={handleInputChange}
                              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-10 font-bold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="addressComplement" className="text-slate-850 font-extrabold text-xs">Complemento</Label>
                          <Input
                            id="addressComplement"
                            placeholder="Ex: Bloco B, Apto 23"
                            value={formData.addressComplement}
                            onChange={handleInputChange}
                            className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-10"
                          />
                        </div>
                      </div>
                    )}

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
                  <form onSubmit={handleNextStep} className="space-y-5">
                    
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
                                className="bg-white border-slate-200 text-slate-855 h-10 rounded-xl text-xs"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="fleetDuration" className="text-slate-700 font-bold text-xs">Quanto tempo permaneceu?</Label>
                              <Input
                                id="fleetDuration"
                                placeholder="Ex: 1 ano e 6 meses"
                                value={formData.fleetDuration}
                                onChange={handleInputChange}
                                className="bg-white border-slate-200 text-slate-855 h-10 rounded-xl text-xs"
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
                                      ? "bg-sky-50 border-sky-350 shadow-xs ring-1 ring-sky-500/20"
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

                      {/* Veículo de Interesse (carregamento dinâmico do Firestore) */}
                      <div className="space-y-1.5">
                        <Label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                          <Car className="h-4 w-4 text-sky-600" /> Qual veículo você tem interesse em alugar?
                        </Label>
                        {loadingVehicles ? (
                          <div className="flex items-center gap-2 text-xs text-slate-400 h-11 px-3 border border-slate-200 rounded-xl bg-slate-50">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-655" />
                            <span>Carregando frota disponível...</span>
                          </div>
                        ) : (
                          <Select 
                            value={formData.vehicleInterest} 
                            onValueChange={(val) => handleSelectChange("vehicleInterest", val)}
                          >
                            <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11">
                              <SelectValue placeholder="Selecione o modelo de táxi" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 text-slate-700 max-h-[260px]">
                              {vehicles.length > 0 ? (
                                vehicles.map((car) => (
                                  <SelectItem key={car.id} value={car.name}>
                                    {car.name} {car.isHybrid ? "🔋 Híbrido" : ""}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="Toyota Corolla Sedan">Toyota Corolla Sedan (Mais procurado)</SelectItem>
                                  <SelectItem value="Chevrolet Spin">Chevrolet Spin (Ideal para 7 lugares / Congonhas)</SelectItem>
                                  <SelectItem value="Toyota Corolla Cross Híbrido">Toyota Corolla Cross Híbrido (Luxo)</SelectItem>
                                  <SelectItem value="Volkswagen Virtus">Volkswagen Virtus (Excelente espaço interno)</SelectItem>
                                  <SelectItem value="Chevrolet Onix">Chevrolet Onix (Econômico)</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
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

                {/* STEP 4: PREFERÊNCIAS OPERACIONAIS */}
                {step === 4 && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Forma de pagamento */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-sky-600" /> Forma de pagamento preferida para as diárias
                      </Label>
                      <Select 
                        value={formData.paymentPreference} 
                        onValueChange={(val) => handleSelectChange("paymentPreference", val)}
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11">
                          <SelectValue placeholder="Escolha a forma de pagamento" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 text-slate-700">
                          <SelectItem value="Pix">Pix (Transferência imediata)</SelectItem>
                          <SelectItem value="Débito">Cartão de Débito</SelectItem>
                          <SelectItem value="Crédito">Cartão de Crédito</SelectItem>
                          <SelectItem value="Ainda não defini">Ainda não decidi / Quero negociar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Modelo de contratação */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-sky-600" /> Período de contratação (Ciclo de Aluguel)
                      </Label>
                      <Select 
                        value={formData.contractType} 
                        onValueChange={(val) => handleSelectChange("contractType", val)}
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11">
                          <SelectValue placeholder="Escolha o ciclo desejado" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 text-slate-700">
                          <SelectItem value="Diária">Contrato Diário flexível</SelectItem>
                          <SelectItem value="Semanal">Semanal (Acerto semanal)</SelectItem>
                          <SelectItem value="Mensal">Mensal (Pacote de longo prazo)</SelectItem>
                          <SelectItem value="Ainda não sei">Ainda não sei / Avaliar suporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Horário para contato */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-sky-600" /> Qual o melhor horário para nossa equipe te ligar?
                      </Label>
                      <Select 
                        value={formData.preferredContactTime} 
                        onValueChange={(val) => handleSelectChange("preferredContactTime", val)}
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11">
                          <SelectValue placeholder="Selecione o período de contato" />
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
                    <div className="flex items-start space-x-2 pt-2 border-t border-slate-100">
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
                        disabled={isSubmitting}
                      >
                        Voltar
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl px-8 h-11 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                          </>
                        ) : (
                          "Concluir Credenciamento"
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
