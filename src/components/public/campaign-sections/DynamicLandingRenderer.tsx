"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowRight, CheckCircle2, Phone, ShieldCheck, Clock, Award, Car, Fuel,
  ChevronDown, MessageSquare, Send, Sparkles, AlertCircle, HelpCircle, User, Star,
  TrendingUp, Check, Zap
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

// ── DEFINIÇÃO DE TEMAS COM CORES GARANTIDAS E ALTO CONTRASTE ───────────────────
interface ThemePalette {
  bgGradient: string
  bgColor: string
  accentGradient: string
  accentHover: string
  accentText: string
  badgeBg: string
  badgeBorder: string
  badgeText: string
  glowRgba: string
  cardBg: string
  cardBorder: string
}

const THEME_PALETTES: Record<string, ThemePalette> = {
  navy: {
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #0f1d38 0%, #060b14 55%, #020408 100%)",
    bgColor: "#020408",
    accentGradient: "bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-slate-950 shadow-amber-500/25",
    accentHover: "hover:from-amber-300 hover:to-amber-400",
    accentText: "text-slate-950",
    badgeBg: "bg-amber-400/10",
    badgeBorder: "border-amber-400/40",
    badgeText: "text-amber-300",
    glowRgba: "rgba(37, 99, 235, 0.25)",
    cardBg: "bg-slate-900/80 backdrop-blur-xl",
    cardBorder: "border-slate-800 hover:border-slate-700",
  },
  amber: {
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #2f1304 0%, #120601 55%, #050201 100%)",
    bgColor: "#050201",
    accentGradient: "bg-gradient-to-r from-amber-400 via-amber-400 to-orange-500 text-slate-950 shadow-amber-500/25",
    accentHover: "hover:from-amber-300 hover:to-amber-400",
    accentText: "text-slate-950",
    badgeBg: "bg-amber-400/10",
    badgeBorder: "border-amber-400/40",
    badgeText: "text-amber-300",
    glowRgba: "rgba(245, 158, 11, 0.25)",
    cardBg: "bg-stone-900/80 backdrop-blur-xl",
    cardBorder: "border-stone-800 hover:border-stone-700",
  },
  emerald: {
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #062f22 0%, #03140e 55%, #010805 100%)",
    bgColor: "#010805",
    accentGradient: "bg-gradient-to-r from-emerald-400 via-emerald-400 to-teal-500 text-slate-950 shadow-emerald-500/25",
    accentHover: "hover:from-emerald-300 hover:to-emerald-400",
    accentText: "text-slate-950",
    badgeBg: "bg-emerald-400/10",
    badgeBorder: "border-emerald-400/40",
    badgeText: "text-emerald-300",
    glowRgba: "rgba(16, 185, 129, 0.25)",
    cardBg: "bg-slate-900/80 backdrop-blur-xl",
    cardBorder: "border-slate-800 hover:border-emerald-900/60",
  },
  violet: {
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #290d4a 0%, #0e041c 55%, #04010a 100%)",
    bgColor: "#04010a",
    accentGradient: "bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-500 text-slate-950 shadow-violet-500/25",
    accentHover: "hover:from-violet-300 hover:to-violet-400",
    accentText: "text-slate-950",
    badgeBg: "bg-violet-400/10",
    badgeBorder: "border-violet-400/40",
    badgeText: "text-violet-300",
    glowRgba: "rgba(139, 92, 246, 0.25)",
    cardBg: "bg-slate-900/80 backdrop-blur-xl",
    cardBorder: "border-slate-800 hover:border-violet-900/60",
  },
  editorial: {
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #241403 0%, #0c0701 55%, #030200 100%)",
    bgColor: "#030200",
    accentGradient: "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-amber-500/30",
    accentHover: "hover:from-amber-300 hover:to-amber-200",
    accentText: "text-slate-950",
    badgeBg: "bg-amber-400/15",
    badgeBorder: "border-amber-400/40",
    badgeText: "text-amber-300",
    glowRgba: "rgba(217, 119, 6, 0.35)",
    cardBg: "bg-[#110c06]/90 backdrop-blur-xl",
    cardBorder: "border-amber-900/40 hover:border-amber-600/50",
  },
  minimal: {
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #1a1e26 0%, #0b0d12 55%, #020304 100%)",
    bgColor: "#020304",
    accentGradient: "bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 shadow-white/10",
    accentHover: "hover:from-white hover:to-slate-200",
    accentText: "text-slate-950",
    badgeBg: "bg-white/10",
    badgeBorder: "border-white/20",
    badgeText: "text-slate-200",
    glowRgba: "rgba(148, 163, 184, 0.2)",
    cardBg: "bg-slate-900/80 backdrop-blur-xl",
    cardBorder: "border-slate-800 hover:border-slate-700",
  },
}

