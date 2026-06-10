"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, Phone, User, ShieldCheck, Check, Clock, Car, Sparkles, Key, Plane, Battery, Crown, MapPin } from "lucide-react"
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
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: "",
    whatsapp: "",
    cityNeighborhood: "",
    isTaxiDriver: false,
    hasCnhEar: false,
    leadReason: "",
    vehicleInterest: "",
    preferredContactTime: "",
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

  const handlePillChange = (id: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleStep2Select = (reason: string) => {
    setFormData((prev) => ({
      ...prev,
      leadReason: reason,
    }))
    // Auto advance to next step to optimize clicks
    setStep(3)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
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
    try {
      setIsSubmitting(true)

      const leadPayload = {
        fullName: formData.fullName,
        phone: formData.whatsapp, // save whatsapp also as phone for backwards compatibility
        whatsapp: formData.whatsapp,
        cityNeighborhood: formData.cityNeighborhood,
        isTaxiDriver: formData.isTaxiDriver,
        hasCnhEar: formData.hasCnhEar,
        leadReason: formData.leadReason,
        operationInterest: formData.vehicleInterest, // mapping CRM fields
        vehicleInterest: formData.vehicleInterest,
        preferredContactTime: formData.preferredContactTime,
        status: "new" as const,
        approvalStatus: "pending" as const,
        source: "Cadastro Site",
        notes: `Pré-cadastro comercial de alta conversão. Cidade/Bairro: ${formData.cityNeighborhood}. CNH com EAR: ${formData.hasCnhEar ? "Sim" : "Não"}. Já é taxista: ${formData.isTaxiDriver ? "Sim" : "Não"}. Interesse: ${formData.leadReason}. Melhor horário de contato: ${formData.preferredContactTime}.`,
        contacted: false,
        whatsappSent: false,
        createdAt: serverTimestamp(),
      }

      // Add to leads collection
      await addDoc(collection(db, "leads"), leadPayload)

      // Add to drivers collection for data consistency
      await addDoc(collection(db, "drivers"), {
        fullName: formData.fullName,
        whatsapp: formData.whatsapp,
        phone: formData.whatsapp,
        cityNeighborhood: formData.cityNeighborhood,
        carModel: formData.vehicleInterest,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      setFormSubmitted(true)
    } catch (error) {
      console.error("Erro ao enviar pré-cadastro:", error)
      alert("Ocorreu um erro ao enviar seu cadastro. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const leadReasons = [
    {
      id: "Quero virar taxista",
      title: "Quero virar taxista",
      desc: "Preciso de suporte com alvará, condutax e início rápido.",
      icon: Sparkles,
      color: "text-amber-500 bg-amber-50 border-amber-100",
    },
    {
      id: "Já sou taxista",
      title: "Já sou taxista",
      desc: "Desejo alugar um veículo pronto com o melhor suporte.",
      icon: Key,
      color: "text-blue-500 bg-blue-50 border-blue-100",
    },
    {
      id: "D-Taxi Congonhas",
      title: "D-Taxi Congonhas",
      desc: "Interesse na fila de embarque rápido do aeroporto.",
      icon: Plane,
      color: "text-sky-500 bg-sky-50 border-sky-100",
    },
    {
      id: "Híbridos",
      title: "Híbridos",
      desc: "Economia máxima com tecnologia híbrida e isenção de rodízio.",
      icon: Battery,
      color: "text-emerald-500 bg-emerald-50 border-emerald-100",
    },
    {
      id: "Veículos executivos",
      title: "Veículos executivos",
      desc: "Modelos sedan premium para faturamento qualificado.",
      icon: Crown,
      color: "text-purple-500 bg-purple-50 border-purple-100",
    },
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
                Pré-Cadastro Concluído!
              </CardTitle>
              <CardDescription className="text-slate-500 font-semibold mt-2 leading-relaxed text-sm">
                Olá, <strong>{formData.fullName.split(" ")[0]}</strong>! Seus dados foram registrados com sucesso no Grupo Michelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-6 text-center space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Para acelerar seu atendimento e garantir a reserva do seu veículo, fale diretamente com um de nossos consultores de vendas pelo WhatsApp agora mesmo.
              </p>
              
              <Link 
                href={`https://wa.me/5511944830851?text=Olá!%20Acabei%20de%20fazer%20meu%20pré-cadastro%20no%20site%20(Nome:%20${encodeURIComponent(formData.fullName)})%20e%20gostaria%20de%20atendimento%20para%20o%20interesse:%20${encodeURIComponent(formData.leadReason)}.`}
                target="_blank"
                className="block w-full"
              >
                <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                  Falar no WhatsApp Comercial
                </Button>
              </Link>
            </CardContent>
            <CardFooter className="flex justify-center pb-8 pt-2">
              <Link href="/">
                <Button variant="ghost" className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 text-xs">
                  Voltar para a Home
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
                Seja Parceiro Michelines
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl mt-2">
                Comece sua jornada como taxista
              </h1>
              <p className="max-w-[600px] text-sky-200/80 text-xs sm:text-sm font-semibold leading-relaxed mx-auto">
                Encontre a operação ideal para você. Preenchimento rápido em menos de 60 segundos.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            {/* Step Indicator */}
            <div className="flex justify-between mb-8 relative px-10">
              <div className="absolute top-5 left-12 right-12 h-0.5 bg-white/10 -z-10" />
              <div
                className="absolute top-5 left-12 h-0.5 bg-amber-500 -z-10 transition-all duration-500"
                style={{ width: `${(step - 1) * 50}%` }}
              />

              {[
                { s: 1, label: "Contato" },
                { s: 2, label: "Objetivo" },
                { s: 3, label: "Preferências" }
              ].map((item) => (
                <div key={item.s} className="flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${
                      step >= item.s
                        ? "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                        : "border-white/20 bg-[#142d54] text-sky-200/50"
                    }`}
                  >
                    {step > item.s ? <Check className="h-4 w-4" /> : item.s}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${step >= item.s ? "text-white" : "text-sky-200/40"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Card className="border-white/10 shadow-2xl bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden text-slate-800">
              <div className="h-1.5 bg-amber-500" />
              <CardContent className="pt-8 px-6 sm:px-10">
                
                {/* STEP 1: DADOS BÁSICOS & CONTATO */}
                {step === 1 && (
                  <form onSubmit={handleNextStep} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-slate-850 font-extrabold text-xs flex items-center gap-1.5">
                        <User className="h-4 w-4 text-sky-600" /> Nome Completo
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Digite seu nome completo"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-11"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div className="space-y-1.5">
                        <Label htmlFor="cityNeighborhood" className="text-slate-855 font-extrabold text-xs flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-sky-600" /> Cidade / Bairro
                        </Label>
                        <Input
                          id="cityNeighborhood"
                          placeholder="Ex: São Paulo - Pinheiros"
                          value={formData.cityNeighborhood}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 rounded-xl h-11"
                          required
                        />
                      </div>
                    </div>

                    {/* Question switches (Sim/Não layout) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                      <div className="space-y-2">
                        <Label className="text-slate-850 font-extrabold text-xs">
                          Já é motorista de táxi?
                        </Label>
                        <div className="flex gap-2">
                          {[
                            { val: true, label: "Sim, já sou" },
                            { val: false, label: "Não" }
                          ].map((item) => {
                            const active = formData.isTaxiDriver === item.val
                            return (
                              <button
                                key={String(item.val)}
                                type="button"
                                onClick={() => handlePillChange("isTaxiDriver", item.val)}
                                className={`flex-1 h-10 rounded-xl border text-xs font-bold transition-all ${
                                  active 
                                    ? "bg-sky-600 border-sky-600 text-white shadow-sm" 
                                    : "bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-850 font-extrabold text-xs">
                          Possui CNH com EAR?
                        </Label>
                        <div className="flex gap-2">
                          {[
                            { val: true, label: "Sim, possuo" },
                            { val: false, label: "Não" }
                          ].map((item) => {
                            const active = formData.hasCnhEar === item.val
                            return (
                              <button
                                key={String(item.val)}
                                type="button"
                                onClick={() => handlePillChange("hasCnhEar", item.val)}
                                className={`flex-1 h-10 rounded-xl border text-xs font-bold transition-all ${
                                  active 
                                    ? "bg-sky-600 border-sky-600 text-white shadow-sm" 
                                    : "bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-5 border-t border-slate-100">
                      <Button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl px-8 h-11 shadow-md shadow-amber-500/20 hover:shadow-lg transition-all"
                      >
                        Próximo
                      </Button>
                    </div>
                  </form>
                )}

                {/* STEP 2: INTERESSE PRINCIPAL (OBJETIVO) */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="text-center pb-2">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Qual seu interesse principal?</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Selecione uma opção abaixo para prosseguir</p>
                    </div>

                    <div className="space-y-3.5">
                      {leadReasons.map((item) => {
                        const Icon = item.icon
                        const isSelected = formData.leadReason === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleStep2Select(item.id)}
                            className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all duration-300 ${
                              isSelected
                                ? "border-sky-550 bg-sky-50/70 shadow-md ring-1 ring-sky-500/30"
                                : "border-slate-200/90 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex justify-between pt-5 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 font-bold rounded-xl px-6 h-11"
                      >
                        Voltar
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: PREFERÊNCIAS DE ATENDIMENTO */}
                {step === 3 && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Vehicle interest selection (dynamic dropdown) */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                        <Car className="h-4 w-4 text-sky-600" /> Qual veículo você tem interesse em alugar?
                      </Label>
                      {loadingVehicles ? (
                        <div className="flex items-center gap-2 text-xs text-slate-450 h-11 px-3 border border-slate-200 rounded-xl bg-slate-50">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                          <span>Carregando frota disponível do showroom...</span>
                        </div>
                      ) : (
                        <Select 
                          value={formData.vehicleInterest} 
                          onValueChange={(val) => handleSelectChange("vehicleInterest", val)}
                          required
                        >
                          <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11 focus:ring-sky-500">
                            <SelectValue placeholder="Selecione o modelo de interesse" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 text-slate-750 max-h-[280px]">
                            {vehicles.length > 0 ? (
                              vehicles.map((car) => (
                                <SelectItem key={car.id} value={car.name}>
                                  {car.name} {car.isHybrid ? "🔋 Híbrido" : ""}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="Toyota Corolla Sedan">Toyota Corolla Sedan (Mais procurado)</SelectItem>
                                <SelectItem value="Toyota Corolla Cross">Toyota Corolla Cross (Premium SUV)</SelectItem>
                                <SelectItem value="Chevrolet Spin">Chevrolet Spin (Ideal para 7 lugares)</SelectItem>
                                <SelectItem value="Volkswagen Virtus">Volkswagen Virtus (Excelente espaço)</SelectItem>
                                <SelectItem value="Chevrolet Onix">Chevrolet Onix (Econômico)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Preferred contact time */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-sky-600" /> Melhor horário para entrarmos em contato?
                      </Label>
                      <Select 
                        value={formData.preferredContactTime} 
                        onValueChange={(val) => handleSelectChange("preferredContactTime", val)}
                        required
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl h-11 focus:ring-sky-500">
                          <SelectValue placeholder="Escolha o melhor período" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                          <SelectItem value="Manhã">Manhã (08:00 às 12:00)</SelectItem>
                          <SelectItem value="Tarde">Tarde (12:00 às 18:00)</SelectItem>
                          <SelectItem value="Noite">Noite (18:00 às 21:00)</SelectItem>
                          <SelectItem value="Qualquer horário">Qualquer horário (Comercial)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-start space-x-2 pt-2 border-t border-slate-100">
                      <input type="checkbox" id="terms" className="rounded border-gray-300 mt-1 accent-sky-600 h-4 w-4 cursor-pointer" required />
                      <Label htmlFor="terms" className="text-xs font-semibold text-slate-500 leading-relaxed cursor-pointer text-justify">
                        Autorizo o Grupo Michelines a realizar o contato via WhatsApp/telefone para fins comerciais e de análise cadastral simplificada. Concordo com os{" "}
                        <Link href="#" className="text-sky-600 hover:underline font-extrabold">Termos de Serviço</Link>{" "}
                        e{" "}
                        <Link href="#" className="text-sky-600 hover:underline font-extrabold">Políticas de Privacidade</Link>.
                      </Label>
                    </div>

                    <div className="flex justify-between pt-5 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 font-bold rounded-xl px-6 h-11"
                        disabled={isSubmitting}
                      >
                        Voltar
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl px-8 h-11 shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                          </>
                        ) : (
                          "Concluir Pré-Cadastro"
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
