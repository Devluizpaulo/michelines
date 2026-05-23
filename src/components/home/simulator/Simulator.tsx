"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSimulator } from "@/hooks/useSimulator"

export function Simulator() {
  const {
    hoursPerDay,
    setHoursPerDay,
    daysPerWeek,
    setDaysPerWeek,
    grossTaxi,
    costTaxi,
    netTaxi,
    grossApp,
    costApp,
    netApp,
    diffMonthly
  } = useSimulator()

  return (
    <section id="simulador" className="w-full py-20 lg:py-32 bg-[#F8FAFC] border-b border-slate-200 relative select-none">
      {/* Subtle Backlight */}
      <div className="absolute right-0 top-1/4 w-[400px] h-[400px] bg-sky-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-sky-50 text-sky-700 px-3.5 py-1 rounded-full text-xs font-bold mb-4 border border-sky-200 shadow-xs hover:bg-sky-100/50">
            Transparência de Ganhos
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Quanto dá para faturar por mês?
          </h2>
          <p className="text-base md:text-lg text-slate-600 font-medium">
            Veja em tempo real a diferença de rendimento líquido com base no corredor de ônibus e no GNV.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Controles de Simulação */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-600 animate-pulse" />
                Configure sua rotina
              </h3>
              
              {/* Slider Dias por Semana */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs md:text-sm font-bold text-slate-600">Dias trabalhados na semana:</span>
                  <span className="text-base font-black text-sky-600">{daysPerWeek} dias</span>
                </div>
                <input 
                  type="range" 
                  min="4" 
                  max="7" 
                  value={daysPerWeek} 
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="w-full accent-sky-600 bg-slate-100 rounded-full h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                  <span>4 dias (Part-time)</span>
                  <span>6 dias (Padrão)</span>
                  <span>7 dias (Focado)</span>
                </div>
              </div>

              {/* Slider Horas por Dia */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs md:text-sm font-bold text-slate-600">Horas dedicadas por dia:</span>
                  <span className="text-base font-black text-sky-600">{hoursPerDay} horas</span>
                </div>
                <input 
                  type="range" 
                  min="6" 
                  max="12" 
                  value={hoursPerDay} 
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full accent-sky-600 bg-slate-100 rounded-full h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                  <span>6 horas</span>
                  <span>10 horas</span>
                  <span>12 horas</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 text-xs text-emerald-800 font-semibold shadow-xs">
              <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Cálculo baseado no uso real do corredor de ônibus (viagens 35% mais rápidas) e acesso livre à fila D-Taxi em Congonhas.
              </p>
            </div>
          </div>

          {/* Resultado e Comparação */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
            
            {/* Glow decorativo no fundo */}
            <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-[80px]" />
            
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-8">Demonstrativo de Lucro Líquido Mensal</h3>
              
              <div className="space-y-6">
                {/* Linha Táxi */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-slate-800 flex items-center gap-2 text-xs md:text-sm">
                      <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                      Táxi Grupo Micheline's
                    </span>
                    <span className="text-xl md:text-2xl font-black text-emerald-600">
                      R$ {Math.round(netTaxi).toLocaleString('pt-BR')}
                      <span className="text-xs font-semibold text-slate-450">/mês</span>
                    </span>
                  </div>
                  
                  {/* Gráfico de barra animado */}
                  <div className="w-full bg-slate-50 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <motion.div 
                      className="bg-gradient-to-r from-emerald-600 to-green-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8 }}
                      style={{ width: `${(netTaxi / Math.max(netTaxi, netApp)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5 uppercase">
                    <span>Faturamento Bruto: R$ {Math.round(grossTaxi).toLocaleString('pt-BR')}</span>
                    <span>Custos (Aluguel+GNV): R$ {Math.round(costTaxi).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                {/* Linha Apps Comuns */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-slate-500 flex items-center gap-2 text-xs md:text-sm">
                      <span className="h-3 w-3 rounded-full bg-slate-300"></span>
                      Aplicativo Convencional (Uber/99)
                    </span>
                    <span className="text-lg md:text-xl font-bold text-slate-500">
                      R$ {Math.round(netApp).toLocaleString('pt-BR')}
                      <span className="text-xs font-semibold text-slate-400">/mês</span>
                    </span>
                  </div>
                  {/* Gráfico de barra animado */}
                  <div className="w-full bg-slate-50 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <motion.div 
                      className="bg-slate-350 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8 }}
                      style={{ width: `${(netApp / Math.max(netTaxi, netApp)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5 uppercase">
                    <span>Faturamento Bruto: R$ {Math.round(grossApp).toLocaleString('pt-BR')}</span>
                    <span>Custos (Aluguel+Gasolina): R$ {Math.round(costApp).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco Destaque da Diferença */}
            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Adicional no Táxi</p>
                <p className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
                  +R$ {Math.round(diffMonthly).toLocaleString('pt-BR')} <span className="text-emerald-600 text-lg">/ mês</span>
                </p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Representa aproximadamente <strong className="text-emerald-700 font-extrabold">+R$ {Math.round(diffMonthly * 12).toLocaleString('pt-BR')}</strong> extras por ano no seu bolso!
                </p>
              </div>
              <Link href="/cadastro" className="w-full md:w-auto">
                <Button className="w-full md:w-auto bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold px-8 h-12 transition-all shadow-sm hover:shadow">
                  Garantir Vaga
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