// Fallback inteligente para imagem de veículo
function resolveVehicleImage(campaign: Campaign, customUrl?: string): string {
  if (customUrl && customUrl.trim().length > 0) return customUrl
  if (campaign.imageUrl && campaign.imageUrl.trim().length > 0) return campaign.imageUrl

  const text = `${campaign.name} ${campaign.vehicleInterest || ""} ${campaign.headline || ""}`.toLowerCase()
  if (text.includes("spin")) return "/images/cars/spin.png"
  if (text.includes("corolla sedan") || (text.includes("corolla") && !text.includes("cross"))) return "/images/cars/corolla.png"
  if (text.includes("ioniq")) return "/images/cars/ioniq.png"
  if (text.includes("king")) return "/images/cars/King.png"
  if (text.includes("virtus")) return "/images/cars/virtus.png"
  if (text.includes("onix")) return "/images/cars/onix-plus.png"
  if (text.includes("acessivel") || text.includes("adaptado") || text.includes("pcd")) return "/images/cars/Acessivel.png"
  if (text.includes("dtaxi") || text.includes("d-taxi")) return "/images/cars/Cross Dtaxi.png"

  return "/images/cars/cross.png"
}

export function DynamicLandingRenderer({ campaign, onCtaClick }: DynamicLandingRendererProps) {
  const palette = THEME_PALETTES[campaign.theme] || THEME_PALETTES.navy
  const sections = campaign.sections || []

  const handleCta = () => {
    registerCampaignClick(campaign.id)
    if (onCtaClick) onCtaClick()
  }

  // Ordena seções ativas
  const activeSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)

  return (
    <div
      style={{
        background: palette.bgGradient,
        backgroundColor: palette.bgColor,
        minHeight: "100vh",
      }}
      className="min-h-screen text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950 font-sans"
    >
      {/* Header Fixo Transparente com Glassmorphism */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_IMAGES.banner}
              alt="Grupo Michelines"
              className="h-7 w-auto object-contain sm:h-8"
            />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold text-amber-300 sm:inline-flex">
              <Sparkles className="h-3 w-3 text-amber-400" />
              45 anos de tradição em SP
            </span>
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20loca%C3%A7%C3%A3o%20de%20ve%C3%ADculos"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCta}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950 transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95"
            >
              <Phone className="h-3.5 w-3.5 fill-slate-950" />
              <span>Plantão WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* Conteúdo Dinâmico das Seções */}
      <main className="mx-auto max-w-5xl space-y-16 px-4 sm:px-6 py-8 sm:py-12">
        {activeSections.map((section) => (
          <SectionComponent
            key={section.id}
            section={section}
            campaign={campaign}
            palette={palette}
            onCta={handleCta}
          />
        ))}
      </main>

      {/* CTA Fixo Mobile Inferior */}
      <div className="sticky bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 p-3 backdrop-blur-xl sm:hidden">
        <div className="flex gap-2">
          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20quero%20alugar%20um%20ve%C3%ADculo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCta}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-black text-slate-950 shadow-lg active:scale-95 transition-transform"
          >
            <Phone className="h-4 w-4 fill-slate-950" />
            WhatsApp
          </a>
          <a
            href="#cadastro"
            onClick={handleCta}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl ${palette.accentGradient} text-sm font-black active:scale-95 transition-transform`}
          >
            Alugar Agora
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 px-5 py-10 text-center text-xs font-medium text-slate-400">
        <div className="mx-auto max-w-md space-y-2">
          <p className="font-bold text-slate-300">
            © {new Date().getFullYear()} Grupo Michelines — Locação de Veículos para Aplicativos e Táxi em SP.
          </p>
          <p className="text-[11px] text-slate-500">
            45 anos de tradição · Frota própria, manutenção 100% inclusa e atendimento humanizado.
          </p>
        </div>
      </footer>
    </div>
  )
}

function SectionComponent({
  section,
  campaign,
  palette,
  onCta,
}: {
  section: CampaignSection
  campaign: Campaign
  palette: ThemePalette
  onCta: () => void
}) {
  switch (section.type) {
    case "hero":
      return <HeroRenderer config={section} campaign={campaign} palette={palette} onCta={onCta} />
    case "context_empathy":
      return <ContextEmpathyRenderer config={section} palette={palette} />
    case "diferenciais_4v":
      return <Diferenciais4VRenderer config={section} palette={palette} />
    case "vehicle_spotlight":
      return <VehicleSpotlightRenderer config={section} campaign={campaign} palette={palette} onCta={onCta} />
    case "how_it_works":
      return <HowItWorksRenderer config={section} palette={palette} />
    case "testimonials":
      return <TestimonialsRenderer config={section} palette={palette} />
    case "earnings_calculator":
      return <EarningsCalculatorRenderer config={section} palette={palette} onCta={onCta} />
    case "faq_accordion":
      return <FaqAccordionRenderer config={section} palette={palette} />
    case "lead_form":
      return <LeadFormRenderer config={section} campaign={campaign} palette={palette} onCta={onCta} />
    case "whatsapp_cta_banner":
      return <WhatsAppCtaRenderer config={section} palette={palette} onCta={onCta} />
    default:
      return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HERO COM LAYOUT 2 COLUNAS & FOTO DO CARRO COM ALTO CONTRASTE
// ─────────────────────────────────────────────────────────────────────────────
function HeroRenderer({
  config,
  campaign,
  palette,
  onCta,
}: {
  config: HeroSectionConfig
  campaign: Campaign
  palette: ThemePalette
  onCta: () => void
}) {
  const signupHref = config.primaryCtaUrl || "#cadastro"
  const carImage = resolveVehicleImage(campaign, config.imageUrl)

  return (
    <div className="relative pt-2 sm:pt-4">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
        {/* Coluna da Esquerda: Textos, Selos e CTAs */}
        <div className="space-y-6 lg:col-span-7">
          {config.badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300 backdrop-blur-sm shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>{config.badgeText}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black leading-[1.12] tracking-tight text-white">
            {config.title || campaign.headline}
          </h1>

          {(config.subtitle || campaign.subheadline) && (
            <p className="max-w-xl text-base sm:text-lg font-medium leading-relaxed text-slate-300">
              {config.subtitle || campaign.subheadline}
            </p>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <Link
              href={signupHref}
              onClick={onCta}
              className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-8 text-base font-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${palette.accentGradient} ${palette.accentHover}`}
            >
              <span>{config.primaryCtaText || "Quero me cadastrar"}</span>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </Link>

            {config.showWhatsappBtn !== false && (
              <a
                href={`https://wa.me/${config.whatsappPhone || "5511999999999"}?text=${encodeURIComponent(config.whatsappText || "Olá! Gostaria de alugar um veículo da frota.")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onCta}
                className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 text-sm font-bold text-emerald-300 transition-all hover:bg-emerald-500/20 backdrop-blur-sm active:scale-[0.98]"
              >
                <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>WhatsApp Plantão</span>
              </a>
            )}
          </div>

          {/* 3 Pilares de Confiança */}
          <div className="grid gap-2.5 border-t border-slate-800/80 pt-6 text-xs sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 p-2.5 border border-slate-800 font-bold text-slate-200">
              <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Sem score impeditivo</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 p-2.5 border border-slate-800 font-bold text-slate-200">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Retirada em até 24h</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 p-2.5 border border-slate-800 font-bold text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Manutenção e seguro 100%</span>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Vitrine do Veículo em Destaque */}
        <div className="relative lg:col-span-5 flex items-center justify-center">
          {/* Luz Ambiente Atrás do Carro */}
          <div
            className="absolute -inset-4 rounded-full blur-3xl opacity-60 pointer-events-none"
            style={{ background: palette.glowRgba }}
          />

          <div className="relative w-full overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
            {/* Badge Flutuante Superior */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-300">
                <Fuel className="h-3.5 w-3.5 text-emerald-400" />
                Até 22 km/l em SP
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                Pronta Entrega
              </span>
            </div>

            {/* Imagem do Veículo */}
            <div className="relative py-4 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={carImage}
                alt={campaign.name}
                className="h-auto w-full max-h-[300px] object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Informações Resumidas do Veículo */}
            <div className="mt-2 rounded-2xl border border-slate-800 bg-black/40 p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modelo Oficial</p>
                <p className="text-sm font-black text-white">
                  {campaign.vehicleInterest || "Corolla Cross Híbrido"}
                </p>
              </div>
              <Link
                href="#cadastro"
                className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-bold text-white transition-colors"
              >
                Ver Valores
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONTEXTO & EMPATIA (V2 - VÍNCULO)
// ─────────────────────────────────────────────────────────────────────────────
function ContextEmpathyRenderer({
  config,
  palette,
}: {
  config: ContextEmpathySectionConfig
  palette: ThemePalette
}) {
  const cards = config.cards || []

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md">
      <div className="max-w-2xl">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Vínculo & Empatia · V2
        </span>
        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">{config.title}</h2>
        {config.subtitle && (
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-300">
            {config.subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-2 transition-all hover:border-slate-700 hover:shadow-lg"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 font-black text-xs">
              0{i + 1}
            </div>
            <h3 className="text-base font-black text-white">{card.title}</h3>
            <p className="text-xs font-medium leading-relaxed text-slate-300">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. OS 4Vs MICHELINES (V1/V2/V3/V4)
// ─────────────────────────────────────────────────────────────────────────────
function Diferenciais4VRenderer({
  config,
  palette,
}: {
  config: Diferenciais4VSectionConfig
  palette: ThemePalette
}) {
  const items = config.items || []

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Pilares da Parceria Michelines
        </span>
        <h2 className="mt-1 text-2xl font-black text-white sm:text-4xl">{config.title}</h2>
        {config.subtitle && (
          <p className="mt-2 text-sm font-medium text-slate-300 leading-relaxed">
            {config.subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-6 space-y-3 backdrop-blur-sm transition-all hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/5"
          >
            <span className="inline-block rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-1 text-[11px] font-black text-amber-300">
              {item.highlight}
            </span>
            <h3 className="text-lg font-black text-white group-hover:text-amber-200 transition-colors">
              {item.title}
            </h3>
            <p className="text-xs font-medium leading-relaxed text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. OFERTA DE VEÍCULO EM DESTAQUE (V1/V3)
// ─────────────────────────────────────────────────────────────────────────────
function VehicleSpotlightRenderer({
  config,
  campaign,
  palette,
  onCta,
}: {
  config: VehicleSpotlightSectionConfig
  campaign: Campaign
  palette: ThemePalette
  onCta: () => void
}) {
  const carImage = resolveVehicleImage(campaign, config.imageUrl)

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-10 shadow-2xl">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
        {/* Informações da Oferta */}
        <div className="space-y-5 lg:col-span-7">
          <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300">
            {config.vehicleCategory || "Oferta Exclusiva da Campanha"}
          </span>
          <h2 className="text-2xl font-black sm:text-4xl text-white">{config.vehicleName}</h2>
          {config.subtitle && (
            <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
              {config.subtitle}
            </p>
          )}

          {/* Cards de Preço / Valores */}
          <div className="flex flex-wrap gap-3 py-2">
            {config.dailyRate && (
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 min-w-[120px]">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Diária</span>
                <span className="text-2xl font-black text-amber-400">R$ {config.dailyRate}</span>
              </div>
            )}
            {config.weeklyRate && (
              <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 min-w-[120px]">
                <span className="text-[10px] font-bold text-amber-300 block uppercase">Semanal</span>
                <span className="text-2xl font-black text-white">R$ {config.weeklyRate}</span>
              </div>
            )}
            {config.monthlyRate && (
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 min-w-[120px]">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Mensal</span>
                <span className="text-2xl font-black text-white">R$ {config.monthlyRate}</span>
              </div>
            )}
          </div>

          {/* Lista de Vantagens / Itens Inclusos */}
          <ul className="grid gap-2.5 text-xs font-bold text-slate-200 sm:grid-cols-2 pt-1">
            {config.features && config.features.length > 0 ? (
              config.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Consumo urbano de até 22 km/l
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Manutenção preventiva inclusa
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Seguro total e assistência 24h
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Aprovado para Uber Black & Comfort
                </li>
              </>
            )}
          </ul>

          <div className="pt-2">
            <Link
              href={config.ctaUrl || "#cadastro"}
              onClick={onCta}
              className={`inline-flex h-13 items-center justify-center gap-2 rounded-2xl px-7 text-sm font-black shadow-lg transition-all hover:scale-105 ${palette.accentGradient}`}
            >
              <span>{config.ctaText || "Garantir Este Veículo"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Foto do Veículo em Destaque */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full rounded-3xl border border-slate-800 bg-black/40 p-4 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={carImage}
              alt={config.vehicleName}
              className="h-auto w-full max-h-[260px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. COMO FUNCIONA / PASSO A PASSO (V3)
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorksRenderer({
  config,
  palette,
}: {
  config: HowItWorksSectionConfig
  palette: ThemePalette
}) {
  const steps = config.steps || [
    { number: 1, title: "Envie seus dados", description: "Preencha o formulário rápido com seu WhatsApp e CNH." },
    { number: 2, title: "Análise sem Score", description: "Avaliamos seu perfil sem burocracia ou exigência de score alto." },
    { number: 3, title: "Assinatura Digital", description: "Contrato transparente e 100% digital direto no seu celular." },
    { number: 4, title: "Retirada em 24h", description: "Pegue seu carro higienizado e abastecido na Zona Sul de SP." },
  ]

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Passo a Passo Simplificado
        </span>
        <h2 className="mt-1 text-2xl font-black text-white sm:text-4xl">{config.title}</h2>
        {config.subtitle && (
          <p className="mt-2 text-sm font-medium text-slate-300 leading-relaxed">
            {config.subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((st) => (
          <div
            key={st.number}
            className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 backdrop-blur-sm transition-all hover:border-slate-700"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 font-black text-slate-950 text-base shadow-md shadow-amber-500/20">
              0{st.number}
            </span>
            <h3 className="text-base font-black text-white">{st.title}</h3>
            <p className="text-xs font-medium leading-relaxed text-slate-300">{st.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DEPOIMENTOS & PROVA SOCIAL (V3)
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsRenderer({
  config,
  palette,
}: {
  config: TestimonialsSectionConfig
  palette: ThemePalette
}) {
  const items = config.items || []

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Quem Já Roda com a Michelines
        </span>
        <h2 className="mt-1 text-2xl font-black text-white sm:text-4xl">{config.title}</h2>
        {config.subtitle && (
          <p className="mt-2 text-sm font-medium text-slate-300 leading-relaxed">
            {config.subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 backdrop-blur-sm transition-all hover:border-slate-700"
          >
            <div className="space-y-3">
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: item.rating || 5 }).map((_, r) => (
                  <Star key={r} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs font-medium italic leading-relaxed text-slate-200">
                "{item.testimony}"
              </p>
            </div>
            <div className="border-t border-slate-800/80 pt-3">
              <p className="text-sm font-black text-white">{item.name}</p>
              <p className="text-[11px] font-bold text-amber-400">{item.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SIMULADOR DE ECONOMIA (V1)
// ─────────────────────────────────────────────────────────────────────────────
function EarningsCalculatorRenderer({
  config,
  palette,
  onCta,
}: {
  config: EarningsCalculatorSectionConfig
  palette: ThemePalette
  onCta: () => void
}) {
  const [km, setKm] = useState(config.defaultKmPerDay || 200)

  const fuelPrice = config.fuelPricePerLiter || 5.89
  const hybridKm = config.hybridAvgKmPerLiter || 19.5
  const flexKm = config.flexAvgKmPerLiter || 9.8

  const flexDailyCost = (km / flexKm) * fuelPrice
  const hybridDailyCost = (km / hybridKm) * fuelPrice

  const dailySavings = Math.max(0, flexDailyCost - hybridDailyCost)
  const monthlySavings = dailySavings * 26 // 26 dias úteis

  return (
    <section className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-400/10 via-slate-900/90 to-slate-950 p-6 sm:p-10 backdrop-blur-md space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Simulador de Economia Real · V1
        </span>
        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">{config.title}</h2>
        {config.subtitle && (
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
            {config.subtitle}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-xl space-y-5">
        {/* Controle Deslizante de Quilometragem */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-white">
            <span>Quilômetros rodados por dia:</span>
            <span className="text-amber-400 font-black text-lg bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/30">
              {km} km/dia
            </span>
          </div>
          <input
            type="range"
            min={80}
            max={350}
            step={10}
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            className="h-2.5 w-full accent-amber-400 cursor-pointer bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>80 km (Part-time)</span>
            <span>200 km (Padrão)</span>
            <span>350 km (Integral)</span>
          </div>
        </div>

        {/* Resultados Comparativos */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Economia no Dia
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              R$ {dailySavings.toFixed(0)}
            </span>
            <span className="text-[10px] text-slate-500 block">Menos gasto no posto</span>
          </div>
          <div className="rounded-2xl border border-amber-400/50 bg-amber-400/15 p-4 space-y-1 shadow-lg shadow-amber-500/10">
            <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wider">
              Economia no Mês
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-300">
              R$ {monthlySavings.toFixed(0)}
            </span>
            <span className="text-[10px] text-amber-200/80 block">Em 26 dias úteis</span>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="#cadastro"
            onClick={onCta}
            className={`inline-flex h-13 items-center justify-center gap-2 rounded-2xl px-8 text-sm font-black shadow-xl transition-transform hover:scale-105 ${palette.accentGradient}`}
          >
            <span>{config.ctaText || "Quero Economizar Agora"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. FAQ ACCORDION (V3/V4)
// ─────────────────────────────────────────────────────────────────────────────
function FaqAccordionRenderer({
  config,
  palette,
}: {
  config: FaqAccordionSectionConfig
  palette: ThemePalette
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const items = config.items || []

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Tire Suas Dúvidas
        </span>
        <h2 className="mt-1 text-2xl font-black text-white sm:text-4xl">{config.title}</h2>
        {config.subtitle && (
          <p className="mt-2 text-sm font-medium text-slate-300 leading-relaxed">
            {config.subtitle}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {items.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm transition-colors hover:border-slate-700"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-bold text-white text-sm"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`h-4 w-4 text-amber-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-slate-800/80 p-4 sm:p-5 text-xs sm:text-sm font-medium leading-relaxed text-slate-300 bg-black/30">
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

// ─────────────────────────────────────────────────────────────────────────────
// 9. FORMULÁRIO DE CADASTRO DIRETO (V4 - CONVERSÃO)
// ─────────────────────────────────────────────────────────────────────────────
function LeadFormRenderer({
  config,
  campaign,
  palette,
  onCta,
}: {
  config: LeadFormSectionConfig
  campaign: Campaign
  palette: ThemePalette
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
    <section
      id="cadastro"
      className="scroll-mt-20 overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl space-y-6"
    >
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Cadastro Direto sem Burocracia
        </span>
        <h2 className="mt-1 text-2xl font-black sm:text-4xl text-white">{config.title}</h2>
        {config.subtitle && (
          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
            {config.subtitle}
          </p>
        )}
      </div>

      {submitted ? (
        <div className="mx-auto max-w-md text-center space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8 shadow-inner">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-black text-white">Cadastro Recebido!</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {config.successMessage || "Nosso consultor entrará em contato com você pelo WhatsApp em instantes para finalizar a reserva."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Seu Nome Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: João Silva"
              className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 text-sm font-medium text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">WhatsApp com DDD</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 text-sm font-medium text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Veículo de Interesse</label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Ex: Corolla Cross Híbrido, Spin, D-Taxi..."
              className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 text-sm font-medium text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`h-14 w-full rounded-2xl text-base font-black shadow-xl transition-all ${palette.accentGradient} hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50`}
          >
            {submitting ? "Enviando..." : config.buttonText || "Enviar Cadastro para Análise"}
          </button>

          <p className="text-center text-[11px] text-slate-400">
            🔒 Seus dados estão protegidos. Não consultamos restrições impeditivas de score.
          </p>
        </form>
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. BANNER WHATSAPP (V4)
// ─────────────────────────────────────────────────────────────────────────────
function WhatsAppCtaRenderer({
  config,
  palette,
  onCta,
}: {
  config: WhatsAppCtaSectionConfig
  palette: ThemePalette
  onCta: () => void
}) {
  const phone = config.phone || "5511999999999"
  const message = encodeURIComponent(config.customMessage || "Olá! Gostaria de informações sobre a locação de veículos.")

  return (
    <section className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 p-6 sm:p-10 text-center space-y-4 shadow-2xl">
      <h2 className="text-2xl font-black sm:text-3xl text-white">{config.title}</h2>
      {config.subtitle && (
        <p className="text-xs sm:text-sm font-medium text-emerald-100/80 max-w-lg mx-auto leading-relaxed">
          {config.subtitle}
        </p>
      )}

      <div className="pt-2">
        <a
          href={`https://wa.me/${phone}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCta}
          className="inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-8 text-base font-black text-slate-950 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Phone className="h-5 w-5 fill-slate-950" />
          <span>{config.buttonText || "Falar com Consultor no WhatsApp"}</span>
        </a>
      </div>
    </section>
  )
}
