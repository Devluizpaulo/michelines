"use client"

import { useLandingSettings } from "@/hooks/useLandingSettings"
import { Navbar } from "@/components/home/navbar/Navbar"
import { Footer } from "@/components/home/footer/Footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { 
  Plane, 
  DollarSign, 
  ShieldCheck, 
  MapPin, 
  CheckCircle, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  ArrowRight,
  MessageSquare
} from "lucide-react"

export default function DTaxiCongonhasPage() {
  const { landingSettings } = useLandingSettings()

  const waPhone = "5511944830851"
  const waText = encodeURIComponent(
    "Olá! Tenho interesse na divisão executiva D-Taxi Congonhas. Gostaria de saber os veículos disponíveis e condições."
  )
  const waUrl = `https://wa.me/${waPhone}?text=${waText}`

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-sky-600 selection:text-white overflow-x-hidden">
      <Navbar landingSettings={landingSettings} />

      <main className="flex-1 pt-32 pb-24">
        
        {/* 1. HERO SECTION */}
        <section className="container mx-auto px-6 relative z-10 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left text Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <Badge className="bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-xs">
                <Plane className="h-3.5 w-3.5 text-sky-600" /> Operação Oficial Congonhas
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Fature alto na praça executiva de Congonhas.
              </h1>
              
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Opere com veículos premium híbridos e GNV homologados. Acesse a fila digital exclusiva no segundo aeroporto mais movimentado do Brasil, transportando clientes corporativos de alto ticket.
              </p>

              <div className="flex flex-wrap gap-3">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md">
                    <MessageSquare className="h-4 w-4" /> Falar com Consultor D-Taxi
                  </Button>
                </a>
                <Link href="/cadastro" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 font-bold h-12 px-6 rounded-2xl">
                    Fazer Pré-Cadastro Online
                  </Button>
                </Link>
              </div>

              {/* Quick statistics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                <div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">25Mi</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Passageiros / Ano</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">R$ 15k</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Faturamento Médio</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-black text-sky-600">100%</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fila Digital Rápida</p>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Vehicle Card & Airport Visual Badge */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.06),transparent_60%)] pointer-events-none" />
              
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sky-600" />
                    <span className="text-sm font-black text-slate-800">D-Taxi Premium Fleet</span>
                  </div>
                  <Badge className="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold uppercase">Congonhas</Badge>
                </div>

                <div className="relative w-full h-[180px]">
                  <Image 
                    src="/images/cars/corolla-cross.png" 
                    alt="Toyota Corolla Cross Hybrid" 
                    fill 
                    className="object-contain filter drop-shadow-[0_15px_15px_rgba(15,23,42,0.1)]"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-black text-slate-900 text-center">Toyota Corolla Cross Híbrido</h3>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-slate-50 border border-slate-100 py-2 rounded-xl text-slate-650 font-bold">
                      🔋 Híbrido Flex
                    </div>
                    <div className="bg-slate-50 border border-slate-100 py-2 rounded-xl text-slate-650 font-bold">
                      ⛽ GNV Opcional
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Diferenciais do Veículo</span>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-[9px] font-bold px-2 py-0.5">✈️ Homologado Congonhas</Badge>
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-[9px] font-bold px-2 py-0.5">💼 Operação Executiva</Badge>
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-[9px] font-bold px-2 py-0.5">🔋 Híbrido Premium</Badge>
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-[9px] font-bold px-2 py-0.5">⛽ GNV Econômico</Badge>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. ADVANTAGES & DETAILS GRID */}
        <section className="bg-white border-y border-slate-200 mt-24 py-20">
          <div className="container mx-auto px-6 max-w-6xl space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                Vantagens operacionais que multiplicam sua margem
              </h2>
              <p className="text-sm md:text-base text-slate-600 font-semibold">
                Muito mais que economia de combustível, a divisão D-Taxi entrega produtividade máxima.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Card 1 */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4">
                <div className="bg-sky-50 text-sky-600 border border-sky-100 p-3 rounded-2xl w-fit">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Faturamento Diário Elevado</h3>
                <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                  As corridas a partir de Congonhas possuem ticket médio superior em comparação com as corridas comuns da cidade. Viajantes a negócios e executivos priorizam a qualidade D-Taxi.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4">
                <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-2xl w-fit">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Economia no Abastecimento</h3>
                <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                  Nossa frota híbrida garante autonomia de até 18 km/l na cidade. Combinado com o GNV opcional, você reduz em até 50% o seu custo diário com combustível.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4">
                <div className="bg-amber-50 text-amber-600 border border-amber-100 p-3 rounded-2xl w-fit">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Fila Rápida Sem Tempo de Espera</h3>
                <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                  Utilize a fila digital exclusiva no pátio interno do aeroporto de Congonhas. A homologação da prefeitura dá preferência de chamada para táxis executivos vermelhos e pretos.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* 3. REQUISITOS DE HOMOLOGAÇÃO */}
        <section className="container mx-auto px-6 max-w-6xl mt-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Requirements list */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="space-y-2">
                <span className="text-xs font-black text-sky-600 uppercase tracking-wider">Como Ingressar</span>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                  Requisitos para Operação Executiva
                </h2>
                <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                  Por se tratar de uma categoria premium, a Prefeitura de São Paulo e o Grupo Michelines exigem requisitos específicos para a ativação do motorista na divisão D-Taxi:
                </p>
              </div>

              <div className="space-y-4 pt-2">
                
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850">CNH Regularizada com EAR</h4>
                    <p className="text-xs text-slate-500 font-semibold">Exercício de Atividade Remunerada registrado na habilitação.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850">Cadastro Municipal de Condutor (CONDUTAX)</h4>
                    <p className="text-xs text-slate-500 font-semibold">Documento oficial e ativo para motoristas de táxi na capital paulista.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850">Aprovação em Análise Cadastral e de Perfil</h4>
                    <p className="text-xs text-slate-500 font-semibold">Análise de histórico profissional executada pela nossa mesa de crédito interna.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850">Comprometimento com Padrão de Atendimento</h4>
                    <p className="text-xs text-slate-500 font-semibold">Seguir as diretrizes de cordialidade, vestimenta e conservação do veículo D-Taxi.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Documentation / Help info */}
            <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6">
              <div className="flex gap-3 items-center">
                <FileText className="h-5 w-5 text-sky-600" />
                <h3 className="text-lg font-black text-slate-800">Nós resolvemos a burocracia para você</h3>
              </div>
              
              <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                Não se preocupe com o processo de homologação do veículo na Prefeitura. O Grupo Michelines cuida de toda a documentação, vistorias e selos oficiais exigidos pelo DTP (Departamento de Transportes Públicos) para que seu carro saia pronto para rodar e faturar.
              </p>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Suporte Micheline's</p>
                <p className="text-xs font-black text-slate-800">Isenção de taxas administrativas de licenciamento anual e IPVA inclusas no aluguel.</p>
              </div>

              <Link href="/cadastro" className="block">
                <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold h-11 text-xs rounded-xl flex items-center justify-center gap-1.5">
                  Iniciar Cadastro Agora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

          </div>
        </section>

        {/* 4. VEÍCULOS HOMOLOGADOS DISPONÍVEIS */}
        <section className="container mx-auto px-6 max-w-6xl mt-24">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Modelos Homologados</h2>
            <p className="text-xs md:text-sm text-slate-600 font-semibold">Modelos premium autorizados para a praça executiva de Congonhas.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Vehicle 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <Badge className="bg-sky-50 text-sky-700 border border-sky-100 text-[8px] font-bold uppercase tracking-wider">Líder de Vendas</Badge>
                <h4 className="text-base font-extrabold text-slate-850">Corolla Cross Hybrid</h4>
                <p className="text-[10px] text-slate-500 font-semibold">SUV Premium de alta tecnologia.</p>
              </div>
              <div className="relative w-full h-[100px] my-4">
                <Image src="/images/cars/corolla-cross.png" alt="Corolla Cross" fill className="object-contain" />
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Mensal</span>
                <span className="text-sm font-black text-slate-800">R$ 2.990</span>
              </div>
            </div>

            {/* Vehicle 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <Badge className="bg-sky-50 text-sky-700 border border-sky-100 text-[8px] font-bold uppercase tracking-wider">Executivo Clássico</Badge>
                <h4 className="text-base font-extrabold text-slate-850">Toyota Corolla Sedan</h4>
                <p className="text-[10px] text-slate-500 font-semibold">Sedan executivo líder da praça.</p>
              </div>
              <div className="relative w-full h-[100px] my-4">
                <Image src="/images/cars/corolla.png" alt="Corolla Sedan" fill className="object-contain" />
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Mensal</span>
                <span className="text-sm font-black text-slate-800">R$ 2.790</span>
              </div>
            </div>

            {/* Vehicle 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <Badge className="bg-sky-50 text-sky-700 border border-sky-100 text-[8px] font-bold uppercase tracking-wider">Espaço Executivo</Badge>
                <h4 className="text-base font-extrabold text-slate-850">Chevrolet Spin GNV</h4>
                <p className="text-[10px] text-slate-500 font-semibold">Até 7 lugares para bagagens volumosas.</p>
              </div>
              <div className="relative w-full h-[100px] my-4">
                <Image src="/images/cars/spin.png" alt="Spin" fill className="object-contain" />
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Mensal</span>
                <span className="text-sm font-black text-slate-800">R$ 2.490</span>
              </div>
            </div>

            {/* Vehicle 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <Badge className="bg-sky-50 text-sky-700 border border-sky-100 text-[8px] font-bold uppercase tracking-wider">Moderno & Econômico</Badge>
                <h4 className="text-base font-extrabold text-slate-850">Volkswagen Virtus</h4>
                <p className="text-[10px] text-slate-500 font-semibold">Excelente porta-malas e consumo.</p>
              </div>
              <div className="relative w-full h-[100px] my-4">
                <Image src="/images/cars/virtus.png" alt="Virtus" fill className="object-contain" />
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Mensal</span>
                <span className="text-sm font-black text-slate-800">R$ 2.290</span>
              </div>
            </div>

          </div>
        </section>

        {/* 5. CALL TO ACTION */}
        <section className="container mx-auto px-6 max-w-4xl mt-24">
          <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.1),transparent_70%)] pointer-events-none" />
            
            <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 font-bold text-xs uppercase tracking-wider mx-auto w-fit">
              Vagas Limitadas para Homologação
            </Badge>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto">
              Pronto para faturar como motorista executivo?
            </h2>

            <p className="text-sm md:text-base text-slate-350 max-w-xl mx-auto font-medium">
              Entre em contato agora para verificar a disponibilidade dos veículos homologados e tire suas dúvidas sobre a operação D-Taxi Congonhas com nosso time de consultores comerciais.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-8 rounded-2xl flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Chamar no WhatsApp
                </Button>
              </a>
              <Link href="/cadastro" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-100 font-bold h-12 px-8 rounded-2xl">
                  Pré-Cadastro Expresso
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
