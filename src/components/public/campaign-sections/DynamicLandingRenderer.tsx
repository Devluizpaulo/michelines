"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowRight, CheckCircle2, Phone, ShieldCheck, Clock, Award, Car, Fuel,
  ChevronDown, MessageSquare, Send, Sparkles, AlertCircle, HelpCircle, User, Star
} from "lucide-react"
import { Campaign, CAMPAIGN_THEMES, campaignSignupUrl } from "@/types/campaign"
import {
  CampaignSection,
  HeroSectionConfig,
  ContextEmpathySectionConfig,
  Diferenciais4VSectionConfig,
  VehicleSpotlightSectionConfig,
  HowItWorksSectionConfig,
  TestimonialsSectionConfig,
  EarningsCalculatorSectionConfig,
  FaqAccordionSectionConfig,
  LeadFormSectionConfig,
  WhatsAppCtaSectionConfig,
} from "@/types/campaign-studio"
import { registerCampaignClick } from "@/lib/campaigns-crud"
import { createLead } from "@/lib/db/leads"
import { useToast } from "@/components/ui/toast-simple"
import { LOGO_IMAGES } from "@/lib/supabase"

interface DynamicLandingRendererProps {
  campaign: Campaign
  onCtaClick?: () => void
}

export function DynamicLandingRenderer({ campaign, onCtaClick }: DynamicLandingRendererProps) {
  const theme = CAMPAIGN_THEMES[campaign.theme] ?? CAMPAIGN_THEMES.navy
  const sections = campaign.sections || []

  const handleCta = () => {
    registerCampaignClick(campaign.id)
    if (onCtaClick) onCtaClick()
  }

  // Sort sections by order
  const activeSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.from} ${theme.to} text-white selection:bg-amber-400 selection:text-slate-900`}>
      {/* Header Fixo */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_IMAGES.banner}
              alt="Grupo Michelines"
              className="h-8 w-auto object-contain sm:h-9"
            />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/80 sm:inline-block">
              45 anos de tradição em SP
            </span>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCta}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-black text-slate-950 transition-all shadow-md hover:scale-105"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Plantão WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* Conteúdo Dinâmico das Seções 4V */}
      <main className="mx-auto max-w-5xl space-y-16 px-5 py-8">
        {activeSections.map((section) => (
          <SectionComponent
            key={section.id}
            section={section}
            campaign={campaign}
            theme={theme}
            onCta={handleCta}
          />
        ))}
      </main>

      {/* CTA Fixo Mobile */}
      <div className="sticky bottom-0 z-40 border-t border-white/15 bg-slate-950/90 p-3 backdrop-blur-md sm:hidden">
        <div className="flex gap-2">
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCta}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-black text-slate-950 active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" />
            WhatsApp
          </a>
          <Link
            href={campaignSignupUrl(campaign)}
            onClick={handleCta}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl ${theme.accent} text-sm font-black text-slate-950 active:scale-[0.98]`}
          >
            Alugar Agora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs font-medium text-white/50">
        <p>© {new Date().getFullYear()} Grupo Michelines — Frota de Veículos para Aplicativos e Táxi em SP.</p>
        <p className="mt-1 text-[10px] text-white/35">45 anos de tradição · Atendimento transparente e humanizado.</p>
      </footer>
    </div>
  )
}

function SectionComponent({
  section,
  campaign,
  theme,
  onCta,
}: {
  section: CampaignSection
  campaign: Campaign
  theme: any
  onCta: () => void
}) {
  switch (section.type) {
    case "hero":
      return <HeroRenderer config={section} campaign={campaign} theme={theme} onCta={onCta} />
    case "context_empathy":
      return <ContextEmpathyRenderer config={section} theme={theme} />
    case "diferenciais_4v":
      return <Diferenciais4VRenderer config={section} theme={theme} />
    case "vehicle_spotlight":
      return <VehicleSpotlightRenderer config={section} theme={theme} onCta={onCta} />
    case "how_it_works":
      return <HowItWorksRenderer config={section} theme={theme} />
    case "testimonials":
      return <TestimonialsRenderer config={section} theme={theme} />
    case "earnings_calculator":
      return <EarningsCalculatorRenderer config={section} theme={theme} onCta={onCta} />
    case "faq_accordion":
      return <FaqAccordionRenderer config={section} theme={theme} />
    case "lead_form":
      return <LeadFormRenderer config={section} campaign={campaign} theme={theme} onCta={onCta} />
    case "whatsapp_cta_banner":
      return <WhatsAppCtaRenderer config={section} theme={theme} onCta={onCta} />
    default:
      return null
  }
}

