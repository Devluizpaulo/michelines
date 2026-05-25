"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  CheckCircle, 
  Car, 
  Plane, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Zap,
  Award,
  Users
} from "lucide-react"

interface TimelineStep {
  number: string
  title: string
  subtitle: string
  description: string
  details: string
  icon: any
  badge: string
  visualType: "cnh" | "condutax" | "cadastro" | "operacao" | "faturar"
}

const stepsData: TimelineStep[] = [
  {
    number: "01",
    title: "Regularize sua habilitação",
    subtitle: "Inclua a observação EAR na sua CNH",
    description: "O primeiro passo para ingressar no mercado profissional regulamentado. Adicionar a sigla EAR (Exerce Atividade Remunerada) na sua habilitação habilita você juridicamente para o transporte remunerado de passageiros.",
    details: "Suporte Micheline's: Orientamos você sobre os canais oficiais do Poupatempo e Detran para agilizar a emissão da sua nova via em tempo recorde.",
    icon: FileText,
    badge: "📋 CNH EAR",
    visualType: "cnh"
  },
  {
    number: "02",
    title: "Conquiste seu Condutax",
    subtitle: "O passaporte para a atividade profissional",
    description: "O Cadastro Municipal de Condutores de Táxi (Condutax) é a certificação obrigatória emitida pelo DTP que comprova que você está apto a operar profissionalmente na capital paulista.",
    details: "Nossa equipe acompanha você em todas as etapas do Condutax. Com apoio de escolas parceiras credenciadas, ajudamos você a iniciar sua trajetória profissional com mais segurança, rapidez e suporte especializado.",
    icon: Award,
    badge: "✅ Certificado DTP",
    visualType: "condutax"
  },
  {
    number: "03",
    title: "Faça seu cadastro oficial",
    subtitle: "Aprovação humanizada focada no seu futuro",
    description: "Com a documentação em mãos, faça seu cadastro em nosso portal. Nossa mesa avalia seu histórico e potencial profissional, sem travas burocráticas ou score de crédito tradicional.",
    details: "Parceria de Confiança: Nosso papel é abrir portas para o seu desenvolvimento. Validamos sua CNH e Condutax para liberar seu acesso rápido à atividade.",
    icon: CheckCircle,
    badge: "📋 Cadastro Simples",
    visualType: "cadastro"
  },
  {
    number: "04",
    title: "Escolha sua operação",
    subtitle: "Do hatch compacto à operação executiva em Congonhas",
    description: "Cada motorista possui um perfil de operação diferente. Por isso, oferecemos desde modelos compactos e sedans eficientes até veículos híbridos homologados para a operação executiva em Congonhas. Nossa equipe ajuda você a escolher a opção com maior potencial de rentabilidade para sua realidade.",
    details: "Analisamos seu perfil, rotina e objetivo financeiro para indicar o veículo e a operação mais adequada — seja mobilidade urbana, sedans executivos ou a divisão premium homologada para Congonhas.",
    icon: Car,
    badge: "🚖 Mobilidade Profissional",
    visualType: "operacao"
  },
  {
    number: "05",
    title: "Comece sua operação em São Paulo",
    subtitle: "Mais autonomia, mobilidade e oportunidades de faturamento",
    description: "Atue de forma profissional em uma das maiores cidades do país, com acesso às vantagens operacionais do táxi em São Paulo, incluindo circulação em faixas exclusivas, isenção de rodízio e operações de alta demanda como Congonhas.",
    details: "Os ganhos variam conforme a rotina, dedicação e estratégia de cada motorista. Nossa missão é ajudar você a construir uma operação mais rentável, com autonomia profissional, suporte especializado e liberdade para trabalhar no seu próprio ritmo.",
    icon: TrendingUp,
    badge: "💼 Independência Profissional",
    visualType: "faturar"
  }
]

