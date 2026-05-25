"use client"

import { useState } from "react"
import { PhoneCall, Shield, Coffee, Hammer, RefreshCw, AlertCircle, ArrowRight, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function DiferenciaisInstitucionais() {
  const [activePhoto, setActivePhoto] = useState(0)

  const cards = [
    {
      icon: PhoneCall,
      iconBg: "bg-sky-50 text-sky-600 border-sky-100",
      title: "Suporte Operacional Real",
      badge: "Humano",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      description: "Atendimento presencial e telefônico por equipe humana. Sem chamados ignorados ou robôs."
    },
    {
      icon: Hammer,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      title: "Oficina Própria Integrada",
      badge: "Manutenção",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Mecânica preventiva e corretiva interna para agilizar revisões e evitar tempo parado."
    },
    {
      icon: Shield,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      title: "Previsibilidade Financeira",
      badge: "Estabilidade",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Diárias contratuais de segunda a sábado. Domingos e feriados nacionais são 100% isentos."
    },
    {
      icon: Coffee,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      title: "Estrutura para o Motorista",
      badge: "Lounge Físico",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      description: "Sede física com Wi-Fi, café expresso e área de descanso planejada para suas pausas."
    },
    {
      icon: AlertCircle,
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      title: "Isenção Total de Rodízio",
      badge: "Circular Livre",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      description: "Veículos registrados com isenção total de rodízio municipal em São Paulo."
    },
    {
      icon: RefreshCw,
      iconBg: "bg-teal-50 text-teal-600 border-teal-100",
      title: "Frota Moderna & Revisada",
      badge: "2 a 3 anos",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      description: "Modelos seminovos com inspeções preventivas regulares para rodar com total segurança."
    }
  ]

  const photos = [
    {
      src: "/images/real/michelines_driver.png",
      title: "Mobilidade e Operação Executiva",
      description: "Motorista qualificado e frota preparada."
    },
    {
      src: "/images/real/michelines_workshop.png",
      title: "Oficina Própria Integrada",
      description: "Equipe especializada e manutenção preventiva rápida."
    },
    {
      src: "/images/real/michelines_lounge.png",
      title: "Driver Lounge e Espaço Café",
      description: "Estrutura de apoio completa com Wi-Fi e café."
    },
    {
      src: "/images/real/michelines_showroom.png",
      title: "Showroom de Frota Premium",
      description: "Veículos revisados prontos para rodar."
    }
  ]

  return (
    <section id="diferenciais" className="w-full py-20 lg:py-32 bg-[#F8FAFC] border-t border-slate-200/60 relative select-none">
      
      {/* Light Radial Spot */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90%] h-[70%] bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.02),transparent_70%)] pointer-events-none z-0" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge className="bg-sky-50 text-sky-700 border-sky-200 px-3.5 py-1 rounded-full text-xs font-semibold border shadow-xs">
            Parceria & Suporte Humano
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Por que muitos motoristas estão migrando dos aplicativos?
          </h2>
          <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed text-justify">
            Descubra o respaldo de rodar com uma plataforma profissional de mobilidade urbana com suporte humano e infraestrutura completa.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-stretch">
          
          {/* Left: 6 Executive Cards */}
          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6 items-stretch">
            {cards.map((card, idx) => {
              const Icon = card.icon
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-350 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl border ${card.iconBg} h-fit`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge className={`${card.badgeColor} border font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md`}>
                        {card.badge}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-extrabold text-slate-800">{card.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold text-justify">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Photography Real Showcase */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between h-full shadow-sm">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estrutura Real</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-250 text-[9px] font-black uppercase py-0.5 px-2">
                    Foto Real
                  </Badge>
                </div>
                
                {/* Photo Display Viewport */}
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-150 bg-slate-50 shadow-inner group">
                  <Image 
                    src={photos[activePhoto].src}
                    alt={photos[activePhoto].title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-102"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                  
                  {/* Photo Title Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-4 text-white space-y-1 z-10">
                    <h5 className="text-xs font-black uppercase tracking-wider">{photos[activePhoto].title}</h5>
                    <p className="text-[10px] text-slate-200 font-semibold">{photos[activePhoto].description}</p>
                  </div>
                </div>

                {/* Thumbnails list selector */}
                <div className="grid grid-cols-4 gap-2.5">
                  {photos.map((ph, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhoto(idx)}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                        activePhoto === idx 
                          ? "border-sky-500 shadow-sm scale-98" 
                          : "border-slate-200 hover:border-slate-350"
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

              {/* Trust statement footer */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2 mt-4">
                <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  🛡️ Você Não Está Sozinho
                </p>
                <p className="text-[10px] text-slate-550 leading-relaxed font-semibold text-justify">
                  Suporte humanizado com orientação rápida, agendamento de revisões e acompanhamento completo de sinistros.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
