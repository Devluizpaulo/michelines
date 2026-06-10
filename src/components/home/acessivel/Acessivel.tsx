"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Accessibility, Sparkles, Users, Briefcase, ChevronRight, 
  HelpCircle, GraduationCap, Award, CheckSquare, Heart
} from "lucide-react"
import { motion } from "framer-motion"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Vehicle } from "@/types/vehicle"
import { cn } from "@/lib/utils"

export function Acessivel() {
  const [activePhoto, setActivePhoto] = useState(0)
  const [accessibleVehicles, setAccessibleVehicles] = useState<Vehicle[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)

  // Fetch accessible vehicles dynamically
  useEffect(() => {
    const fetchAccessibleVehicles = async () => {
      try {
        setLoadingVehicles(true)
        const q = query(collection(db, "vehicles"), where("category", "==", "acessivel"))
        const snap = await getDocs(q)
        const list: Vehicle[] = []
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as Vehicle)
        })
        setAccessibleVehicles(list)
      } catch (err) {
        console.error("Erro ao buscar veículos acessíveis:", err)
      } finally {
        setLoadingVehicles(false)
      }
    }
    fetchAccessibleVehicles()
  }, [])

  const cards = [
    {
      icon: Accessibility,
      iconBg: "bg-sky-50 text-sky-600 border-sky-100",
      title: "Mobilidade Inclusiva",
      badge: "Inclusão",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      description: "Transporte especializado para pessoas com deficiência e mobilidade reduzida, promovendo autonomia, dignidade e acesso à cidade."
    },
    {
      icon: Briefcase,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      title: "Segmento Especializado",
      badge: "Segmento",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      description: "Atuação em uma modalidade diferenciada do transporte urbano, com requisitos específicos de acessibilidade e atendimento."
    },
    {
      icon: Users,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      title: "Passageiros Fidelizados",
      badge: "Fidelização",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Muitos usuários dependem frequentemente desse tipo de transporte para consultas, tratamentos, trabalho e atividades diárias, gerando relacionamentos duradouros com motoristas de confiança."
    },
    {
      icon: GraduationCap,
      iconBg: "bg-violet-50 text-violet-600 border-violet-100",
      title: "Capacitação Especializada",
      badge: "Treinamento",
      badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
      description: "Disponibilizamos veículos para motoristas credenciados no DTP e auxiliamos na homologação do curso obrigatório exigido por lei para o transporte de pessoas com mobilidade reduzida."
    },
    {
      icon: Award,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      title: "Operações Especializadas",
      badge: "Convênios",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Convênios, programas e operações corporativas ou governamentais voltados à acessibilidade, ampliando as oportunidades de atendimento e parcerias."
    }
  ]

  const comparisons = [
    { label: "Perfil de Atendimento", conventional: "Atendimento geral de passageiros", accessible: "Atendimento especializado e focado" },
    { label: "Perfil de Corrida", conventional: "Corridas ocasionais e avulsas", accessible: "Passageiros fidelizados e recorrentes" },
    { label: "Ambiente Competitivo", conventional: "Concorrência de mercado muito elevada", accessible: "Oferta limitada de veículos adaptados" },
    { label: "Propósito da Atuação", conventional: "Serviço convencional de transporte", accessible: "Serviço de inclusão e mobilidade social" },
    { label: "Relação com Cliente", conventional: "Relacionamento comercial transacional", accessible: "Relação de confiança e impacto humano" }
  ]

  const defaultPhotos = [
    {
      src: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
      title: "Spin Adaptada Michelines",
      description: "Acesso por rampa traseira homologada, cinto de segurança de 3 pontos para o cadeirante e espaço confortável."
    },
    {
      src: "https://images.openai.com/static-rsc-4/al-XfDhux_JMV_5FxWcG5fcsaQU1A7I-FZydeMfEUwLYVlBw5hpqJuNGb3EjTzsPwn666LZejXW59KJsaZS9eOyO6SLCnKcGNqU3Ze-0gqlJCRYm_HD6Wf1O_AZ9Ei4rs3WaqUKpSAraDGdglJOiSJyy5PwwliPQUhRWnbvM3VBeG4JgLk6jcEV6Q-LeflKQ?purpose=fullsize",
      title: "Embarque Seguro",
      description: "Acesso por rampa de alumínio leve e de alta resistência."
    },
    {
      src: "https://images.openai.com/static-rsc-4/9YJaa3S2sPAnHyBAPSBqASnAewjKAowvh1t7uosI27wX22ZwtBDkJEB1VYGKKLMXo7dmQyR8Sd4iWopOzFz9UJROSgn_8bNAVRhc0AJdVY0o1M7euZk2EiItUZHthiiOi3rndtLc9xfqgdujggJzvPmyVmFlZlirql4Bf1ikw72X1BADf7gqBZX8R4urmiPa?purpose=fullsize",
      title: "Fixação e Cintos",
      description: "Sistemas de travamento homologados para garantir estabilidade."
    },
    {
      src: "https://images.openai.com/static-rsc-4/D4xD1KYkkY28Mrgmfyd3JXrJz38RxoxS4KssWiDrY4rm-GKe3Oa6jNUc7jzuSA6fgWE2jJX56gkNtXyrRMnHrYJX0oPjjJtHg-eZuo08xf6oIxrVXJi7Jd9Lv7oLNw4UgJMJ0tBjx0E4km2c_GJuScUDLcHzrPW8VbxFVdrYKFJ8ytWal4ZORD95yqpi9X7v?purpose=fullsize",
      title: "Espaço Interno",
      description: "Altura e largura adequadas para o cadeirante e acompanhantes."
    }
  ]

  const photosList = accessibleVehicles.length > 0
    ? accessibleVehicles.map(v => ({
        src: v.thumbnail || (v.images && v.images[0]) || defaultPhotos[0].src,
        title: v.name,
        description: v.shortDescription || v.fullDescription || "Veículo adaptado e homologado para o transporte inclusivo."
      }))
    : defaultPhotos

  return (
    <section 
      id="acessivel" 
      className="relative w-full overflow-hidden bg-white py-20 lg:py-32 select-none border-t border-slate-100"
    >
      <div className="container relative z-10 mx-auto space-y-16 px-6 lg:px-12 max-w-6xl">
        
        {/* Title / Hero block */}
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <Badge className="rounded-full border border-sky-100 bg-sky-50 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700 shadow-sm">
            Programa de Táxi Acessível
          </Badge>

          <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
            Programa Michelines de Táxi Acessível
          </h2>

          <p className="text-sm font-semibold leading-relaxed text-slate-550 md:text-base max-w-3xl mx-auto">
            O táxi acessível conecta pessoas à saúde, ao trabalho, à educação e à independência. Além do impacto social, o motorista acessível atua em um segmento especializado, com menor oferta de veículos preparados e possibilidade de construir relações duradouras com passageiros, instituições e operações específicas.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div 
                key={idx}
                className="flex flex-col justify-between p-5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 hover:scale-[1.015] hover:-translate-y-0.5 space-y-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className={`h-8.5 w-8.5 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge className={`rounded-md border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${card.badgeColor}`}>
                    {card.badge}
                  </Badge>
                </div>
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">
                    {card.title}
                  </h4>
                  <p className="text-[10px] font-semibold leading-relaxed text-slate-500 mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nossa Frota Acessível Band */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-12 text-left">
          <div className="lg:col-span-5 space-y-4">
            <Badge className="bg-sky-50 text-sky-700 border border-sky-200 rounded-md text-[9px] font-black uppercase tracking-wider">
              Frota Preparada
            </Badge>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              Nossa Frota Acessível
            </h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-550">
              Veículos modernos adaptados com o que há de mais seguro no mercado, garantindo conformidade com as normas técnicas e total conforto ao passageiro.
            </p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            {[
              "Veículos adaptados",
              "Rampas homologadas",
              "Espaço para cadeira de rodas",
              "Ar-condicionado",
              "Revisões periódicas",
              "Suporte operacional"
            ].map((badge, bIdx) => (
              <div key={bIdx} className="flex items-center gap-2.5 p-3.5 bg-white border border-slate-150 rounded-2xl shadow-2xs hover:border-slate-350 hover:shadow-xs transition-all">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <span className="text-[11px] font-bold text-slate-700">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional content and Emotional quote block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch pt-4">
          {/* Institutional Block */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              Serviço Essencial e Especializado
            </h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-650">
              A acessibilidade é um direito fundamental. Em grandes centros urbanos como São Paulo, milhões de pessoas com deficiência ou dificuldades de locomoção enfrentam desafios constantes para se deslocar diariamente.
            </p>
            <p className="text-xs font-semibold leading-relaxed text-slate-650">
              Diante de uma oferta ainda muito limitada de veículos preparados, a capacitação e a profissionalização dos motoristas acessíveis tornam-se de extrema relevância social. O Grupo Michelines fomenta essa operação, fornecendo frotas adaptadas modernas e homologadas para que o taxista atue em um segmento diferenciado, combinando propósito humano com estabilidade operacional.
            </p>
            <p className="text-xs font-bold text-sky-600 italic">
              O táxi acessível não é apenas uma modalidade de transporte. É um serviço de inclusão e mobilidade urbana.
            </p>
          </div>

          {/* Emotional Quote Block */}
          <div className="lg:col-span-6 flex flex-col justify-center bg-slate-50 border border-slate-150 p-8 rounded-3xl relative overflow-hidden text-left shadow-sm">
            <span className="absolute right-6 top-4 text-7xl font-serif text-slate-200 select-none pointer-events-none">&ldquo;</span>
            <blockquote className="space-y-4 relative z-10">
              <p className="text-sm font-bold leading-relaxed text-slate-700 italic">
                Para milhares de pessoas, um táxi acessível não é apenas uma corrida. É a possibilidade de chegar a uma consulta médica, ir ao trabalho, visitar a família ou exercer a própria independência. O motorista acessível se torna parte fundamental dessa jornada de inclusão e cidadania.
              </p>
              <footer className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <cite className="text-[10px] font-black uppercase text-slate-450 tracking-wider not-italic">
                  Acessibilidade Michelines
                </cite>
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Evolved Market Comparative Grid */}
        <div className="space-y-6 pt-4">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider text-left flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Diferenciação e Posicionamento Operacional
          </h3>
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Fator Comparativo</th>
                    <th className="px-6 py-4">Operação Convencional</th>
                    <th className="px-6 py-4 text-sky-700 bg-sky-50/20">Táxi Acessível Michelines</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold">
                  {comparisons.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{row.label}</td>
                      <td className="px-6 py-4 text-slate-500">{row.conventional}</td>
                      <td className="px-6 py-4 text-slate-800 bg-sky-50/10 font-bold">{row.accessible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Real Vehicle Gallery */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-left">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Nossos Veículos Adaptados
              </h3>
              <p className="text-xs font-semibold leading-relaxed text-slate-450 mt-1">
                Visualização detalhada dos itens de acessibilidade e rampa de acesso do veículo.
              </p>
            </div>
            
            {/* Gallery Selector Buttons */}
            <div className="flex gap-2 select-none overflow-x-auto scrollbar-none">
              {photosList.map((ph, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 shrink-0",
                    activePhoto === idx
                      ? "border-sky-300 bg-sky-50 text-sky-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-350 hover:text-slate-700"
                  )}
                >
                  {ph.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Active Display Panel */}
            <div className="lg:col-span-8 flex flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
              <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-150 bg-slate-50 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photosList[activePhoto]?.src}
                  alt={photosList[activePhoto]?.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                />
                
                {/* Description Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-10 space-y-1 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-6 text-white text-left">
                  <h5 className="text-xs font-black uppercase tracking-wider">
                    {photosList[activePhoto]?.title}
                  </h5>
                  <p className="text-[10px] font-semibold text-slate-200 leading-normal">
                    {photosList[activePhoto]?.description}
                  </p>
                </div>
              </div>

              {/* Dynamic Differentials / Features for Accessible Vehicle */}
              {accessibleVehicles.length > 0 && accessibleVehicles[activePhoto] && (
                <div className="pt-3 border-t border-slate-100 text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Homologação & Diferenciais do Veículo
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold transition-all justify-center text-center",
                      accessibleVehicles[activePhoto].isAccessible 
                        ? "bg-violet-50 border-violet-200 text-violet-750 font-black" 
                        : "bg-slate-50 border-slate-150 text-slate-450 opacity-60"
                    )}>
                      <span>♿ Acessível</span>
                    </div>

                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold transition-all justify-center text-center",
                      accessibleVehicles[activePhoto].isAtendeApproved 
                        ? "bg-purple-50 border-purple-200 text-purple-750 font-black" 
                        : "bg-slate-50 border-slate-150 text-slate-450 opacity-60"
                    )}>
                      <span>♿ ATENDE</span>
                    </div>

                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold transition-all justify-center text-center",
                      accessibleVehicles[activePhoto].hasRadioAssociation 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-750 font-black" 
                        : "bg-slate-50 border-slate-150 text-slate-450 opacity-60"
                    )}>
                      <span>📻 Rádio</span>
                    </div>

                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold transition-all justify-center text-center",
                      accessibleVehicles[activePhoto].isDTPApproved 
                        ? "bg-blue-50 border-blue-200 text-blue-750 font-black" 
                        : "bg-slate-50 border-slate-150 text-slate-450 opacity-60"
                    )}>
                      <span>🏢 DTP/DETAXI</span>
                    </div>

                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold transition-all justify-center text-center",
                      accessibleVehicles[activePhoto].hasDTPCourseSupport 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-750 font-black" 
                        : "bg-slate-50 border-slate-150 text-slate-450 opacity-60"
                    )}>
                      <span>🎓 Curso DTP</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Thumbnail Grid */}
            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3.5">
              {photosList.map((ph, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-2xl border transition-all text-left shadow-sm",
                    activePhoto === idx
                      ? "border-sky-400 bg-sky-50/30 ring-1 ring-sky-300"
                      : "border-slate-200 bg-white hover:border-slate-350"
                  )}
                >
                  <div className="relative aspect-[4/3] w-20 overflow-hidden rounded-lg border border-slate-150 bg-slate-50 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ph.src}
                      alt={ph.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h6 className="text-[10px] font-black uppercase tracking-wide text-slate-800 truncate">
                      {ph.title}
                    </h6>
                    <p className="text-[9px] font-semibold text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
                      {ph.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Como Funciona Section */}
        <div className="space-y-8 pt-4 text-left">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
              Como se Credenciar no Programa
            </h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-450 mt-1">
              Fluxo simplificado para motoristas ingressarem no segmento de táxi acessível Michelines.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Cadastro de Interesse",
                description: "Preencha o formulário de cadastro indicando seu interesse em veículos acessíveis para registrar sua intenção diretamente no CRM."
              },
              {
                step: "02",
                title: "Homologação & Curso DTP",
                description: "A frota é disponibilizada para motoristas cadastrados no DTP. Damos total suporte na homologação do curso de transporte de mobilidade reduzida exigido por lei."
              },
              {
                step: "03",
                title: "Credenciamento e Operação",
                description: "Após aprovação e recebimento do veículo adaptado Michelines, você estará credenciado para atuar no segmento especializado com o suporte da nossa central."
              }
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-3.5 hover:border-slate-350 hover:bg-white transition-all shadow-2xs">
                <span className="text-3xl font-black text-slate-200 block font-mono">{item.step}</span>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">{item.title}</h4>
                  <p className="text-xs font-semibold leading-relaxed text-slate-550">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Block - Lead Capture Integration */}
        <div className="bg-[#1b3e72] text-white p-8 sm:p-12 rounded-3xl space-y-6 relative overflow-hidden shadow-lg border border-[#23569c] text-left">
          {/* Subtle light ambient glow */}
          <div className="pointer-events-none absolute right-[-10%] bottom-[-20%] z-0 h-[80%] w-[50%] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_70%)] rounded-full" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <Badge className="bg-sky-500/20 text-sky-200 border border-sky-400/20 px-3 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
              Cadastro de Interesse
            </Badge>
            
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Conheça o programa de táxi acessível Michelines
            </h3>
            
            <p className="text-xs sm:text-sm font-semibold text-sky-100/90 leading-relaxed">
              Nossa equipe orienta você sobre veículos adaptados, operação, capacitação e oportunidades dentro do transporte acessível. Cadastre seu interesse no formulário do CRM e dê o primeiro passo.
            </p>

            <p className="text-xs sm:text-sm font-bold text-sky-200 italic">
              "Você não está apenas dirigindo um veículo. Está ajudando pessoas a exercerem seu direito de ir e vir com dignidade."
            </p>

            <div className="pt-2">
              <Link href="/cadastro">
                <Button className="bg-sky-500 hover:bg-sky-450 text-white font-extrabold text-xs h-11 px-6 rounded-xl shadow-md flex items-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                  <span>Quero me Credenciar no Programa</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
