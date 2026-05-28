"use client"

import Link from "next/link"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  ShieldCheck,
  TrendingUp,
  Compass,
  Award,
  ArrowRight,
} from "lucide-react"

export function DTaxiSection() {
  return (
    <section
      id="dtaxi-section"
      className="relative w-full overflow-hidden border-t border-slate-200 bg-white py-20 lg:py-32 select-none"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute right-0 top-1/2 h-[400px] w-[600px] -translate-y-1/2 rounded-full bg-sky-500/[0.02] blur-[120px]" />
      <div className="pointer-events-none absolute left-10 top-10 h-[300px] w-[300px] rounded-full bg-indigo-500/[0.01] blur-[100px]" />

      <div className="container relative z-10 mx-auto px-6">
        {/* HEADER */}
        <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
          <Badge className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-sky-700 shadow-xs">
            ✈️ Divisão Premium Executiva
          </Badge>

          <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
            Muito mais que uma locação.
            <br />
            Uma operação executiva pronta para faturar.
          </h2>

          <p className="text-base font-medium text-slate-600 md:text-lg">
            Trabalhe na operação D-Taxi Congonhas utilizando veículos premium já
            credenciados para atuação no aeroporto e voltados ao atendimento do
            mercado corporativo executivo.
          </p>
        </div>

        {/* GRID */}
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
          {/* LEFT CARD */}
          <div className="relative flex min-h-[480px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm md:p-10 lg:col-span-6">
            {/* Spotlight */}
            <div className="absolute right-0 top-0 h-[200px] w-[300px] rounded-full bg-sky-500/[0.03] blur-[60px]" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Frota Executiva Disponível
                </span>

                <Badge className="border border-emerald-200 bg-emerald-50 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                  Operação Ativa
                </Badge>
              </div>

              {/* CAR IMAGE */}
              <div className="relative h-[220px] w-full transition-transform duration-500 hover:scale-[1.02] md:h-[250px]">
                <Image
                  src="/images/cars/corolla-cross.png"
                  alt="Toyota Corolla Cross D-Taxi"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_15px_15px_rgba(15,23,42,0.12)]"
                />
              </div>

              {/* TAGS */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-700 shadow-xs">
                  ✈️ Credenciado D-Taxi
                </span>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-700 shadow-xs">
                  💼 Operação Executiva
                </span>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-700 shadow-xs">
                  🔋 Híbrido Premium
                </span>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-700 shadow-xs">
                  ⛽ GNV Econômico
                </span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Faturamento Médio
                </p>

                <p className="text-xl font-black text-slate-900 md:text-2xl">
                  R$ 12.000
                  <span className="text-xs font-bold text-slate-500">
                    {" "}
                    a R$ 15.000 /mês
                  </span>
                </p>
              </div>

              <Link href="/d-taxi-congonhas">
                <Button
                  variant="outline"
                  className="flex items-center gap-1.5 rounded-xl border-slate-200 text-xs font-bold text-sky-700 shadow-xs hover:border-sky-300 hover:bg-sky-50"
                >
                  Saiba mais
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6 lg:col-span-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-sky-600">
                Por que escolher a D-Taxi?
              </span>

              <h3 className="text-2xl font-black leading-tight tracking-tight text-slate-900 md:text-3xl">
                Uma operação preparada para alta rentabilidade
              </h3>
            </div>

            <div className="space-y-5 pt-4">
              {/* ITEM 1 */}
              <div className="flex gap-4">
                <div className="h-fit shrink-0 rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sky-600">
                  <Compass className="h-5 w-5" />
                </div>

                <div>
                  <h4 className="mb-1 text-base font-extrabold text-slate-800">
                    Acesso à Operação de Congonhas
                  </h4>

                  <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                    Trabalhe em uma das operações mais movimentadas e rentáveis
                    do país, atendendo passageiros executivos e corporativos no
                    Aeroporto de Congonhas.
                  </p>
                </div>
              </div>

              {/* ITEM 2 */}
              <div className="flex gap-4">
                <div className="h-fit shrink-0 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <div>
                  <h4 className="mb-1 text-base font-extrabold text-slate-800">
                    Público Corporativo Premium
                  </h4>

                  <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                    Atenda executivos, turistas e passageiros frequentes que
                    priorizam conforto, qualidade e atendimento diferenciado.
                  </p>
                </div>
              </div>

              {/* ITEM 3 */}
              <div className="flex gap-4">
                <div className="h-fit shrink-0 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-amber-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h4 className="mb-1 text-base font-extrabold text-slate-800">
                    Veículos Econômicos e Modernos
                  </h4>

                  <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                    A frota conta com veículos híbridos, elétricos e modelos
                    GNV preparados para reduzir custos operacionais e elevar a
                    experiência do passageiro.
                  </p>
                </div>
              </div>

              {/* ITEM 4 */}
              <div className="flex gap-4">
                <div className="h-fit shrink-0 rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-indigo-600">
                  <Award className="h-5 w-5" />
                </div>

                <div>
                  <h4 className="mb-1 text-base font-extrabold text-slate-800">
                    Benefícios Exclusivos da Categoria
                  </h4>

                  <p className="text-xs font-semibold leading-relaxed text-slate-600 md:text-sm">
                    Aproveite benefícios operacionais como isenção de rodízio,
                    circulação em corredores autorizados e estrutura voltada ao
                    transporte executivo.
                  </p>
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col gap-4 pt-6 sm:flex-row">
              <Link href="/cadastro">
                <Button className="h-12 w-full rounded-2xl bg-sky-600 px-8 font-bold text-white shadow-sm hover:bg-sky-500 hover:shadow sm:w-auto">
                  Solicitar Pré-Cadastro
                </Button>
              </Link>

              <Link href="/d-taxi-congonhas">
                <Button
                  variant="ghost"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-6 font-bold text-slate-700 hover:bg-slate-50 hover:text-sky-600 sm:w-auto"
                >
                  Ver Detalhes da Operação
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}