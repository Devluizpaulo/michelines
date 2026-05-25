"use client"

import { Calendar, CreditCard, Clock, Sliders, ArrowRight, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ModelOperacional() {
  const daysOfWeek = [
    { name: "Seg", exempt: false },
    { name: "Ter", exempt: false },
    { name: "Qua", exempt: false },
    { name: "Qui", exempt: false },
    { name: "Sex", exempt: false },
    { name: "Sáb", exempt: false },
    { name: "Dom", exempt: true },
  ]

  return (
    <section id="modelo-operacional" className="w-full py-20 lg:py-32 bg-white border-t border-slate-100 relative select-none">
      {/* Light spotlight background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,132,199,0.02),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Title / Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge className="bg-sky-50 text-sky-700 border-sky-200 px-3 py-1 rounded-full text-xs font-semibold border">
            Modelo Operacional Inteligente
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Autonomia financeira e rotina sob seu total controle
          </h2>
          <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed text-justify">
            Uma estrutura pensada para que você gerencie seus ganhos de forma previsível e sem amarras operacionais. Escolha o ritmo que melhor se adapta à sua vida.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-center">
          
          {/* Left Column: Visual Calendar / Exemption Representation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sky-600">
                  <Calendar className="h-5 w-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Calendário de Isenção</h3>
                </div>
                <h4 className="text-xl font-extrabold text-slate-900">
                  Diárias de Segunda a Sábado
                </h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed text-justify">
                  Trabalhamos de forma justa. Domingos e feriados nacionais são totalmente isentos de diária.
                </p>
              </div>

              {/* Weekly visual layout */}
              <div className="grid grid-cols-7 gap-2 pt-2 text-center">
                {daysOfWeek.map((day, idx) => (
                  <div 
                    key={idx}
                    className={`p-2.5 rounded-xl flex flex-col justify-between h-20 border transition-all ${
                      day.exempt 
                        ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-800" 
                        : "bg-white border-slate-200 text-slate-700 shadow-xs"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider">{day.name}</span>
                    <div className="flex flex-col items-center">
                      {day.exempt ? (
                        <>
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 leading-none">Isento</span>
                          <span className="text-[8px] font-bold text-emerald-600/70 mt-0.5">R$ 0</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] font-bold text-slate-400 leading-none">Ativo</span>
                          <span className="text-[8px] font-bold text-slate-500/70 mt-0.5">Diária</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 p-4 bg-white border border-slate-150 rounded-2xl">
                <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-2.5 rounded-xl h-fit">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800">Domingos & Feriados Livres de Diária</h5>
                  <p className="text-[10px] text-slate-550 leading-relaxed font-semibold text-justify">
                    Todo o faturamento obtido aos domingos e feriados nacionais é inteiramente seu. Descanse ou maximize seus lucros sem cobrança de diária extra.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Execution Cards (Flexibility / Autonomy) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Card 1: Frequencia Flexivel */}
            <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-6 rounded-2xl flex gap-5 transition-all duration-300">
              <div className="bg-sky-50 text-sky-600 border border-sky-100 p-3 rounded-2xl h-fit shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-800">Ciclo de Pagamento Personalizado</h4>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">Diário • Semanal • Mensal</p>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold text-justify">
                  Organize suas finanças de acordo com sua realidade de caixa. Escolha quitar suas contas a cada dia, semanalmente ou concentrar em um único pagamento mensal, adaptando-se perfeitamente à sua dinâmica pessoal.
                </p>
              </div>
            </div>

            {/* Card 2: Meios de Pagamento */}
            <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-6 rounded-2xl flex gap-5 transition-all duration-300">
              <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-2xl h-fit shrink-0">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-800">Facilidade e Flexibilidade de Cobrança</h4>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pix • Débito • Crédito</p>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold text-justify">
                  Evite dores de cabeça burocráticas. A plataforma aceita as principais modalidades do mercado para acerto de diárias. Gerencie diretamente pelo painel digital ou presencialmente na sede corporativa.
                </p>
              </div>
            </div>

            {/* Card 3: Autonomia */}
            <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-6 rounded-2xl flex gap-5 transition-all duration-300">
              <div className="bg-indigo-50 text-indigo-600 border border-indigo-100 p-3 rounded-2xl h-fit shrink-0">
                <Sliders className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-800">Operação Adaptável & Sem Metas Arbitrárias</h4>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Sua rotina, suas regras</p>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold text-justify">
                  Não impomos limites de rodagem ou horários rígidos de trabalho. Você define sua agenda comercial, folgas e áreas de preferência na cidade, rodando com a tranquilidade de ter um veículo 100% reservado para você.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* CTA Banner */}
        <div className="mt-16 text-center max-w-xl mx-auto space-y-4">
          <p className="text-xs font-bold text-slate-450 uppercase tracking-widest">
            Sem comprovação cadastral complexa de score ou avalistas
          </p>
          <Link href="/cadastro" className="inline-block">
            <Button className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 h-11">
              Iniciar Simulação e Cadastro <ArrowRight className="h-4.5 w-4.5" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  )
}