export function Timeline() {
  const [activeStep, setActiveStep] = useState(0)

  // Sub-component to render high-end light glass mockups with real photographic backgrounds
  const renderVisualMockup = (type: string) => {
    switch (type) {
      case "cnh":
        return (
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-md flex items-end">
            {/* Real Unsplash image of clean professional driver driving in SP */}
            <img 
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80" 
              alt="Habilitação Profissional" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.95]"
            />
            {/* Glassmorphic light overlay card */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 w-full p-4 m-3 bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Habilitação EAR</span>
                <span className="bg-sky-50 text-sky-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-sky-100">Etapa 01</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-bold text-slate-800">Observação EAR Validada</p>
              </div>
              <p className="text-[9px] text-slate-500 font-medium">CNH apta para transporte de passageiros em São Paulo.</p>
            </div>
          </div>
        )
      case "condutax":
        return (
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-md flex items-end">
            {/* Real Unsplash image of classroom or professional course */}
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80" 
              alt="Treinamento Profissional" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.95]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent pointer-events-none" />

            <div className="relative z-10 w-full p-4 m-3 bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Certificação DTP</span>
                <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-100">Ativo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <p className="text-xs font-bold text-slate-800">Curso Condutax Concluído</p>
              </div>
              <p className="text-[9px] text-slate-500 font-medium">Homologação no Cadastro Municipal realizada com suporte Micheline's.</p>
            </div>
          </div>
        )
      case "cadastro":
        return (
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-md flex items-end">
            {/* Real Unsplash image of office onboarding/support team */}
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80" 
              alt="Atendimento Micheline's" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.95]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent pointer-events-none" />

            <div className="relative z-10 w-full p-4 m-3 bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Micheline's Partner Portal</span>
                <span className="bg-sky-50 text-sky-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-sky-100">Aprovado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                <p className="text-xs font-bold text-slate-800">Ficha de Parceria Ativa</p>
              </div>
              <p className="text-[9px] text-slate-500 font-medium">Análise de perfil ágil e humanizada focada na sua capacidade operacional.</p>
            </div>
          </div>
        )
      case "operacao":
        return (
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-md flex items-end">
            {/* Real Unsplash image of elegant taxi/car in São Paulo */}
            <img 
              src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80" 
              alt="Escolha do Veículo" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.95]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent pointer-events-none" />

            <div className="relative z-10 w-full p-4 m-3 bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Showroom Grupo Michelines</span>
                <span className="bg-sky-50 text-sky-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-sky-100">Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <p className="text-xs font-bold text-slate-800">Sedans, Compactos e Híbridos</p>
              </div>
              <p className="text-[9px] text-slate-500 font-medium">Frota diversificada de acordo com seu plano de trabalho e orçamento.</p>
            </div>
          </div>
        )
      case "faturar":
        return (
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-md flex items-end">
            {/* Real Unsplash image of São Paulo executive district */}
            <img 
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=600&q=80" 
              alt="Operação em São Paulo" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.95]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent pointer-events-none" />

            <div className="relative z-10 w-full p-4 m-3 bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Operação Ativa</span>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-bold">Autonomia Completa</Badge>
              </div>
              <div className="space-y-1 text-[9px] text-slate-600 font-semibold">
                <p>✔ Livre de rodízio municipal em SP</p>
                <p>✔ Trânsito livre em faixas exclusivas</p>
                <p>✔ Suporte operacional 24h incluso</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <section id="como-funciona" className="w-full py-24 lg:py-36 bg-[#F8FAFC] relative border-t border-slate-200 select-none overflow-hidden">
      
      {/* Background gradients for luxury depth */}
      <div className="absolute right-0 top-1/4 w-[600px] h-[600px] bg-sky-500/[0.015] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute left-0 bottom-1/4 w-[500px] h-[550px] bg-indigo-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <Badge className="bg-sky-50 text-sky-700 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border border-sky-200 shadow-xs hover:bg-sky-100/50">
            💼 Trajetória Profissional
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Sua jornada para a mobilidade profissional em São Paulo
          </h2>
          <p className="text-base md:text-lg text-slate-600 font-medium text-justify">
            Entenda o caminho regulamentado para ingressar na atividade profissional, acessar a frota de suporte do Grupo Michelines e escolher a operação mais adequada para o seu perfil.
          </p>
        </div>

        {/* Executive Metrics Overview Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] flex flex-col gap-2 hover:border-sky-300 hover:shadow-sm transition-all duration-300">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              💼 Mais autonomia
            </span>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed text-justify">
              Construa sua própria rotina profissional com mais liberdade operacional em São Paulo.
            </p>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] flex flex-col gap-2 hover:border-sky-300 hover:shadow-sm transition-all duration-300">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              🚖 Operação regulamentada
            </span>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed text-justify">
              Atuação profissional legalizada com suporte specialized durante toda a jornada.
            </p>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] flex flex-col gap-2 hover:border-sky-300 hover:shadow-sm transition-all duration-300">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              🔋 Frota moderna
            </span>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed text-justify">
              Veículos híbridos, GNV e executivos preparados para diferentes perfis de operação.
            </p>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] flex flex-col gap-2 hover:border-sky-300 hover:shadow-sm transition-all duration-300">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              ✈️ Operação Congonhas
            </span>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed text-justify">
              Acesso opcional à divisão premium D-Taxi em uma das maiores demandas aeroportuárias do país.
            </p>
          </div>
        </div>

        {/* Main Grid: Horizontal Progress Bar on Top & 2-Column interactive dashboard below */}
        <div className="space-y-12">
          
          {/* Horizontal Progress Bar */}
          <div className="relative mb-12 hidden md:block max-w-4xl mx-auto">
            <div className="absolute top-1/2 left-[28px] right-[28px] h-[3px] -translate-y-1/2 z-0">
              <div className="w-full h-full bg-slate-200 rounded-full" />
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-600 to-indigo-650 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${(activeStep / (stepsData.length - 1)) * 100}%` }}
              />
            </div>
            
            <div className="relative flex justify-between z-10">
              {stepsData.map((step, idx) => {
                const IconComponent = step.icon
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`w-14 h-14 rounded-2xl border-2 font-black text-sm flex flex-col items-center justify-center transition-all duration-500 shadow-sm relative group bg-white ${idx <= activeStep
                      ? "border-sky-600 text-sky-600 scale-105"
                      : "border-slate-250 text-slate-400 hover:border-slate-350 hover:text-slate-650"
                      }`}
                  >
                    <IconComponent className="h-5 w-5 mb-0.5" />
                    <span className="text-[9px] tracking-tight">{step.number}</span>
                    
                    {/* Tooltip on hover */}
                    <span className="absolute -bottom-8 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                      {step.title}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Core Interactive Workspace (Experience Panel) */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Nav Column */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                {stepsData.map((step, idx) => {
                  const IconComponent = step.icon
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-500 ease-out flex items-center gap-4 group ${activeStep === idx
                        ? "bg-white border-sky-300 shadow-[0_10px_25px_-5px_rgba(2,132,199,0.06)] scale-[1.01]"
                        : "bg-white/40 border-slate-200 hover:border-slate-300 hover:bg-white hover:scale-[1.005]"
                        }`}
                    >
                      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 ${activeStep === idx
                        ? "bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/10"
                        : "bg-slate-50 border-slate-200 text-slate-500 group-hover:text-slate-700"
                        }`}>
                        <IconComponent className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step.number}</span>
                          {activeStep === idx && (
                            <Badge className="bg-sky-50 text-sky-700 border border-sky-200 text-[8px] font-bold px-2 py-0">Jornada</Badge>
                          )}
                        </div>
                        <p className={`text-sm font-black truncate transition-colors duration-300 ${activeStep === idx ? "text-slate-900" : "text-slate-650"}`}>
                          {step.title}
                        </p>
                      </div>
                      <ChevronRight className={`h-4.5 w-4.5 text-slate-300 transition-transform duration-350 ${activeStep === idx ? "text-sky-600 translate-x-1" : "group-hover:text-slate-400 group-hover:translate-x-0.5"
                        }`} />
                    </button>
                  )
                })}
              </div>
 
              {/* Support Human notice box */}
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4.5 flex items-center gap-3.5 shadow-xs mt-auto">
                <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Suporte Humano</h4>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5 text-justify">
                    Nossa equipe acompanha você em todas as etapas de homologação e treinamento.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Showcase Column (The Cinematic Experience Panel) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 md:p-10 flex flex-col justify-between shadow-[0_20px_50px_rgba(15,23,42,0.04)] relative overflow-hidden min-h-[480px]">
              
              {/* Backlight Glow decoration inside card */}
              <div className="absolute right-0 top-0 w-72 h-72 bg-gradient-to-br from-sky-500/[0.02] to-indigo-500/[0.01] rounded-full blur-[80px] pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    {/* Header line inside the detail */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{stepsData[activeStep].number}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{stepsData[activeStep].badge}</span>
                      </div>
                      <Badge className="bg-sky-50 text-sky-700 border border-sky-200 font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 shadow-xs">
                        Mobilidade Executiva
                      </Badge>
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="space-y-1">
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        {stepsData[activeStep].title}
                      </h3>
                      <p className="text-xs md:text-sm font-bold text-sky-600 uppercase tracking-wider">
                        {stepsData[activeStep].subtitle}
                      </p>
                    </div>

                    {/* Description copy & Visual splitting */}
                    <div className="grid md:grid-cols-2 gap-6 items-stretch">
                      <div className="flex flex-col justify-between space-y-4 h-full">
                        <p className="text-xs md:text-sm text-slate-650 font-semibold leading-relaxed text-justify">
                          {stepsData[activeStep].description}
                        </p>
                        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xs mt-auto">
                          <p className="text-xs text-slate-600 leading-relaxed font-bold text-justify">
                            {stepsData[activeStep].details}
                          </p>
                          {activeStep === 4 && (
                            <p className="text-[9px] text-slate-400 mt-2 italic font-semibold leading-snug text-justify">
                              * Os resultados variam conforme a rotina e estratégia operacional de cada motorista.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Mockup Showcase Panel inside the step card */}
                      <div className="w-full flex items-stretch rounded-2xl relative min-h-[240px]">
                        {renderVisualMockup(stepsData[activeStep].visualType)}
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="border-t border-slate-100 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                      onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                      disabled={activeStep === 0}
                      className="w-full sm:w-auto text-xs md:text-sm font-bold text-slate-600 hover:text-slate-950 border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      Voltar Etapa
                    </button>

                    {activeStep < stepsData.length - 1 ? (
                      <Button
                        onClick={() => setActiveStep(prev => Math.min(stepsData.length - 1, prev + 1))}
                        className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl h-11 px-6 shadow-sm hover:shadow flex items-center justify-center gap-1.5 hover:translate-x-0.5 transition-all"
                      >
                        Avançar Jornada <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link href="/cadastro" className="w-full sm:w-auto">
                          <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl h-11 px-6 shadow-sm hover:shadow flex items-center justify-center gap-1.5">
                            Iniciar Minha Jornada <Sparkles className="h-4 w-4 text-sky-200" />
                          </Button>
                        </Link>
                        <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                          <Button variant="outline" className="w-full border-slate-250 hover:bg-slate-50 text-slate-700 font-bold rounded-xl h-11 px-6 shadow-xs flex items-center justify-center gap-1.5">
                            Falar com Nossa Equipe
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>

        {/* Closing Emotional CTA */}
        <div className="mt-20 text-center max-w-2xl mx-auto space-y-4 pt-10 border-t border-slate-100">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1">
            <Zap className="h-3.5 w-3.5 text-sky-600" /> Transparência e Suporte Grupo Michelines
          </p>
          <p className="text-base md:text-lg font-extrabold text-slate-800 tracking-tight">
            “Você está a poucos passos de iniciar sua jornada profissional na mobilidade executiva.”
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/cadastro">
              <Button className="bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold text-xs h-10 px-6 shadow-sm hover:-translate-y-0.5 transition-all">
                Iniciar Cadastro Oficial
              </Button>
            </Link>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-slate-250 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-xs h-10 px-6 shadow-xs">
                Falar com Atendente
              </Button>
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
