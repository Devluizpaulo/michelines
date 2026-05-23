"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    address: "",
    carModel: "",
    carYear: "",
    carPlate: "",
    carCategory: "standard",
    carCondition: "good",
    interestDTaxi: false,
    interestAirport: false,
    interestExecutive: false,
    interestHybrid: false,
    interestGNV: false,
  })

  const [files, setFiles] = useState({
    cnh: null,
    crlv: null,
    profilePhoto: null,
    carPhoto: null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step < 3) {
      setStep(step + 1)
    } else {
      try {
        setIsSubmitting(true)

        // Upload dos arquivos para o Firebase Storage
        const fileUrls: Record<string, string> = {}

        for (const [key, file] of Object.entries(files)) {
          if (file) {
            const storageRef = ref(storage, `drivers/${formData.cpf}/${key}_${Date.now()}`)
            await uploadBytes(storageRef, file)
            const downloadUrl = await getDownloadURL(storageRef)
            fileUrls[key] = downloadUrl
          }
        }

        // Salvar dados no Firestore
        const driverPayload = {
          ...formData,
          fullName: `${formData.firstName} ${formData.lastName}`,
          status: "pending",
          fileUrls,
          createdAt: serverTimestamp(),
        }
        await addDoc(collection(db, "drivers"), driverPayload)

        // Salvar também como Lead para o CRM
        await addDoc(collection(db, "leads"), {
          fullName: driverPayload.fullName,
          phone: formData.phone,
          source: "Cadastro Site",
          vehicleInterest: formData.carModel || "Não especificado",
          status: "new",
          notes: `Cadastro inicial recebido pelo site. E-mail: ${formData.email}. CPF: ${formData.cpf}.`,
          contacted: false,
          whatsappSent: false,
          interestDTaxi: formData.interestDTaxi || false,
          interestAirport: formData.interestAirport || false,
          interestExecutive: formData.interestExecutive || false,
          interestHybrid: formData.interestHybrid || false,
          interestGNV: formData.interestGNV || false,
          createdAt: serverTimestamp(),
        })

        setFormSubmitted(true)
      } catch (error) {
        console.error("Erro ao enviar formulário:", error)
        alert("Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
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

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  if (formSubmitted) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="px-4 lg:px-6 h-16 flex items-center border-b">
          <Link className="flex items-center justify-center" href="/">
            <Image
              src="/images/logos/logo-grupo-michelines.png"
              alt="Logo Grupo Michelines"
              width={150}
              height={50}
              className="h-10 w-auto"
            />
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Cadastro Recebido!</CardTitle>
              <CardDescription>
                Obrigado por se cadastrar no Grupo Michelines. Analisaremos suas informações e entraremos em contato em
                breve.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para a página inicial
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-gray-500">© 2025 Grupo Michelines. Todos os direitos reservados.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <Image
            src="/images/logos/logo-grupo-michelines.png"
            alt="Logo Grupo Michelines"
            width={150}
            height={50}
            className="h-10 w-auto"
          />
        </Link>
      </header>
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Cadastro de Motorista</h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Preencha o formulário abaixo para se tornar um motorista do Grupo Michelines
              </p>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-md">
            <div className="flex justify-between mb-8">
              <div className={`flex flex-col items-center ${step >= 1 ? "text-yellow-500" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? "border-yellow-500 bg-yellow-50" : "border-gray-200"}`}
                >
                  1
                </div>
                <span className="text-sm mt-1">Dados Pessoais</span>
              </div>
              <div className={`flex flex-col items-center ${step >= 2 ? "text-yellow-500" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? "border-yellow-500 bg-yellow-50" : "border-gray-200"}`}
                >
                  2
                </div>
                <span className="text-sm mt-1">Veículo</span>
              </div>
              <div className={`flex flex-col items-center ${step >= 3 ? "text-yellow-500" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? "border-yellow-500 bg-yellow-50" : "border-gray-200"}`}
                >
                  3
                </div>
                <span className="text-sm mt-1">Documentos</span>
              </div>
            </div>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleNextStep}>
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Nome</Label>
                          <Input
                            id="firstName"
                            placeholder="Digite seu nome"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Sobrenome</Label>
                          <Input
                            id="lastName"
                            placeholder="Digite seu sobrenome"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          placeholder="Digite seu email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          placeholder="(00) 00000-0000"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Endereço Completo</Label>
                        <Input
                          id="address"
                          placeholder="Rua, número, bairro, cidade, estado"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="carModel">Modelo do Veículo</Label>
                        <Input
                          id="carModel"
                          placeholder="Ex: Toyota Corolla"
                          value={formData.carModel}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carYear">Ano do Veículo</Label>
                        <Input
                          id="carYear"
                          placeholder="Ex: 2020"
                          value={formData.carYear}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carPlate">Placa do Veículo</Label>
                        <Input
                          id="carPlate"
                          placeholder="Ex: ABC1234"
                          value={formData.carPlate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Categoria do Veículo</Label>
                        <RadioGroup
                          defaultValue={formData.carCategory}
                          onValueChange={(value) => handleSelectChange("carCategory", value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem id="standard" value="standard" />
                            <Label htmlFor="standard">Standard (4 passageiros)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem id="comfort" value="comfort" />
                            <Label htmlFor="comfort">Comfort (4 passageiros, mais espaço)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem id="premium" value="premium" />
                            <Label htmlFor="premium">Premium (4 passageiros, luxo)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label>Condição do Veículo</Label>
                        <Select onValueChange={(value) => handleSelectChange("carCondition", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a condição" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excelente</SelectItem>
                            <SelectItem value="good">Bom</SelectItem>
                            <SelectItem value="fair">Regular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Preferências e Divisões Especiais */}
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <Label className="text-slate-800 font-bold block mb-1">Interesses e Divisões de Mobilidade</Label>
                        
                        <div className="flex items-start space-x-2.5 py-1">
                          <input 
                            type="checkbox" 
                            id="interestDTaxi" 
                            checked={formData.interestDTaxi}
                            onChange={(e) => handleCheckboxChange("interestDTaxi", e.target.checked)}
                            className="rounded border-gray-300 mt-1 cursor-pointer accent-sky-600 h-4 w-4" 
                          />
                          <div>
                            <Label htmlFor="interestDTaxi" className="font-extrabold text-xs text-slate-800 cursor-pointer flex items-center gap-1">
                              ✈️ Divisão Premium D-TAXI (Congonhas)
                            </Label>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">Garantia de acesso à fila prioritária e passageiros executivos.</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2.5 py-1">
                          <input 
                            type="checkbox" 
                            id="interestAirport" 
                            checked={formData.interestAirport}
                            onChange={(e) => handleCheckboxChange("interestAirport", e.target.checked)}
                            className="rounded border-gray-300 mt-1 cursor-pointer accent-sky-600 h-4 w-4" 
                          />
                          <div>
                            <Label htmlFor="interestAirport" className="font-extrabold text-xs text-slate-800 cursor-pointer flex items-center gap-1">
                              💼 Operação Executiva Aeroporto
                            </Label>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">Foco em viagens corporativas de alta tarifa.</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2.5 py-1">
                          <input 
                            type="checkbox" 
                            id="interestExecutive" 
                            checked={formData.interestExecutive}
                            onChange={(e) => handleCheckboxChange("interestExecutive", e.target.checked)}
                            className="rounded border-gray-300 mt-1 cursor-pointer accent-sky-600 h-4 w-4" 
                          />
                          <div>
                            <Label htmlFor="interestExecutive" className="font-extrabold text-xs text-slate-800 cursor-pointer flex items-center gap-1">
                              💎 Veículos Híbridos / Executivos Premium
                            </Label>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">Destaque para modelos sedan premium de alta rentabilidade.</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2.5 py-1">
                          <input 
                            type="checkbox" 
                            id="interestHybrid" 
                            checked={formData.interestHybrid}
                            onChange={(e) => handleCheckboxChange("interestHybrid", e.target.checked)}
                            className="rounded border-gray-300 mt-1 cursor-pointer accent-sky-600 h-4 w-4" 
                          />
                          <div>
                            <Label htmlFor="interestHybrid" className="font-extrabold text-xs text-slate-800 cursor-pointer flex items-center gap-1">
                              🔋 Híbridos Premium Eco
                            </Label>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">Máxima autonomia com baixíssimo consumo de combustível.</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2.5 py-1">
                          <input 
                            type="checkbox" 
                            id="interestGNV" 
                            checked={formData.interestGNV}
                            onChange={(e) => handleCheckboxChange("interestGNV", e.target.checked)}
                            className="rounded border-gray-300 mt-1 cursor-pointer accent-sky-600 h-4 w-4" 
                          />
                          <div>
                            <Label htmlFor="interestGNV" className="font-extrabold text-xs text-slate-800 cursor-pointer flex items-center gap-1">
                              ⛽ GNV Econômico Integrado
                            </Label>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-tight">Rodar com economia e redução drástica no custo por quilômetro.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cnh">CNH (Carteira Nacional de Habilitação)</Label>
                        <Input id="cnh" type="file" onChange={handleFileChange} required />
                        <p className="text-xs text-gray-500">Formato: PDF, JPG ou PNG (máx. 5MB)</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crlv">CRLV (Certificado de Registro e Licenciamento)</Label>
                        <Input id="crlv" type="file" onChange={handleFileChange} required />
                        <p className="text-xs text-gray-500">Formato: PDF, JPG ou PNG (máx. 5MB)</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profilePhoto">Foto de Perfil</Label>
                        <Input id="profilePhoto" type="file" onChange={handleFileChange} required />
                        <p className="text-xs text-gray-500">Formato: JPG ou PNG (máx. 2MB)</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carPhoto">Foto do Veículo</Label>
                        <Input id="carPhoto" type="file" onChange={handleFileChange} required />
                        <p className="text-xs text-gray-500">Formato: JPG ou PNG (máx. 5MB)</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="terms" className="rounded border-gray-300" required />
                        <Label htmlFor="terms" className="text-sm">
                          Concordo com os{" "}
                          <Link href="#" className="text-yellow-600 hover:underline">
                            Termos de Serviço
                          </Link>{" "}
                          e{" "}
                          <Link href="#" className="text-yellow-600 hover:underline">
                            Política de Privacidade
                          </Link>
                        </Label>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={handlePrevStep}>
                        Voltar
                      </Button>
                    ) : (
                      <Link href="/">
                        <Button type="button" variant="outline">
                          Cancelar
                        </Button>
                      </Link>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Enviando..." : step < 3 ? "Próximo" : "Finalizar Cadastro"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2025 Grupo Michelines. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
