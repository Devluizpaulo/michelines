"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, HelpCircle, ArrowRight, Info, MessageSquare } from "lucide-react"
import Link from "next/link"

interface SimulatorScenario {
  category: "convencional" | "michelines"
  weeklyCostLabel: string
  monthlyCostLabel: string
  kmLimit: string
  hasDeposit: boolean
  rodizioExempt: boolean
  support24h: boolean
  executiveOperation: boolean
}

const DEFAULT_SCENARIOS: Record<"convencional" | "michelines", SimulatorScenario> = {
  convencional: {
    category: "convencional",
    weeklyCostLabel: "A partir de R$ 750/sem",
    monthlyCostLabel: "A partir de R$ 3.000/mês",
    kmLimit: "Restrito (2.500 km/sem)",
    hasDeposit: true,
    rodizioExempt: false,
    support24h: false,
    executiveOperation: false
  },
  michelines: {
    category: "michelines",
    weeklyCostLabel: "A partir de R$ 900/sem",
    monthlyCostLabel: "A partir de R$ 3.600/mês",
    kmLimit: "Quilometragem flexível",
    hasDeposit: false,
    rodizioExempt: true,
    support24h: true,
    executiveOperation: true
  }
}

export function Simulator() {
  const [scenarios, setScenarios] = useState<Record<"convencional" | "michelines", SimulatorScenario>>(DEFAULT_SCENARIOS)
  const [loading, setLoading] = useState(true)

  // WhatsApp Link Construction
  const waPhone = "5511944830851" // Michelin's commercial contact
  const waText = encodeURIComponent(
    "Olá! Estava analisando o Comparador de Mobilidade Profissional no site e gostaria de tirar algumas dúvidas com um consultor operacional."
  )
  const waUrl = `https://wa.me/${waPhone}?text=${waText}`

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true)
        const snap = await getDocs(collection(db, "simulator_scenarios"))
        if (!snap.empty) {
          const fetched: any = {}
          snap.forEach((doc) => {
            const data = doc.data() as SimulatorScenario
            if (data.category) {
              fetched[data.category] = data
            }
          })
          
          if (fetched.convencional && fetched.michelines) {
            setScenarios(fetched)
          }
        }
      } catch (e) {
        console.warn("Erro ao buscar simulator_scenarios, usando estático:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchScenarios()
  }, [])

  interface ComparisonRow {
    feature: string
    help: string
    convencional: string | boolean
    michelines: string | boolean
    highlight: boolean
  }

  const comparisonRows: ComparisonRow[] = [
    {
      feature: "Limite de Quilometragem",
      help: "Quilometragem semanal máxima inclusa no contrato padrão.",
      convencional: scenarios.convencional.kmLimit,
      michelines: scenarios.michelines.kmLimit,
      highlight: false
    },
    {
      feature: "Cobrança Excedente",
      help: "Custos surpresa ou multas por quilometragem extra rodada.",
      convencional: "Cobrança de taxa por km extra",
      michelines: "Maior previsibilidade operacional (sem cobrança de km extra)",
      highlight: false
    },
    {
      feature: "Exigência de Caução",
      help: "Necessidade de cartão de crédito e alto depósito financeiro inicial.",
      convencional: scenarios.convencional.hasDeposit ? "Sim (Valor alto via Cartão)" : "Isento",
      michelines: scenarios.michelines.hasDeposit ? "Sim" : "Isento / Condições Facilitadas",
      highlight: false
    },
    {
      feature: "Isenção de Rodízio SP",
      help: "Liberdade para circular todos os dias graças a motorização eficiente.",
      convencional: scenarios.convencional.rodizioExempt ? "Isenção total" : "Sujeito a bloqueios semanais",
      michelines: scenarios.michelines.rodizioExempt ? "Isento (Híbridos, Elétricos e GNV)" : "Sujeito a rodízio",
      highlight: false
    },
    {
      feature: "Operação Executiva (Congonhas)",
      help: "Acesso livre à fila digital rápida de Congonhas (D-TAXI).",
      convencional: scenarios.convencional.executiveOperation ? "Homologado" : "Restrito (Fila padrão demorada)",
      michelines: scenarios.michelines.executiveOperation ? "Homologado (D-TAXI Prioritário)" : "Sem acesso",
      highlight: false
    },
    {
      feature: "Suporte Operacional & Oficina",
      help: "Central de mecânica integrada e resolução de sinistros.",
      convencional: "Mecânicas credenciadas externas (com filas)",
      michelines: "Oficina própria integrada & socorro 24hs",
      highlight: false
    },
    {
      feature: "Previsibilidade e Isenções",
      help: "Estrutura contratual de cobrança das diárias.",
      convencional: "Cobradas todos os dias corridos",
      michelines: "Segunda a Sábado. Domingos e Feriados Isentos",
      highlight: true
    },
    {
      feature: "Formas de Pagamento",
      help: "Meios e frequência aceitos para acerto de contas.",
      convencional: "Cartão de crédito ou boleto semanal rígido",
      michelines: "Pix, Débito ou Crédito (Diário, Semanal ou Mensal)",
      highlight: false
    },
    {
      feature: "O que está incluso?",
      help: "Estrutura e serviços agregados à sua rotina operacional.",
      convencional: "Locação básica do veículo",
      michelines: "Estrutura operacional integrada",
      highlight: true
    }
  ]

  return (
    <section id="simulador" className="w-full py-20 lg:py-32 bg-transparent relative select-none">
      
      {/* Background radial spotlight */}
      <div className="absolute right-0 top-1/4 w-[400px] h-[400px] bg-sky-500/[0.015] rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge className="bg-white/10 text-sky-200 border-white/10 px-3.5 py-1 rounded-full text-xs font-semibold border shadow-xs">
            Comparador Operacional
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Simulador de Operação Profissional
          </h2>
          <p className="text-base md:text-lg text-sky-100/90 font-medium leading-relaxed text-justify">
            Compare a estrutura de trabalho e custos fixos. Escolha o modelo que traz previsibilidade real e suporte para a sua jornada profissional.
          </p>
        </div>

        {/* Comparison Grid (Stripe / Apple Style) */}
        <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Header Row */}
          <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/50 p-6 md:p-8 items-center text-xs md:text-sm font-black uppercase tracking-wider text-slate-700">
            <div className="col-span-5 md:col-span-4 text-left">Parâmetro Operacional</div>
            <div className="col-span-3 md:col-span-4 text-center text-slate-400">Modelos Convencionais</div>
            <div className="col-span-4 md:col-span-4 text-center text-sky-700 flex justify-center items-center gap-1.5">
              <span>Grupo Michelines</span>
              <Badge className="bg-sky-100 text-sky-850 text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 border border-sky-200 shadow-xs">Premium</Badge>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-slate-100 text-xs md:text-sm">
            {comparisonRows.map((row, idx) => (
              <div 
                key={idx} 
                className={`grid grid-cols-12 p-6 md:p-8 items-center font-semibold transition-colors hover:bg-slate-50/30 ${
                  row.highlight ? "bg-sky-50/10" : ""
                }`}
              >
                {/* Feature Name & Helper tooltip */}
                <div className="col-span-5 md:col-span-4 text-left flex items-start gap-1.5 pr-2">
                  <span className="text-slate-800 font-bold leading-tight">{row.feature}</span>
                  <div className="group relative cursor-help shrink-0 mt-0.5 hidden sm:block">
                    <HelpCircle className="h-3.5 w-3.5 text-slate-350 hover:text-slate-500" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-slate-900 text-white text-[10px] font-semibold leading-relaxed rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {row.help}
                    </div>
                  </div>
                </div>

                {/* Conventional App Column */}
                <div className="col-span-3 md:col-span-4 text-center text-slate-500/80 font-medium">
                  {row.feature === "O que está incluso?" ? (
                    <div className="text-left max-w-xs mx-auto space-y-1 font-medium text-slate-400 text-[10px] md:text-xs">
                      <div className="flex items-center gap-1"><X className="h-3.5 w-3.5 text-rose-500 shrink-0" /> Sem oficina própria</div>
                      <div className="flex items-center gap-1"><X className="h-3.5 w-3.5 text-rose-500 shrink-0" /> Sem suporte 24h humano</div>
                      <div className="flex items-center gap-1"><X className="h-3.5 w-3.5 text-rose-500 shrink-0" /> Sujeito a rodízio municipal</div>
                      <div className="flex items-center gap-1"><X className="h-3.5 w-3.5 text-rose-500 shrink-0" /> Sem acesso a fila D-Taxi</div>
                      <div className="flex items-center gap-1"><X className="h-3.5 w-3.5 text-rose-500 shrink-0" /> Pagamento rígido</div>
                      <div className="flex items-center gap-1"><X className="h-3.5 w-3.5 text-rose-500 shrink-0" /> Sem espaço físico de apoio</div>
                    </div>
                  ) : row.convencional === false ? (
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  ) : row.convencional === true ? (
                    <Check className="h-4 w-4 text-slate-400 mx-auto" />
                  ) : (
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <X className="h-3.5 w-3.5 text-rose-450/80 shrink-0" />
                      <span>{row.convencional}</span>
                    </span>
                  )}
                </div>

                {/* Michelines Platform Column */}
                <div className="col-span-4 md:col-span-4 text-center">
                  {row.feature === "O que está incluso?" ? (
                    <div className="text-left max-w-xs mx-auto space-y-1 font-bold text-slate-800 text-[10px] md:text-xs">
                      <div className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Oficina própria</div>
                      <div className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Suporte operacional 24h</div>
                      <div className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Isenção de rodízio</div>
                      <div className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Operação executiva opcional</div>
                      <div className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Flexibilidade de pagamento</div>
                      <div className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Estrutura operacional integrada</div>
                    </div>
                  ) : row.michelines === false ? (
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  ) : row.michelines === true ? (
                    <Check className="h-4 w-4 text-sky-600 font-black mx-auto" />
                  ) : (
                    <span className={`inline-flex items-center justify-center gap-1.5 font-bold ${row.highlight ? "text-sky-700 font-extrabold" : "text-emerald-700"}`}>
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{row.michelines}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Comparison Footer Notice (UX Humanizada) */}
        <div className="mt-10 text-center max-w-2xl mx-auto space-y-4">
          <p className="text-xs text-sky-200/80 leading-relaxed font-semibold text-justify">
            * Cada operação possui características diferentes. Nossa equipe ajuda você a encontrar a alternativa mais adequada para sua rotina profissional.
          </p>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto text-left shadow-xs">
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-450 uppercase tracking-widest">Encontre a sua estrutura</p>
              <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                Nossa equipe ajuda você a encontrar a melhor operação para sua realidade.
              </h4>
              <p className="text-xs text-slate-550 font-medium text-justify">
                O modelo ideal depende da sua rotina, perfil operacional e objetivo profissional.
              </p>
            </div>
            
            <a 
              href={waUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto shrink-0"
            >
              <Button className="w-full sm:w-auto bg-slate-50 border border-slate-200 hover:bg-slate-100 text-emerald-600 hover:text-emerald-700 font-bold h-11 px-5 flex items-center justify-center gap-2 rounded-xl text-xs shadow-sm transition-all">
                <MessageSquare className="h-4 w-4" /> Falar com Consultor Operacional
              </Button>
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
