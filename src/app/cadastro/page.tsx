"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Search, Loader2, MapPin, Phone, User, Calendar, ShieldCheck, HelpCircle } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../firebase/config"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CadastroPage() {
  const [step, setStep] = useState(1)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    rg: "",
    cpf: "",
    cep: "",
    address: "",
    messagePhone1: "",
    messageName1: "",
    messagePhone2: "",
    messageName2: "",
    isTaxiDriver: false,
    condutaxNumber: "",
    hasLicense: false,
    licenseDetails: "",
    cnhNumber: "",
    cnhCategory: "B",
    vehicleInterest: "Corolla Sedan",
  })

  const [files, setFiles] = useState<{
    cnh: File | null
    profilePhoto: File | null
  }>({
    cnh: null,
    profilePhoto: null,
  })

  // Format masks
  const formatCPF = (value: string) => {
    const clean = value.replace(/\D/g, "")
    if (clean.length <= 3) return clean
    if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
    if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
  }

  const formatCEP = (value: string) => {
    const clean = value.replace(/\D/g, "")
    if (clean.length <= 5) return clean
    return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`
  }

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

    if (id === "cpf") formattedValue = formatCPF(value)
    if (id === "cep") {
      formattedValue = formatCEP(value)
      // Auto-lookup CEP if it reaches 8 digits
      const cleanCep = formattedValue.replace(/\D/g, "")
      if (cleanCep.length === 8) {
        handleCepLookup(cleanCep)
      }
    }
    if (id === "phone" || id === "whatsapp" || id === "messagePhone1" || id === "messagePhone2") {
      formattedValue = formatPhone(value)
    }

    setFormData((prev) => ({
      ...prev,
      [id]: formattedValue,
    }))
  }

  const handleCepLookup = async (cepVal?: string) => {
    const searchCep = (cepVal || formData.cep).replace(/\D/g, "")
    if (searchCep.length !== 8) {
      alert("Por favor, digite um CEP válido com 8 dígitos.")
      return
    }

    try {
      setLoadingCep(true)
      const response = await fetch(`https://viacep.com.br/ws/${searchCep}/json/`)
      const data = await response.json()
      if (data.erro) {
        alert("CEP não encontrado. Por favor, digite o endereço manualmente.")
      } else {
        const fullAddress = `${data.logradouro}, Bairro: ${data.bairro}, ${data.localidade} - ${data.uf}`
        setFormData((prev) => ({
          ...prev,
          address: fullAddress,
        }))
      }
    } catch (e) {
      console.error("Erro ao buscar CEP:", e)
    } finally {
      setLoadingCep(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, files } = e.target
    if (files && files.length > 0) {
      setFiles((prev) => ({
        ...prev,
        [id]: files[0],
      }))
    }
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleRadioChange = (id: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step < 3) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      try {
        setIsSubmitting(true)

        // Upload opcional de arquivos para o Firebase Storage
        const fileUrls: Record<string, string> = {}
        for (const [key, file] of Object.entries(files)) {
          if (file) {
            const storageRef = ref(storage, `drivers/${formData.cpf.replace(/\D/g, "")}/${key}_${Date.now()}`)
            await uploadBytes(storageRef, file)
            const downloadUrl = await getDownloadURL(storageRef)
            fileUrls[key] = downloadUrl
          }
        }

        // Salvar dados na coleção de Leads
        await addDoc(collection(db, "leads"), {
          fullName: formData.fullName,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email,
          rg: formData.rg,
          cpf: formData.cpf,
          cep: formData.cep,
          address: formData.address,
          messagePhone1: formData.messagePhone1,
          messageName1: formData.messageName1,
          messagePhone2: formData.messagePhone2,
          messageName2: formData.messageName2,
          isTaxiDriver: formData.isTaxiDriver,
          condutaxNumber: formData.condutaxNumber || "Não possuo",
          hasLicense: formData.hasLicense,
          licenseDetails: formData.licenseDetails || "Não possuo",
          cnhNumber: formData.cnhNumber,
          cnhCategory: formData.cnhCategory,
          vehicleInterest: formData.vehicleInterest,
          status: "new",
          approvalStatus: "pending",
          source: "Cadastro Site",
          notes: `Cadastro inicial recebido pelo site. E-mail: ${formData.email}. CPF: ${formData.cpf}. RG: ${formData.rg}.`,
          contacted: false,
          whatsappSent: false,
          fileUrls,
          createdAt: serverTimestamp(),
        })

        // Salvar também na coleção de Drivers para consistência
        await addDoc(collection(db, "drivers"), {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          rg: formData.rg,
          address: formData.address,
          carModel: formData.vehicleInterest,
          status: "pending",
          fileUrls,
          createdAt: serverTimestamp(),
        })

        setFormSubmitted(true)
      } catch (error) {
        console.error("Erro ao enviar formulário:", error)
        alert("Ocorreu um erro ao enviar seu cadastro. Por favor, tente novamente.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  if (formSubmitted) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
        <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white shadow-sm">
          <Link className="flex items-center justify-center" href="/">
            <Image
              src="/images/logos/logo-grupo-michelines.png"
              alt="Logo Grupo Michelines"
              width={160}
              height={50}
              className="h-10 w-auto"
            />
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-slate-200 shadow-xl bg-white rounded-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
            <CardHeader className="text-center pt-8">
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4 animate-bounce" />
              <CardTitle className="text-2xl font-black text-slate-900">Cadastro Enviado!</CardTitle>
              <CardDescription className="text-slate-500 font-medium mt-2 leading-relaxed">
                Parabéns! Suas informações foram registradas com sucesso no Grupo Michelines. Nossa equipe de análise comercial revisará seus dados e entrará em contato via WhatsApp em breve.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pb-8 pt-4">
              <Link href="/">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-6 py-2 shadow-md flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para a Home
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
        <footer className="py-6 border-t bg-white text-center">
          <p className="text-xs text-slate-400 font-medium">© 2026 Grupo Michelines. Todos os direitos reservados.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white shadow-sm">
        <Link className="flex items-center justify-center" href="/">
          <Image
            src="/images/logos/logo-grupo-michelines.png"
            alt="Logo Grupo Michelines"
            width={160}
            height={50}
            className="h-10 w-auto"
          />
        </Link>
      </header>

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full">
                Seja um Motorista Parceiro
              </span>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl mt-2">
                Ficha de Cadastro de Leads
              </h1>
              <p className="max-w-[600px] text-slate-500 text-sm md:text-base font-semibold leading-relaxed">
                Preencha as informações essenciais abaixo. Liberação rápida, sem burocracia e direto no WhatsApp.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-lg">
            {/* Step Indicator */}
            <div className="flex justify-between mb-8 relative px-4">
              <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-200 -z-10" />
              <div
                className="absolute top-5 left-10 h-0.5 bg-amber-500 -z-10 transition-all duration-500"
                style={{ width: `${(step - 1) * 50}%` }}
              />

              <div className={`flex flex-col items-center z-10`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${
                    step >= 1
                      ? "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-200"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  1
                </div>
                <span className={`text-xs font-bold mt-2 ${step >= 1 ? "text-slate-800" : "text-slate-400"}`}>
                  Dados & Contato
                </span>
              </div>

              <div className={`flex flex-col items-center z-10`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${
                    step >= 2
                      ? "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-200"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  2
                </div>
                <span className={`text-xs font-bold mt-2 ${step >= 2 ? "text-slate-800" : "text-slate-400"}`}>
                  Referências & Perfil
                </span>
              </div>

              <div className={`flex flex-col items-center z-10`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${
                    step >= 3
                      ? "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-200"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  3
                </div>
                <span className={`text-xs font-bold mt-2 ${step >= 3 ? "text-slate-800" : "text-slate-400"}`}>
                  CNH & Interesse
                </span>
              </div>
            </div>

            <Card className="border-slate-200 shadow-xl bg-white rounded-2xl overflow-hidden">
              <div className="h-1.5 bg-amber-500" />
              <CardContent className="pt-8 px-6 sm:px-8">
                <form onSubmit={handleNextStep}>
                  {/* STEP 1: DADOS PESSOAIS E CONTATO */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-slate-800 font-extrabold text-xs flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-amber-500" /> Nome Completo
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Digite seu nome completo"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="cpf" className="text-slate-800 font-extrabold text-xs">
                            CPF
                          </Label>
                          <Input
                            id="cpf"
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={handleInputChange}
                            className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl"
                            maxLength={14}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="rg" className="text-slate-800 font-extrabold text-xs">
                            RG
                          </Label>
                          <Input
                            id="rg"
                            placeholder="Digite seu RG"
                            value={formData.rg}
                            onChange={handleInputChange}
                            className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-slate-800 font-extrabold text-xs">
                          E-mail
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seuemail@exemplo.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="whatsapp" className="text-slate-800 font-extrabold text-xs">
                            WhatsApp (Principal)
                          </Label>
                          <Input
                            id="whatsapp"
                            placeholder="(00) 00000-0000"
                            value={formData.whatsapp}
                            onChange={handleInputChange}
                            className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl font-medium"
                            maxLength={15}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-slate-800 font-extrabold text-xs">
                            Celular/Contato Adicional
                          </Label>
                          <Input
                            id="phone"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl"
                            maxLength={15}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="cep" className="text-slate-800 font-extrabold text-xs flex items-center justify-between">
                          <span>CEP (Busca Automática)</span>
                          {loadingCep && (
                            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                              <Loader2 className="h-3 w-3 animate-spin" /> Buscando...
                            </span>
                          )}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="cep"
                            placeholder="00000-000"
                            value={formData.cep}
                            onChange={handleInputChange}
                            className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl font-medium"
                            maxLength={9}
                            required
                          />
                          <Button
                            type="button"
                            onClick={() => handleCepLookup()}
                            disabled={loadingCep}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold flex items-center gap-1 px-4 text-xs shrink-0"
                          >
                            <Search className="h-3.5 w-3.5" /> Buscar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="address" className="text-slate-800 font-extrabold text-xs flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" /> Endereço Completo
                        </Label>
                        <Input
                          id="address"
                          placeholder="Rua, número, bairro, cidade - UF"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: REFERÊNCIAS E PERFIL PROFISSIONAL */}
                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Message references */}
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-amber-500" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Referências de Recado (Essencial)
                          </h3>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                          Por favor, nos informe dois contatos de familiares, amigos ou conhecidos para recado em caso de urgência.
                        </p>

                        <div className="space-y-3.5 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="messageName1" className="text-slate-700 font-bold text-xs">
                                Nome Referência 1
                              </Label>
                              <Input
                                id="messageName1"
                                placeholder="Ex: Maria Silva (Mãe)"
                                value={formData.messageName1}
                                onChange={handleInputChange}
                                className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl h-9"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="messagePhone1" className="text-slate-700 font-bold text-xs">
                                Telefone Referência 1
                              </Label>
                              <Input
                                id="messagePhone1"
                                placeholder="(00) 00000-0000"
                                value={formData.messagePhone1}
                                onChange={handleInputChange}
                                className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl h-9"
                                maxLength={15}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1.5">
                              <Label htmlFor="messageName2" className="text-slate-700 font-bold text-xs">
                                Nome Referência 2
                              </Label>
                              <Input
                                id="messageName2"
                                placeholder="Ex: João Souza (Amigo)"
                                value={formData.messageName2}
                                onChange={handleInputChange}
                                className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl h-9"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="messagePhone2" className="text-slate-700 font-bold text-xs">
                                Telefone Referência 2
                              </Label>
                              <Input
                                id="messagePhone2"
                                placeholder="(00) 00000-0000"
                                value={formData.messagePhone2}
                                onChange={handleInputChange}
                                className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl h-9"
                                maxLength={15}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profissional Profile */}
                      <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-200">
                        <div className="space-y-1.5">
                          <Label className="text-slate-800 font-extrabold text-xs">
                            Você já trabalhou como motorista de táxi?
                          </Label>
                          <RadioGroup
                            value={formData.isTaxiDriver ? "yes" : "no"}
                            onValueChange={(val) => handleRadioChange("isTaxiDriver", val === "yes")}
                            className="flex items-center gap-4 mt-2"
                          >
                            <div className="flex items-center space-x-2 cursor-pointer">
                              <RadioGroupItem id="taxi-yes" value="yes" className="accent-amber-500" />
                              <Label htmlFor="taxi-yes" className="text-xs font-semibold cursor-pointer">Sim, já trabalhei</Label>
                            </div>
                            <div className="flex items-center space-x-2 cursor-pointer">
                              <RadioGroupItem id="taxi-no" value="no" className="accent-amber-500" />
                              <Label htmlFor="taxi-no" className="text-xs font-semibold cursor-pointer">Não, quero começar agora</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {formData.isTaxiDriver && (
                          <div className="space-y-4 pt-3 border-t border-slate-100 animate-fadeIn">
                            <div className="space-y-1.5">
                              <Label htmlFor="condutaxNumber" className="text-slate-800 font-extrabold text-xs">
                                Número do Condutax
                              </Label>
                              <Input
                                id="condutaxNumber"
                                placeholder="Digite o número do seu Condutax"
                                value={formData.condutaxNumber}
                                onChange={handleInputChange}
                                className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl"
                                required
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-slate-800 font-extrabold text-xs">
                                Você está vinculado a alguma licença / alvará de táxi atualmente?
                              </Label>
                              <RadioGroup
                                value={formData.hasLicense ? "yes" : "no"}
                                onValueChange={(val) => handleRadioChange("hasLicense", val === "yes")}
                                className="flex items-center gap-4 mt-2"
                              >
                                <div className="flex items-center space-x-2 cursor-pointer">
                                  <RadioGroupItem id="license-yes" value="yes" />
                                  <Label htmlFor="license-yes" className="text-xs font-semibold cursor-pointer">Sim, possuo vínculo</Label>
                                </div>
                                <div className="flex items-center space-x-2 cursor-pointer">
                                  <RadioGroupItem id="license-no" value="no" />
                                  <Label htmlFor="license-no" className="text-xs font-semibold cursor-pointer">Não possuo</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {formData.hasLicense && (
                              <div className="space-y-1.5 pt-1 animate-fadeIn">
                                <Label htmlFor="licenseDetails" className="text-slate-700 font-bold text-xs">
                                  Detalhes da Licença / Alvará (Ex: Número ou Ponto)
                                </Label>
                                <Input
                                  id="licenseDetails"
                                  placeholder="Digite detalhes da licença/alvará"
                                  value={formData.licenseDetails}
                                  onChange={handleInputChange}
                                  className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl h-9"
                                  required
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: HABILITAÇÃO E PREFERÊNCIAS */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-amber-500" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Habilitação (CNH)
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="cnhNumber" className="text-slate-700 font-bold text-xs">
                              Número da CNH
                            </Label>
                            <Input
                              id="cnhNumber"
                              placeholder="Digite o número da CNH"
                              value={formData.cnhNumber}
                              onChange={handleInputChange}
                              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500 rounded-xl h-9 font-medium"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-slate-700 font-bold text-xs">
                              Categoria da Habilitação
                            </Label>
                            <Select 
                              value={formData.cnhCategory} 
                              onValueChange={(val) => handleSelectChange("cnhCategory", val)}
                            >
                              <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-9 rounded-xl">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-slate-200 text-slate-700">
                                <SelectItem value="B">Categoria B</SelectItem>
                                <SelectItem value="C">Categoria C</SelectItem>
                                <SelectItem value="D">Categoria D</SelectItem>
                                <SelectItem value="E">Categoria E</SelectItem>
                                <SelectItem value="AB">Categoria AB</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-slate-800 font-extrabold text-xs">
                          Qual veículo você possui interesse de locação no Grupo Michelines?
                        </Label>
                        <Select 
                          value={formData.vehicleInterest} 
                          onValueChange={(val) => handleSelectChange("vehicleInterest", val)}
                        >
                          <SelectTrigger className="bg-white border-slate-200 text-slate-800 rounded-xl">
                            <SelectValue placeholder="Selecione o modelo" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 text-slate-700">
                            <SelectItem value="Corolla Sedan">Toyota Corolla Sedan (Mais procurado)</SelectItem>
                            <SelectItem value="Corolla Cross">Toyota Corolla Cross (Premium SUV)</SelectItem>
                            <SelectItem value="Spin">Chevrolet Spin (Ideal para 7 lugares)</SelectItem>
                            <SelectItem value="Virtus">Volkswagen Virtus (Excelente espaço)</SelectItem>
                            <SelectItem value="Onix">Chevrolet Onix (Econômico)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Optional Document Uploads */}
                      <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-800 font-extrabold text-xs">
                            Upload de Documentos (Opcional - Acelera aprovação)
                          </Label>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Recomendado
                          </span>
                        </div>

                        <div className="space-y-3 pt-1">
                          <div className="space-y-1">
                            <Label htmlFor="cnh" className="text-slate-700 text-xs font-semibold">Foto da CNH (Frente e Verso)</Label>
                            <Input id="cnh" type="file" onChange={handleFileChange} className="bg-white border-slate-250 text-slate-700 h-9 text-xs rounded-xl" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="profilePhoto" className="text-slate-700 text-xs font-semibold">Foto de Perfil (Rosto nítido)</Label>
                            <Input id="profilePhoto" type="file" onChange={handleFileChange} className="bg-white border-slate-250 text-slate-700 h-9 text-xs rounded-xl" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 pt-2">
                        <input type="checkbox" id="terms" className="rounded border-gray-300 mt-1 accent-amber-500 h-4 w-4 cursor-pointer" required />
                        <Label htmlFor="terms" className="text-xs font-medium text-slate-500 leading-tight cursor-pointer">
                          Declaro que todas as informações prestadas são verdadeiras e autorizo o Grupo Michelines a realizar consultas de antecedentes e análise cadastral para aprovação de locação de táxi. Concordo com os{" "}
                          <Link href="#" className="text-amber-500 hover:underline font-bold">
                            Termos de Serviço
                          </Link>{" "}
                          e{" "}
                          <Link href="#" className="text-amber-500 hover:underline font-bold">
                            Política de Privacidade
                          </Link>
                          .
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
                    {step > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 font-bold rounded-xl px-5"
                      >
                        Voltar
                      </Button>
                    ) : (
                      <Link href="/">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 font-bold rounded-xl px-5"
                        >
                          Cancelar
                        </Button>
                      </Link>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-6 py-2 shadow-md shadow-amber-200 hover:shadow-lg transition-all"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                        </span>
                      ) : step < 3 ? (
                        "Próximo"
                      ) : (
                        "Concluir Cadastro"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center justify-between px-4 md:px-8 border-t bg-white">
        <p className="text-xs text-slate-400 font-medium">© 2026 Grupo Michelines. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <Link href="#" className="text-xs text-slate-400 hover:text-slate-650 font-medium">Termos</Link>
          <Link href="#" className="text-xs text-slate-400 hover:text-slate-650 font-medium">Privacidade</Link>
        </div>
      </footer>
    </div>
  )
}