// 1. Hero
function HeroRenderer({
  config,
  campaign,
  theme,
  onCta,
}: {
  config: HeroSectionConfig
  campaign: Campaign
  theme: any
  onCta: () => void
}) {
  const signupHref = campaignSignupUrl(campaign)

  return (
    <div className="space-y-6 pt-4">
      {config.badgeText && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          {config.badgeText}
        </span>
      )}

      <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
        {config.title || campaign.headline}
      </h1>

      {(config.subtitle || campaign.subheadline) && (
        <p className="max-w-3xl text-lg font-bold leading-relaxed text-white/90 sm:text-xl">
          {config.subtitle || campaign.subheadline}
        </p>
      )}

      {config.imageUrl && (
        <div className="overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={config.imageUrl}
            alt={config.title}
            className="h-auto w-full object-cover max-h-[420px]"
          />
        </div>
      )}

      <div className="flex flex-col gap-3.5 pt-2 sm:flex-row sm:items-center">
        <Link
          href={config.primaryCtaUrl || signupHref}
          onClick={onCta}
          className={`inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl px-8 text-base font-black text-slate-950 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] sm:flex-none ${theme.accent} ${theme.accentHover}`}
        >
          {config.primaryCtaText || "Quero me cadastrar"}
          <ArrowRight className="h-5 w-5 shrink-0" />
        </Link>

        {config.showWhatsappBtn && (
          <a
            href={`https://wa.me/${config.whatsappPhone || "5511999999999"}?text=${encodeURIComponent(config.whatsappText || "Olá! Gostaria de alugar um veículo.")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCta}
            className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-2xl border border-white/25 bg-white/10 px-7 text-sm font-bold text-white transition-all hover:bg-white/20 backdrop-blur-sm"
          >
            <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
            Falar no WhatsApp
          </a>
        )}
      </div>

      <div className="grid gap-3 border-t border-white/15 pt-6 text-xs sm:grid-cols-3">
        <div className="flex items-center gap-2 font-bold text-white/80">
          <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" /> Sem análise impeditiva de score
        </div>
        <div className="flex items-center gap-2 font-bold text-white/80">
          <Clock className="h-4 w-4 text-amber-400 shrink-0" /> Retirada em até 24 horas em SP
        </div>
        <div className="flex items-center gap-2 font-bold text-white/80">
          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" /> Manutenção e seguro inclusos
        </div>
      </div>
    </div>
  )
}

// 2. Contexto & Empatia (V2 - Vínculo)
function ContextEmpathyRenderer({ config, theme }: { config: ContextEmpathySectionConfig; theme: any }) {
  return (
    <section className="space-y-6 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-md sm:p-8">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Vínculo & Empatia</span>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl">{config.title}</h2>
        {config.subtitle && <p className="mt-2 text-sm font-semibold text-white/75">{config.subtitle}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {config.cards?.map((card, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-2">
            <h3 className="text-base font-black text-white">{card.title}</h3>
            <p className="text-xs font-medium leading-relaxed text-white/70">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// 3. Os 4Vs Michelines (V1/V2)
function Diferenciais4VRenderer({ config, theme }: { config: Diferenciais4VSectionConfig; theme: any }) {
  return (
    <section className="space-y-6">
      <div className="text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Bíblia Criativa 4V</span>
        <h2 className="mt-1 text-2xl font-black sm:text-4xl">{config.title}</h2>
        {config.subtitle && <p className="mt-2 text-sm font-semibold text-white/75">{config.subtitle}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {config.items?.map((item, i) => (
          <div key={i} className="rounded-3xl border border-white/15 bg-white/10 p-6 space-y-2 backdrop-blur-sm">
            <span className="inline-block rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-0.5 text-[10px] font-black text-amber-300">
              {item.highlight}
            </span>
            <h3 className="text-lg font-black text-white">{item.title}</h3>
            <p className="text-xs font-medium leading-relaxed text-white/75">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// 4. Oferta de Veículo em Destaque (V1/V3)
function VehicleSpotlightRenderer({
  config,
  theme,
  onCta,
}: {
  config: VehicleSpotlightSectionConfig
  theme: any
  onCta: () => void
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="space-y-4 lg:col-span-7">
          <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
            {config.vehicleCategory || "Oferta Exclusiva da Campanha"}
          </span>
          <h2 className="text-2xl font-black sm:text-4xl text-white">{config.vehicleName}</h2>
          {config.subtitle && <p className="text-xs font-semibold text-white/75">{config.subtitle}</p>}

          <div className="flex flex-wrap gap-4 py-2">
            {config.dailyRate && (
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5">
                <span className="text-[10px] font-bold text-white/60 block uppercase">Diária</span>
                <span className="text-xl font-black text-amber-400">R$ {config.dailyRate}</span>
              </div>
            )}
            {config.weeklyRate && (
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5">
                <span className="text-[10px] font-bold text-white/60 block uppercase">Semanal</span>
                <span className="text-xl font-black text-white">R$ {config.weeklyRate}</span>
              </div>
            )}
            {config.monthlyRate && (
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5">
                <span className="text-[10px] font-bold text-white/60 block uppercase">Mensal</span>
                <span className="text-xl font-black text-white">R$ {config.monthlyRate}</span>
              </div>
            )}
          </div>

          <ul className="grid gap-2 text-xs font-bold text-white/85 sm:grid-cols-2">
            {config.features?.map((feat, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> {feat}
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <Link
              href={config.ctaUrl || "#cadastro"}
              onClick={onCta}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black text-slate-950 shadow-lg ${theme.accent}`}
            >
              {config.ctaText || "Garantir Este Veículo"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {config.imageUrl && (
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config.imageUrl} alt={config.vehicleName} className="h-auto w-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// 5. Como Funciona / Passo a Passo (V3)
function HowItWorksRenderer({ config, theme }: { config: HowItWorksSectionConfig; theme: any }) {
  return (
    <section className="space-y-6">
      <div className="text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Passo a Passo</span>
        <h2 className="mt-1 text-2xl font-black sm:text-4xl">{config.title}</h2>
        {config.subtitle && <p className="mt-2 text-sm font-semibold text-white/75">{config.subtitle}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {config.steps?.map((st) => (
          <div key={st.number} className="relative rounded-3xl border border-white/15 bg-white/5 p-6 space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 font-black text-slate-950 text-base">
              0{st.number}
            </span>
            <h3 className="text-base font-black text-white">{st.title}</h3>
            <p className="text-xs font-medium leading-relaxed text-white/70">{st.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// 6. Depoimentos & Prova Social (V3)
function TestimonialsRenderer({ config, theme }: { config: TestimonialsSectionConfig; theme: any }) {
  return (
    <section className="space-y-6">
      <div className="text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Prova Social</span>
        <h2 className="mt-1 text-2xl font-black sm:text-4xl">{config.title}</h2>
        {config.subtitle && <p className="mt-2 text-sm font-semibold text-white/75">{config.subtitle}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {config.items?.map((item, i) => (
          <div key={i} className="flex flex-col justify-between rounded-3xl border border-white/15 bg-white/10 p-6 space-y-4 backdrop-blur-sm">
            <div className="space-y-2">
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: item.rating || 5 }).map((_, r) => (
                  <Star key={r} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs font-medium italic leading-relaxed text-white/90">"{item.testimony}"</p>
            </div>
            <div>
              <p className="text-sm font-black text-white">{item.name}</p>
              <p className="text-[10px] font-bold text-amber-300">{item.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// 7. Calculadora de Ganhos/Economia (V1)
function EarningsCalculatorRenderer({
  config,
  theme,
  onCta,
}: {
  config: EarningsCalculatorSectionConfig
  theme: any
  onCta: () => void
}) {
  const [km, setKm] = useState(config.defaultKmPerDay || 200)

  const fuelPrice = config.fuelPricePerLiter || 5.89
  const hybridKm = config.hybridAvgKmPerLiter || 19.5
  const flexKm = config.flexAvgKmPerLiter || 9.8

  const flexDailyCost = (km / flexKm) * fuelPrice
  const hybridDailyCost = (km / hybridKm) * fuelPrice

  const dailySavings = Math.max(0, flexDailyCost - hybridDailyCost)
  const monthlySavings = dailySavings * 26 // 26 dias rodados

  return (
    <section className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-400/10 to-slate-950 p-6 sm:p-8 backdrop-blur-md space-y-6">
      <div className="text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Simulador de Economia</span>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl">{config.title}</h2>
        {config.subtitle && <p className="mt-1 text-xs font-semibold text-white/75">{config.subtitle}</p>}
      </div>

      <div className="mx-auto max-w-xl space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-white">
            <span>Quantos km você roda por dia?</span>
            <span className="text-amber-400 font-black">{km} km/dia</span>
          </div>
          <input
            type="range"
            min={80}
            max={350}
            step={10}
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            className="h-2 w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-center pt-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <span className="text-[10px] font-bold text-white/60 block uppercase">Economia no Dia</span>
            <span className="text-2xl font-black text-amber-400">R$ {dailySavings.toFixed(0)}</span>
          </div>
          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/20 p-4">
            <span className="text-[10px] font-bold text-amber-200 block uppercase">Economia no Mês</span>
            <span className="text-2xl font-black text-amber-300">R$ {monthlySavings.toFixed(0)}</span>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="#cadastro"
            onClick={onCta}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-8 text-sm font-black text-slate-950 ${theme.accent}`}
          >
            {config.ctaText || "Quero Economizar Agora"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// 8. FAQ Accordion (V3/V4)
function FaqAccordionRenderer({ config, theme }: { config: FaqAccordionSectionConfig; theme: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="space-y-6">
      <div className="text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Dúvidas Frequentes</span>
        <h2 className="mt-1 text-2xl font-black sm:text-4xl">{config.title}</h2>
        {config.subtitle && <p className="mt-2 text-sm font-semibold text-white/75">{config.subtitle}</p>}
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {config.items?.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left font-bold text-white text-sm"
              >
                <span>{item.question}</span>
                <ChevronDown className={`h-4 w-4 text-amber-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-white/10 p-4 text-xs font-medium leading-relaxed text-white/80 bg-black/20">
                  {item.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// 9. Formulário de Captura Direta (V4)
function LeadFormRenderer({
  config,
  campaign,
  theme,
  onCta,
}: {
  config: LeadFormSectionConfig
  campaign: Campaign
  theme: any
  onCta: () => void
}) {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [vehicle, setVehicle] = useState(campaign.vehicleInterest || "")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { success, error: showError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !phone) return

    try {
      setSubmitting(true)
      await createLead({
        fullName,
        phone,
        vehicleInterest: vehicle || campaign.vehicleInterest || "Geral",
        source: `campanha_${campaign.slug}`,
        notes: `Cadastrado direto pela landing page /c/${campaign.slug}`,
      })

      onCta()
      setSubmitted(true)
      success("Cadastro enviado!", "Nosso consultor entrará em contato em breve.")
    } catch (err: any) {
      console.error(err)
      showError("Erro ao enviar", "Tente novamente ou entre em contato pelo WhatsApp.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="cadastro" className="scroll-mt-20 overflow-hidden rounded-3xl border border-white/20 bg-slate-900 p-6 sm:p-10 shadow-2xl space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Cadastro Direto</span>
        <h2 className="mt-1 text-2xl font-black sm:text-4xl text-white">{config.title}</h2>
        {config.subtitle && <p className="mt-2 text-xs font-semibold text-white/75">{config.subtitle}</p>}
      </div>

      {submitted ? (
        <div className="mx-auto max-w-md text-center space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-black text-white">Cadastro Recebido!</h3>
          <p className="text-xs text-white/80">{config.successMessage || "Nosso consultor entrará em contato em minutos."}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/80 block">Seu Nome Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: João da Silva"
              className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-white/80 block">Seu WhatsApp com DDD</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-white/80 block">Modelo de Interesse</label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Ex: Corolla Híbrido, D-Taxi, Spin..."
              className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`h-14 w-full rounded-2xl text-base font-black text-slate-950 shadow-xl transition-all ${theme.accent} hover:scale-[1.01] active:scale-[0.99]`}
          >
            {submitting ? "Enviando..." : config.buttonText || "Enviar Cadastro para Análise"}
          </button>
        </form>
      )}
    </section>
  )
}

// 10. Banner WhatsApp (V4)
function WhatsAppCtaRenderer({
  config,
  theme,
  onCta,
}: {
  config: WhatsAppCtaSectionConfig
  theme: any
  onCta: () => void
}) {
  const phone = config.phone || "5511999999999"
  const message = encodeURIComponent(config.customMessage || "Olá! Gostaria de informações sobre locação.")

  return (
    <section className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-6 sm:p-8 text-center space-y-4">
      <h2 className="text-2xl font-black sm:text-3xl text-white">{config.title}</h2>
      {config.subtitle && <p className="text-xs font-semibold text-white/80 max-w-lg mx-auto">{config.subtitle}</p>}

      <div className="pt-2">
        <a
          href={`https://wa.me/${phone}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCta}
          className="inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-8 text-base font-black text-slate-950 shadow-xl transition-transform hover:scale-105"
        >
          <Phone className="h-5 w-5" />
          {config.buttonText || "Falar com Consultor no WhatsApp"}
        </a>
      </div>
    </section>
  )
}
