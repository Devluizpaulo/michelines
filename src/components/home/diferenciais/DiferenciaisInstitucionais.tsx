"use client"

import { useState } from "react"

import {
  PhoneCall,
  Shield,
  Wrench,
  Plane,
  Compass,
  CreditCard,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"

import Image from "next/image"

export function DiferenciaisInstitucionais() {
  const [activePhoto, setActivePhoto] = useState(0)

  const cards = [
    {
      icon: Plane,
      iconBg: "bg-sky-50 text-sky-600 border-sky-100",

      title: "Operação Executiva D-TAXI",

      badge: "Congonhas",

      badgeColor:
        "bg-sky-50 text-sky-700 border-sky-200",

      description:
        "Possibilidade de atuar em operações executivas e projetos homologados para atendimento à demanda corporativa.",
    },

    {
      icon: Compass,
      iconBg:
        "bg-indigo-50 text-indigo-600 border-indigo-100",

      title: "Corredores e Faixas Exclusivas",

      badge: "Mobilidade Urbana",

      badgeColor:
        "bg-indigo-50 text-indigo-700 border-indigo-200",

      description:
        "Acesso aos corredores e faixas exclusivas autorizadas, reduzindo o tempo perdido no trânsito e aumentando a produtividade diária.",
    },

    {
      icon: Wrench,
      iconBg:
        "bg-amber-50 text-amber-600 border-amber-100",

      title: "Oficina Própria",

      badge: "Manutenção",

      badgeColor:
        "bg-amber-50 text-amber-700 border-amber-200",

      description:
        "Manutenção preventiva e corretiva realizada em oficina própria para reduzir o tempo do veículo parado.",
    },

    {
      icon: PhoneCall,
      iconBg:
        "bg-teal-50 text-teal-600 border-teal-100",

      title: "Suporte Humanizado",

      badge: "Atendimento Real",

      badgeColor:
        "bg-teal-50 text-teal-700 border-teal-200",

      description:
        "Atendimento presencial e suporte direto com equipe humana para auxiliar o motorista no dia a dia da operação.",
    },

    {
      icon: Shield,
      iconBg:
        "bg-emerald-50 text-emerald-600 border-emerald-100",

      title: "Isenção de Rodízio Municipal",

      badge: "São Paulo",

      badgeColor:
        "bg-emerald-50 text-emerald-700 border-emerald-200",

      description:
        "Veículos preparados para operação táxi com isenção de rodízio municipal na cidade de São Paulo.",
    },

    {
      icon: CreditCard,
      iconBg:
        "bg-rose-50 text-rose-600 border-rose-100",

      title: "Pagamento Flexível",

      badge: "Financeiro",

      badgeColor:
        "bg-rose-50 text-rose-700 border-rose-200",

      description:
        "Diárias configuradas por veículo com opções de pagamento via Pix, débito, crédito e condições adaptadas à rotina do motorista.",
    },
  ]

  const photos = [
    {
      src: "/images/real/michelines_driver.png",

      title: "🚖 Operação Táxi",

      description:
        "Frota de táxis modernos e eficientes com todas as vantagens regulamentares da categoria.",
    },

    {
      src: "/images/real/michelines_workshop.png",

      title: "🛠 Oficina Própria",

      description:
        "Estrutura de mecânica interna dedicada para manter os veículos revisados e minimizar tempo parado.",
    },

    {
      src: "/images/real/michelines_lounge.png",

      title: "☕ Espaço do Motorista",

      description:
        "Área de descanso com Wi-Fi, café e suporte presencial para os motoristas parceiros.",
    },

    {
      src: "/images/real/michelines_showroom.png",

      title: "✈️ Operação D-TAXI",

      description:
        "Acesso à divisão executiva homologada para a fila rápida digital do Aeroporto de Congonhas.",
    },
  ]

  return (
    <section
      id="diferenciais"
      className="relative w-full bg-transparent py-20 lg:py-32 select-none"
    >
      {/* Background */}
      <div className="pointer-events-none absolute left-1/2 top-[-10%] z-0 h-[70%] w-[90%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.02),transparent_70%)]" />

      <div className="container relative z-10 mx-auto px-6">
        
        {/* HEADER */}
        <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
          
          <Badge className="rounded-full border border-white/10 bg-white/10 px-3.5 py-1 text-xs font-semibold text-sky-200 shadow-xs">
            Estrutura & Suporte Operacional
          </Badge>

          <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
            Mais do que um veículo.
            <br />
            Uma operação completa.
          </h2>

          <p className="text-base font-medium leading-relaxed text-sky-100/90 md:text-lg">
            Da manutenção à documentação, conte com uma estrutura criada para reduzir burocracia, minimizar imprevistos e manter você em operação.
          </p>
        </div>

        {/* GRID */}
        <div className="mx-auto grid max-w-6xl items-stretch gap-12 lg:grid-cols-12">
          
          {/* LEFT */}
          <div className="grid items-stretch gap-6 md:grid-cols-2 lg:col-span-7">
            
            {cards.map((card, idx) => {
              const Icon = card.icon

              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 transition-all duration-300 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="space-y-3.5">
                    
                    <div className="flex items-center justify-between">
                      
                      <div
                        className={`h-fit rounded-xl border p-2.5 ${card.iconBg}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <Badge
                        className={`${card.badgeColor} rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider`}
                      >
                        {card.badge}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      
                      <h4 className="text-sm font-extrabold text-slate-800">
                        {card.title}
                      </h4>

                      <p className="text-xs font-semibold leading-relaxed text-slate-500">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-between lg:col-span-5">
            
            <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              
              <div className="space-y-4">
                
                {/* TOP */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Estrutura Real
                  </span>

                  <Badge className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700">
                    Fotos Reais
                  </Badge>
                </div>

                {/* IMAGE */}
                <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
                  
                  <Image
                    src={photos[activePhoto].src}
                    alt={photos[activePhoto].title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-x-0 bottom-0 z-10 space-y-1 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-4 text-white">
                    
                    <h5 className="text-xs font-black uppercase tracking-wider">
                      {photos[activePhoto].title}
                    </h5>

                    <p className="text-[10px] font-semibold text-slate-200">
                      {photos[activePhoto].description}
                    </p>
                  </div>
                </div>

                {/* THUMBNAILS */}
                <div className="grid grid-cols-4 gap-2.5">
                  
                  {photos.map((ph, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhoto(idx)}
                      className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all ${
                        activePhoto === idx
                          ? "scale-[0.98] border-sky-500 shadow-sm"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Image
                        src={ph.src}
                        alt={ph.title}
                        fill
                        className="object-cover"
                        sizes="10vw"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4.5">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  💼 Resumo da Estrutura Michelines
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span> Oficina própria
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span> Corredores exclusivos
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span> Suporte operacional
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span> Isenção de rodízio
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span> Assistência em sinistros
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span> Operação D-TAXI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}