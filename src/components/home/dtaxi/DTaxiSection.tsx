"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, TrendingUp, Compass, Award, ArrowRight } from "lucide-react"

export function DTaxiSection() {
  return (
    <section id="dtaxi-section" className="w-full py-20 lg:py-32 bg-white relative overflow-hidden select-none border-t border-slate-200">
      {/* Subtle corporate background glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-sky-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute left-10 top-10 w-[300px] h-[300px] bg-indigo-500/[0.01] rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge className="bg-sky-50 text-sky-700 border border-sky-200 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-xs">
            ✈️ Divisão Premium Executiva
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Não é só uma vaga. É o acesso à demanda mais qualificada de São Paulo.
          </h2>
          <p className="text-base md:text-lg text-slate-600 font-medium text-justify">
            Opere na divisão **D-Taxi Congonhas**. Esqueça as corridas comuns e atenda o mercado executivo corporativo de alto ticket.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">

          {/* Left Column: Visual Showcase Card */}
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[480px]">
            {/* Spotlight overlay */}
            <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-sky-500/[0.03] rounded-full blur-[60px]" />

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Homologação Oficial</span>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] uppercase tracking-wide">Fila Rápida Ativa</Badge>
              </div>

              <div className="relative w-full h-[220px] md:h-[250px] transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src="/images/cars/corolla-cross.png"
                  alt="D-Taxi Corolla Cross"
                  fill
                  className="object-contain filter drop-shadow-[0_15px_15px_rgba(15,23,42,0.12)]"
                  priority
                />
              </div>

              {/* Core Badges Row */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <span className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs">
                  ✈️ Homologado Congonhas
                </span>
                <span className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs">
                  💼 Operação Executiva
                </span>
                <span className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs">
                  🔋 Híbrido Premium
                </span>
                <span className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs">
                  ⛽ GNV Econômico
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 mt-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider">Faturamento Médio</p>
                <p className="text-xl md:text-2xl font-black text-slate-900">
                  R$ 12.000 <span className="text-xs text-slate-500 font-bold">a R$ 15.000 /mês</span>
                </p>
              </div>
              <Link href="/d-taxi-congonhas">
                <Button variant="outline" className="border-slate-200 hover:border-sky-350 hover:bg-sky-50 text-sky-700 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs">
                  Saiba mais <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Strategic Advantages list */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black text-sky-600 uppercase tracking-wider">Por que D-Taxi?</span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                A melhor praça de táxi do país a sua inteira disposição
              </h3>
            </div>

            <div className="space-y-5 pt-4">

              {/* Item 1 */}
              <div className="flex gap-4">
                <div className="bg-sky-50 text-sky-600 border border-sky-100 p-3 rounded-2xl h-fit shrink-0">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 mb-1">Acesso à Fila Digital de Congonhas</h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold text-justify">
                    Evite o tempo ocioso. Os carros D-Taxi são homologados digitalmente pela Prefeitura de São Paulo para entrar na área de embarque prioritária de Congonhas.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-4">
                <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-2xl h-fit shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 mb-1">Passageiros de Alta Renda (Corporativo)</h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold text-justify">
                    Transporte executivos de grandes multinacionais, turistas e passageiros frequentes dispostos a pagar por um serviço premium, com gorjetas elevadas.
                  </p>
                </div>
              </div>
              {/* Item 3 */}
              <div className="flex gap-4">
                <div className="bg-amber-50 text-amber-600 border border-amber-100 p-3 rounded-2xl h-fit shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-800 mb-1">
                    Tecnologia de Alta Eficiência Operacional
                  </h4>

                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold text-justify">
                    A operação D-Taxi oferece veículos híbridos, elétricos e modelos GNV altamente eficientes, incluindo Corolla Cross, Toyota Corolla, Prius e BYD, proporcionando mais autonomia operacional, conforto executivo e redução de custos no dia a dia.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex gap-4">
                <div className="bg-indigo-50 text-indigo-600 border border-indigo-100 p-3 rounded-2xl h-fit shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 mb-1">Isenções de Rodízio e Benefícios Fiscais</h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold text-justify">
                    Aproveite isenção total de rodízio municipal de São Paulo e circulação livre nas faixas e corredores de ônibus exclusivos a qualquer hora.
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Link href="/cadastro">
                <Button className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-bold h-12 px-8 rounded-2xl shadow-sm hover:shadow">
                  Garantir Vaga D-Taxi
                </Button>
              </Link>
              <Link href="/d-taxi-congonhas">
                <Button variant="ghost" className="w-full sm:w-auto text-slate-700 hover:text-sky-600 hover:bg-slate-50 font-bold h-12 px-6 rounded-2xl border border-slate-200">
                  Ver Requisitos e Detalhes
                </Button>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
