"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowRight, CheckCircle2, Phone, ShieldCheck, Clock, Award, Car, Fuel,
  ChevronDown, MessageSquare, Send, Sparkles, AlertCircle, HelpCircle, User, Star,
  TrendingUp, Check, Zap, Copy, Trash2, ArrowUp, ArrowDown
} from "lucide-react"
import { Campaign, CAMPAIGN_THEMES } from "@/types/campaign"
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
import { cn } from "@/lib/utils"

export interface ThemePalette {
  isDark: boolean
  name: string
  bgGradient: string
  bgColor: string
  // Header
  headerBg: string
  headerBorder: string
  headerText: string
  headerBadgeBg: string
  headerBadgeBorder: string
  headerBadgeText: string
  // Typography
  textPrimary: string
  textSecondary: string
  textMuted: string
  textHighlight: string
  // Cards & surfaces
  cardBg: string
  cardBorder: string
  cardShadow: string
  cardInnerBg: string
  // Badges & Accents
  accentGradient: string
  accentHover: string
  accentText: string
  badgeBg: string
  badgeBorder: string
  badgeText: string
  // Inputs
  inputBg: string
  inputBorder: string
  inputText: string
  inputPlaceholder: string
  // Vehicle Stage
  vehicleStageBg: string
  vehicleStageBorder: string
  vehicleStageShadow: string
  glowRgba: string
  // Footer & Mobile
  footerBg: string
  footerBorder: string
  footerText: string
  mobileBarBg: string
  mobileBarBorder: string
}

export const THEME_PALETTES: Record<string, ThemePalette> = {
  // ── 1. CLARO NEUTRO (BRANCO & CINZA) ───────────────────────────────────────
  claro: {
    isDark: false,
    name: "Claro Neutro",
    bgGradient: "linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #f1f5f9 100%)",
    bgColor: "#f8fafc",
    headerBg: "bg-white/90 border-b border-slate-200 shadow-xs",
    headerBorder: "border-slate-200",
    headerText: "text-slate-900",
    headerBadgeBg: "bg-slate-100",
    headerBadgeBorder: "border-slate-300",
    headerBadgeText: "text-slate-800",
    textPrimary: "text-slate-950",
    textSecondary: "text-slate-600",
    textMuted: "text-slate-500",
    textHighlight: "text-amber-600",
    cardBg: "bg-white",
    cardBorder: "border-slate-200 hover:border-slate-300",
    cardShadow: "shadow-md shadow-slate-200/60",
    cardInnerBg: "bg-slate-50 border border-slate-200",
    accentGradient: "bg-slate-950 hover:bg-slate-800 text-white shadow-md shadow-slate-900/15",
    accentHover: "hover:bg-slate-800",
    accentText: "text-white",
    badgeBg: "bg-amber-100/80",
    badgeBorder: "border-amber-300",
    badgeText: "text-amber-900",
    inputBg: "bg-slate-50 focus:bg-white",
    inputBorder: "border-slate-300 focus:border-amber-500",
    inputText: "text-slate-900",
    inputPlaceholder: "placeholder:text-slate-400",
    vehicleStageBg: "bg-white border border-slate-200",
    vehicleStageBorder: "border-slate-200",
    vehicleStageShadow: "shadow-xl shadow-slate-200/60",
    glowRgba: "rgba(203, 213, 225, 0.4)",
    footerBg: "bg-slate-100",
    footerBorder: "border-slate-200",
    footerText: "text-slate-600",
    mobileBarBg: "bg-white/95 border-t border-slate-200 shadow-lg",
    mobileBarBorder: "border-slate-200",
  },

  // ── 2. VERDE CLARO (SÁLVIA & ESMERALDA) ────────────────────────────────────
  verde_claro: {
    isDark: false,
    name: "Verde Sustentável",
    bgGradient: "linear-gradient(180deg, #f4fbf7 0%, #e9f5ee 40%, #daf0e3 100%)",
    bgColor: "#e9f5ee",
    headerBg: "bg-white/90 border-b border-emerald-100 shadow-xs",
    headerBorder: "border-emerald-200",
    headerText: "text-[#062c1e]",
    headerBadgeBg: "bg-emerald-100/70",
    headerBadgeBorder: "border-emerald-300",
    headerBadgeText: "text-emerald-950",
    textPrimary: "text-[#062c1e]",
    textSecondary: "text-[#1a4a34]",
    textMuted: "text-[#2e6d4e]",
    textHighlight: "text-emerald-700",
    cardBg: "bg-white",
    cardBorder: "border-emerald-100 hover:border-emerald-300",
    cardShadow: "shadow-md shadow-emerald-950/5",
    cardInnerBg: "bg-emerald-50/50 border border-emerald-100",
    accentGradient: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20",
    accentHover: "hover:from-emerald-500 hover:to-teal-500",
    accentText: "text-white",
    badgeBg: "bg-emerald-100/80",
    badgeBorder: "border-emerald-300",
    badgeText: "text-emerald-950",
    inputBg: "bg-white focus:bg-emerald-50/30",
    inputBorder: "border-emerald-200 focus:border-emerald-600",
    inputText: "text-[#062c1e]",
    inputPlaceholder: "placeholder:text-emerald-800/40",
    vehicleStageBg: "bg-white border border-emerald-200",
    vehicleStageBorder: "border-emerald-200",
    vehicleStageShadow: "shadow-xl shadow-emerald-950/8",
    glowRgba: "rgba(16, 185, 129, 0.2)",
    footerBg: "bg-[#daf0e3]",
    footerBorder: "border-emerald-200",
    footerText: "text-[#1a4a34]",
    mobileBarBg: "bg-white/95 border-t border-emerald-200 shadow-lg",
    mobileBarBorder: "border-emerald-200",
  },

  // ── 3. INSTITUCIONAL NOBRE (CREME & OURO) ──────────────────────────────────
  creme: {
    isDark: false,
    name: "Institucional Nobre",
    bgGradient: "linear-gradient(180deg, #fdfbf7 0%, #f7f3ea 40%, #ede5d4 100%)",
    bgColor: "#f7f3ea",
    headerBg: "bg-[#fdfbf7]/90 border-b border-[#e2d8c7] shadow-xs",
    headerBorder: "border-[#e2d8c7]",
    headerText: "text-[#1c1813]",
    headerBadgeBg: "bg-amber-100/70",
    headerBadgeBorder: "border-amber-300/80",
    headerBadgeText: "text-amber-950",
    textPrimary: "text-[#1c1813]",
    textSecondary: "text-[#544837]",
    textMuted: "text-[#7f6f59]",
    textHighlight: "text-amber-700",
    cardBg: "bg-white/95",
    cardBorder: "border-[#e5dcce] hover:border-amber-400/60",
    cardShadow: "shadow-md shadow-amber-950/5",
    cardInnerBg: "bg-[#faf7f0] border border-[#eee4d4]",
    accentGradient: "bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20",
    accentHover: "hover:from-amber-400 hover:to-amber-500",
    accentText: "text-slate-950",
    badgeBg: "bg-amber-100/80",
    badgeBorder: "border-amber-300",
    badgeText: "text-amber-950",
    inputBg: "bg-[#faf7f0] focus:bg-white",
    inputBorder: "border-[#d8ccba] focus:border-amber-600",
    inputText: "text-[#1c1813]",
    inputPlaceholder: "placeholder:text-[#9e8f7a]",
    vehicleStageBg: "bg-white border border-[#e5dcce]",
    vehicleStageBorder: "border-[#e5dcce]",
    vehicleStageShadow: "shadow-xl shadow-amber-950/8",
    glowRgba: "rgba(245, 230, 205, 0.7)",
    footerBg: "bg-[#ede5d4]",
    footerBorder: "border-[#e2d8c7]",
    footerText: "text-[#544837]",
    mobileBarBg: "bg-[#fdfbf7]/95 border-t border-[#e2d8c7] shadow-lg",
    mobileBarBorder: "border-[#e2d8c7]",
  },

  // ── 4. AZUL MICHELINES (CÉU & MARINHO) ─────────────────────────────────────
  navy: {
    isDark: true,
    name: "Azul Michelines",
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #0f1d38 0%, #060b14 55%, #020408 100%)",
    bgColor: "#020408",
    headerBg: "bg-slate-950/85 border-b border-white/10 shadow-md",
    headerBorder: "border-white/10",
    headerText: "text-white",
    headerBadgeBg: "bg-amber-400/10",
    headerBadgeBorder: "border-amber-400/30",
    headerBadgeText: "text-amber-300",
    textPrimary: "text-white",
    textSecondary: "text-slate-300",
    textMuted: "text-slate-400",
    textHighlight: "text-amber-400",
    cardBg: "bg-slate-900/80 backdrop-blur-xl",
    cardBorder: "border-slate-800 hover:border-slate-700",
    cardShadow: "shadow-2xl shadow-black/40",
    cardInnerBg: "bg-slate-950/70 border border-slate-800",
    accentGradient: "bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-slate-950 shadow-amber-500/25",
    accentHover: "hover:from-amber-300 hover:to-amber-400",
    accentText: "text-slate-950",
    badgeBg: "bg-amber-400/10",
    badgeBorder: "border-amber-400/40",
    badgeText: "text-amber-300",
    inputBg: "bg-slate-950/80 focus:bg-slate-900",
    inputBorder: "border-slate-700 focus:border-amber-400",
    inputText: "text-white",
    inputPlaceholder: "placeholder:text-slate-500",
    vehicleStageBg: "bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800",
    vehicleStageBorder: "border-slate-800",
    vehicleStageShadow: "shadow-2xl shadow-black/60",
    glowRgba: "rgba(37, 99, 235, 0.25)",
    footerBg: "bg-black/40",
    footerBorder: "border-white/10",
    footerText: "text-slate-400",
    mobileBarBg: "bg-slate-950/95 border-t border-slate-800",
    mobileBarBorder: "border-slate-800",
  },

  // ── 5. EDITORIAL DARK (OURO & PRETO NOBRE) ─────────────────────────────────
  editorial: {
    isDark: true,
    name: "Editorial Dark",
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #241403 0%, #0c0701 55%, #030200 100%)",
    bgColor: "#030200",
    headerBg: "bg-[#0c0701]/90 border-b border-amber-900/30 shadow-md",
    headerBorder: "border-amber-900/30",
    headerText: "text-amber-100",
    headerBadgeBg: "bg-amber-400/15",
    headerBadgeBorder: "border-amber-400/40",
    headerBadgeText: "text-amber-300",
    textPrimary: "text-amber-50",
    textSecondary: "text-amber-200/80",
    textMuted: "text-amber-300/60",
    textHighlight: "text-amber-400",
    cardBg: "bg-[#110c06]/90 backdrop-blur-xl",
    cardBorder: "border-amber-900/40 hover:border-amber-600/50",
    cardShadow: "shadow-2xl shadow-black/60",
    cardInnerBg: "bg-[#080502] border border-amber-950",
    accentGradient: "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-amber-500/30",
    accentHover: "hover:from-amber-300 hover:to-amber-200",
    accentText: "text-slate-950",
    badgeBg: "bg-amber-400/15",
    badgeBorder: "border-amber-400/40",
    badgeText: "text-amber-300",
    inputBg: "bg-[#080502] focus:bg-[#150e04]",
    inputBorder: "border-amber-900/60 focus:border-amber-400",
    inputText: "text-amber-50",
    inputPlaceholder: "placeholder:text-amber-300/40",
    vehicleStageBg: "bg-gradient-to-b from-[#150e04] to-[#080502] border border-amber-900/40",
    vehicleStageBorder: "border-amber-900/40",
    vehicleStageShadow: "shadow-2xl shadow-amber-950/20",
    glowRgba: "rgba(217, 119, 6, 0.35)",
    footerBg: "bg-[#080502]",
    footerBorder: "border-amber-900/30",
    footerText: "text-amber-200/60",
    mobileBarBg: "bg-[#080502]/95 border-t border-amber-900/40",
    mobileBarBorder: "border-amber-900/40",
  },

  // ── 6. MINIMAL SOFISTICADO (CARVÃO PROFUNDO) ──────────────────────────────
  minimal: {
    isDark: true,
    name: "Minimal Sofisticado",
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #1a1e26 0%, #0b0d12 55%, #020304 100%)",
    bgColor: "#020304",
    headerBg: "bg-slate-950/85 border-b border-slate-800 shadow-md",
    headerBorder: "border-slate-800",
    headerText: "text-white",
    headerBadgeBg: "bg-white/10",
    headerBadgeBorder: "border-white/20",
    headerBadgeText: "text-slate-200",
    textPrimary: "text-white",
    textSecondary: "text-slate-300",
    textMuted: "text-slate-400",
    textHighlight: "text-slate-200",
    cardBg: "bg-slate-900/80 backdrop-blur-xl",
    cardBorder: "border-slate-800 hover:border-slate-700",
    cardShadow: "shadow-2xl shadow-black/50",
    cardInnerBg: "bg-slate-950/80 border border-slate-800",
    accentGradient: "bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 shadow-white/10",
    accentHover: "hover:from-white hover:to-slate-200",
    accentText: "text-slate-950",
    badgeBg: "bg-white/10",
    badgeBorder: "border-white/20",
    badgeText: "text-slate-200",
    inputBg: "bg-slate-950 border-slate-700",
    inputBorder: "border-slate-700 focus:border-white",
    inputText: "text-white",
    inputPlaceholder: "placeholder:text-slate-500",
    vehicleStageBg: "bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800",
    vehicleStageBorder: "border-slate-800",
    vehicleStageShadow: "shadow-2xl",
    glowRgba: "rgba(148, 163, 184, 0.2)",
    footerBg: "bg-[#020304]",
    footerBorder: "border-slate-800",
    footerText: "text-slate-400",
    mobileBarBg: "bg-slate-950/95 border-t border-slate-800",
    mobileBarBorder: "border-slate-800",
  },

  // ── 7. OURO & ÂMBAR (URGÊNCIA FEIRÃO) ─────────────────────────────────────
  amber: {
    isDark: true,
    name: "Ouro & Âmbar",
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #2f1304 0%, #120601 55%, #050201 100%)",
    bgColor: "#050201",
    headerBg: "bg-stone-950/85 border-b border-amber-900/30 shadow-md",
    headerBorder: "border-amber-900/30",
    headerText: "text-white",
    headerBadgeBg: "bg-amber-400/10",
    headerBadgeBorder: "border-amber-400/40",
    headerBadgeText: "text-amber-300",
    textPrimary: "text-white",
    textSecondary: "text-stone-300",
    textMuted: "text-stone-400",
    textHighlight: "text-amber-400",
    cardBg: "bg-stone-900/80 backdrop-blur-xl",
    cardBorder: "border-stone-800 hover:border-stone-700",
    cardShadow: "shadow-2xl shadow-black/50",
    cardInnerBg: "bg-stone-950/80 border border-stone-800",
    accentGradient: "bg-gradient-to-r from-amber-400 via-amber-400 to-orange-500 text-slate-950 shadow-amber-500/25",
    accentHover: "hover:from-amber-300 hover:to-amber-400",
    accentText: "text-slate-950",
    badgeBg: "bg-amber-400/10",
    badgeBorder: "border-amber-400/40",
    badgeText: "text-amber-300",
    inputBg: "bg-stone-950 border-stone-700",
    inputBorder: "border-stone-700 focus:border-amber-400",
    inputText: "text-white",
    inputPlaceholder: "placeholder:text-stone-500",
    vehicleStageBg: "bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800",
    vehicleStageBorder: "border-stone-800",
    vehicleStageShadow: "shadow-2xl",
    glowRgba: "rgba(245, 158, 11, 0.25)",
    footerBg: "bg-black/50",
    footerBorder: "border-stone-800",
    footerText: "text-stone-400",
    mobileBarBg: "bg-stone-950/95 border-t border-stone-800",
    mobileBarBorder: "border-stone-800",
  },

  // ── 8. VIOLETA TECNOLÓGICO (MODERNO) ───────────────────────────────────────
  violet: {
    isDark: true,
    name: "Violeta Tecnológico",
    bgGradient: "radial-gradient(ellipse 100% 70% at 50% -10%, #290d4a 0%, #0e041c 55%, #04010a 100%)",
    bgColor: "#04010a",
    headerBg: "bg-slate-950/85 border-b border-violet-900/30 shadow-md",
    headerBorder: "border-violet-900/30",
    headerText: "text-white",
    headerBadgeBg: "bg-violet-400/10",
    headerBadgeBorder: "border-violet-400/40",
    headerBadgeText: "text-violet-300",
    textPrimary: "text-white",
    textSecondary: "text-slate-300",
    textMuted: "text-slate-400",
    textHighlight: "text-violet-400",
    cardBg: "bg-slate-900/80 backdrop-blur-xl",
    cardBorder: "border-slate-800 hover:border-violet-900/60",
    cardShadow: "shadow-2xl shadow-black/50",
    cardInnerBg: "bg-slate-950/80 border border-slate-800",
    accentGradient: "bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-500 text-slate-950 shadow-violet-500/25",
    accentHover: "hover:from-violet-300 hover:to-violet-400",
    accentText: "text-slate-950",
    badgeBg: "bg-violet-400/10",
    badgeBorder: "border-violet-400/40",
    badgeText: "text-violet-300",
    inputBg: "bg-slate-950 border-slate-700",
    inputBorder: "border-slate-700 focus:border-violet-400",
    inputText: "text-white",
    inputPlaceholder: "placeholder:text-slate-500",
    vehicleStageBg: "bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800",
    vehicleStageBorder: "border-slate-800",
    vehicleStageShadow: "shadow-2xl",
    glowRgba: "rgba(139, 92, 246, 0.25)",
    footerBg: "bg-black/50",
    footerBorder: "border-violet-950",
    footerText: "text-slate-400",
    mobileBarBg: "bg-slate-950/95 border-t border-slate-800",
    mobileBarBorder: "border-slate-800",
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

interface DeviceContextType {
  previewDevice: "desktop" | "tablet" | "mobile"
  isMobile: boolean
  isTablet: boolean
}

const DeviceContext = React.createContext<DeviceContextType>({
  previewDevice: "desktop",
  isMobile: false,
  isTablet: false,
})

export const useDevice = () => React.useContext(DeviceContext)

interface DynamicLandingRendererProps {
  campaign: Campaign
  onCtaClick?: () => void
  isEditor?: boolean
  previewDevice?: "desktop" | "tablet" | "mobile"
  activeSectionId?: string | null
  onSelectSection?: (id: string) => void
  onMoveSection?: (index: number, direction: "up" | "down") => void
  onDuplicateSection?: (sec: CampaignSection) => void
  onDeleteSection?: (id: string) => void
}

export function DynamicLandingRenderer({
  campaign,
  onCtaClick,
  isEditor = false,
  previewDevice = "desktop",
  activeSectionId = null,
  onSelectSection,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
}: DynamicLandingRendererProps) {
  const palette = THEME_PALETTES[campaign.theme] || THEME_PALETTES.claro
  const sections = campaign.sections || []
  const isMobile = previewDevice === "mobile"
  const isTablet = previewDevice === "tablet"

  const handleCta = () => {
    registerCampaignClick(campaign.id)
    if (onCtaClick) onCtaClick()
  }

  // Ordena seções ativas
  const activeSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)

  return (
    <DeviceContext.Provider value={{ previewDevice, isMobile, isTablet }}>
      <div
        style={{
          background: palette.bgGradient,
          backgroundColor: palette.bgColor,
          minHeight: "100vh",
        }}
        className={cn(
          "min-h-screen antialiased selection:bg-amber-400 selection:text-slate-950 font-sans transition-colors duration-300 overflow-x-hidden",
          palette.textPrimary
        )}
      >
        {/* ── HEADER SUPERIOR (FIXO & RESPONSIVO) ────────────────────────────────── */}
        <header className={cn("sticky top-0 z-40 backdrop-blur-md transition-colors duration-300", palette.headerBg)}>
          <div className={cn(
            "mx-auto flex items-center justify-between transition-all",
            isMobile ? "px-3.5 py-2.5 max-w-full" : "max-w-5xl px-4 sm:px-6 py-3.5"
          )}>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_IMAGES.banner}
                alt="Grupo Michelines"
                className={cn(
                  "w-auto object-contain transition-all",
                  isMobile ? "h-6 max-w-[120px]" : "h-7 sm:h-8"
                )}
              />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              {!isMobile && (
                <span
                  className={cn(
                    "hidden items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border transition-colors sm:inline-flex",
                    palette.headerBadgeBg,
                    palette.headerBadgeBorder,
                    palette.headerBadgeText
                  )}
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  45 anos de tradição em SP
                </span>
              )}
              <a
                href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20loca%C3%A7%C3%A3o%20de%20ve%C3%ADculos"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCta}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 font-black text-slate-950 transition-all shadow-md shadow-emerald-500/20 active:scale-95",
                  isMobile ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs hover:scale-105"
                )}
              >
                <Phone className="h-3.5 w-3.5 fill-slate-950" />
                <span>{isMobile ? "WhatsApp" : "Plantão WhatsApp"}</span>
              </a>
            </div>
          </div>
        </header>

      {/* ── CONTEÚDO DAS SEÇÕES (COM WRAPPERS INTERATIVOS SE EM MODO EDITOR) ─── */}
      <main className={cn(
        "mx-auto transition-all",
        isMobile ? "max-w-full space-y-8 px-3.5 py-6" : "max-w-5xl space-y-16 px-4 sm:px-6 py-8 sm:py-12"
      )}>
        {activeSections.map((section, idx) => {
          const isSelected = isEditor && activeSectionId === section.id

          return (
            <div
              key={section.id}
              onClick={() => {
                if (isEditor && onSelectSection) {
                  onSelectSection(section.id)
                }
              }}
              className={cn(
                "relative transition-all duration-200",
                isEditor && "cursor-pointer rounded-3xl",
                isSelected && "ring-4 ring-violet-500 ring-offset-4 shadow-2xl",
                isEditor && !isSelected && "hover:ring-2 hover:ring-amber-400/40"
              )}
            >
              {/* Barra Flutuante de Ação no Topo do Bloco Ativo (Apenas no Modo Estúdio) */}
              {isSelected && (
                <div
                  className="absolute -top-4 right-2 sm:right-4 z-40 flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#181b26] border border-violet-500/80 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black text-white shadow-2xl backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-violet-300 uppercase tracking-wider text-[9px] sm:text-[10px]">
                    Bloco #{idx + 1}
                  </span>

                  <div className="h-3 w-[1px] bg-slate-700" />

                  {onMoveSection && (
                    <>
                      <button
                        onClick={() => onMoveSection(idx, "up")}
                        disabled={idx === 0}
                        className="text-slate-400 hover:text-white disabled:opacity-30 p-0.5"
                        title="Subir seção"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onMoveSection(idx, "down")}
                        disabled={idx === activeSections.length - 1}
                        className="text-slate-400 hover:text-white disabled:opacity-30 p-0.5"
                        title="Descer seção"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  {onDuplicateSection && (
                    <button
                      onClick={() => onDuplicateSection(section)}
                      className="text-slate-400 hover:text-violet-400 p-0.5"
                      title="Duplicar seção"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                  {onDeleteSection && (
                    <button
                      onClick={() => onDeleteSection(section.id)}
                      className="text-slate-400 hover:text-rose-400 p-0.5"
                      title="Excluir seção"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Componente da Seção Real */}
              <SectionComponent
                section={section}
                campaign={campaign}
                palette={palette}
                onCta={handleCta}
              />
            </div>
          )
        })}
      </main>

      {/* ── BARRA FIXA INFERIOR MOBILE ────────────────────────────────────────── */}
      <div className={cn(
        "sticky bottom-0 z-40 p-2.5 backdrop-blur-xl transition-all",
        isMobile ? "block" : "sm:hidden",
        palette.mobileBarBg
      )}>
        <div className="flex gap-2">
          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20quero%20alugar%20um%20ve%C3%ADculo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCta}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-xs font-black text-slate-950 shadow-lg active:scale-95 transition-transform"
          >
            <Phone className="h-3.5 w-3.5 fill-slate-950" />
            WhatsApp
          </a>
          <a
            href="#cadastro"
            onClick={handleCta}
            className={cn(
              "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-black active:scale-95 transition-transform",
              palette.accentGradient
            )}
          >
            Alugar Agora
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* ── FOOTER DA PÁGINA ──────────────────────────────────────────────────── */}
      <footer className={cn(
        "border-t text-center text-xs font-medium transition-colors",
        isMobile ? "px-4 py-8" : "px-5 py-10",
        palette.footerBg,
        palette.footerBorder
      )}>
        <div className="mx-auto max-w-md space-y-2">
          <p className={cn("font-bold", isMobile ? "text-xs" : "text-sm", palette.textPrimary)}>
            © {new Date().getFullYear()} Grupo Michelines — Locação de Veículos para Aplicativos e Táxi em SP.
          </p>
          <p className={cn("text-[10px] sm:text-[11px] leading-relaxed", palette.footerText)}>
            45 anos de tradição · Frota própria, manutenção 100% inclusa e atendimento humanizado.
          </p>
        </div>
      </footer>
    </div>
    </DeviceContext.Provider>
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
// 1. HERO COM DESIGN ELEGANTE & TIPOGRAFIA REFINADA
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
  const { isMobile } = useDevice()
  const signupHref = config.primaryCtaUrl || "#cadastro"
  const carImage = resolveVehicleImage(campaign, config.imageUrl)

  return (
    <div className="relative pt-1 sm:pt-4">
      <div className={cn(
        isMobile ? "flex flex-col gap-6" : "grid gap-8 lg:grid-cols-12 lg:items-center"
      )}>
        {/* Coluna da Esquerda: Textos, Selos e CTAs */}
        <div className={cn(
          isMobile ? "w-full space-y-4" : "space-y-6 lg:col-span-7"
        )}>
          {config.badgeText && (
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border shadow-xs transition-colors",
                isMobile ? "px-3 py-1 text-[11px] font-black" : "px-3.5 py-1.5 text-xs font-black uppercase tracking-wider",
                palette.badgeBg,
                palette.badgeBorder,
                palette.badgeText
              )}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{config.badgeText}</span>
            </div>
          )}

          <h1
            className={cn(
              "font-display font-black tracking-tight transition-colors",
              isMobile
                ? "text-2xl leading-snug"
                : "text-2xl sm:text-4xl lg:text-[3.25rem] leading-[1.12]",
              palette.textPrimary
            )}
          >
            {config.title || campaign.headline}
          </h1>

          {(config.subtitle || campaign.subheadline) && (
            <p className={cn(
              "font-medium leading-relaxed transition-colors",
              isMobile ? "text-xs sm:text-sm" : "max-w-xl text-base sm:text-lg",
              palette.textSecondary
            )}>
              {config.subtitle || campaign.subheadline}
            </p>
          )}

          {/* Botões de Ação */}
          <div className={cn(
            isMobile ? "flex flex-col gap-2.5 w-full pt-1" : "flex flex-col gap-3 pt-2 sm:flex-row sm:items-center"
          )}>
            <Link
              href={signupHref}
              onClick={onCta}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-2xl font-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                isMobile ? "h-12 w-full text-sm" : "min-h-14 px-8 text-base",
                palette.accentGradient,
                palette.accentHover
              )}
            >
              <span>{config.primaryCtaText || "Quero me cadastrar"}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>

            {config.showWhatsappBtn !== false && (
              <a
                href={`https://wa.me/${config.whatsappPhone || "5511999999999"}?text=${encodeURIComponent(config.whatsappText || "Olá! Gostaria de alugar um veículo da frota.")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onCta}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-2xl border font-bold transition-all backdrop-blur-sm active:scale-[0.98]",
                  isMobile ? "h-12 w-full text-xs" : "min-h-14 px-6 text-sm",
                  palette.isDark
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                    : "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                )}
              >
                <Phone className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>WhatsApp Plantão</span>
              </a>
            )}
          </div>

          {/* 3 Pilares de Confiança */}
          <div className={cn(
            "border-t pt-4 text-xs font-bold transition-colors",
            isMobile ? "grid grid-cols-1 gap-2" : "grid gap-2.5 pt-6 sm:grid-cols-3",
            palette.isDark ? "border-slate-800" : "border-slate-200"
          )}>
            <div className={cn("flex items-center gap-2 rounded-xl p-2.5 border font-bold shadow-xs", palette.cardBg, palette.cardBorder, palette.textPrimary)}>
              <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Sem score impeditivo</span>
            </div>
            <div className={cn("flex items-center gap-2 rounded-xl p-2.5 border font-bold shadow-xs", palette.cardBg, palette.cardBorder, palette.textPrimary)}>
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Retirada em até 24h</span>
            </div>
            <div className={cn("flex items-center gap-2 rounded-xl p-2.5 border font-bold shadow-xs", palette.cardBg, palette.cardBorder, palette.textPrimary)}>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Manutenção e seguro 100%</span>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Vitrine do Veículo em Destaque */}
        <div className={cn(
          "relative flex items-center justify-center",
          isMobile ? "w-full" : "lg:col-span-5"
        )}>
          {/* Luz Ambiente Atrás do Carro */}
          <div
            className="absolute -inset-4 rounded-full blur-3xl opacity-60 pointer-events-none"
            style={{ background: palette.glowRgba }}
          />

          <div className={cn(
            "relative w-full overflow-hidden rounded-3xl transition-all",
            isMobile ? "p-4" : "p-5 sm:p-6",
            palette.vehicleStageBg,
            palette.vehicleStageBorder,
            palette.vehicleStageShadow
          )}>
            {/* Badge Flutuante Superior */}
            <div className={cn("flex items-center justify-between pb-2.5 border-b", palette.isDark ? "border-slate-800" : "border-slate-100")}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-300">
                <Fuel className="h-3 w-3 text-emerald-500" />
                Até 22 km/l em SP
              </span>
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                Pronta Entrega
              </span>
            </div>

            {/* Imagem do Veículo */}
            <div className="relative py-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={carImage}
                alt={campaign.name}
                className={cn(
                  "w-full object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:scale-105",
                  isMobile ? "h-auto max-h-[180px]" : "h-auto max-h-[290px]"
                )}
              />
            </div>

            {/* Informações Resumidas do Veículo */}
            <div className={cn("mt-2 rounded-2xl p-2.5 flex items-center justify-between", palette.cardInnerBg)}>
              <div>
                <p className={cn("text-[9px] font-bold uppercase tracking-wider", palette.textMuted)}>Modelo Oficial</p>
                <p className={cn("text-xs sm:text-sm font-black", palette.textPrimary)}>
                  {campaign.vehicleInterest || "Corolla Cross Híbrido"}
                </p>
              </div>
              <Link
                href="#cadastro"
                className={cn(
                  "rounded-xl border px-2.5 py-1 text-[11px] font-bold transition-colors",
                  palette.isDark
                    ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-xs"
                )}
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
  const { isMobile } = useDevice()
  const cards = config.cards || []

  return (
    <section className={cn(
      "space-y-4 rounded-3xl transition-colors",
      isMobile ? "p-4" : "p-6 sm:p-8 space-y-6",
      palette.cardBg, palette.cardBorder, palette.cardShadow
    )}>
      <div className="max-w-2xl">
        <span className={cn("text-[10px] font-black uppercase tracking-widest block", palette.textHighlight)}>
          Vínculo & Empatia · V2
        </span>
        <h2 className={cn(
          "font-display mt-1 font-black",
          isMobile ? "text-xl leading-snug" : "text-2xl sm:text-3xl",
          palette.textPrimary
        )}>
          {config.title}
        </h2>
        {config.subtitle && (
          <p className={cn("mt-1.5 text-xs sm:text-sm font-medium leading-relaxed", palette.textSecondary)}>
            {config.subtitle}
          </p>
        )}
      </div>

      <div className={cn(
        "grid gap-3",
        isMobile ? "grid-cols-1" : "sm:grid-cols-3 gap-4"
      )}>
        {cards.map((card, i) => (
          <div
            key={i}
            className={cn("rounded-2xl p-4 space-y-1.5 transition-all hover:shadow-md", palette.cardInnerBg)}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15 text-amber-600 dark:text-amber-400 font-black text-xs">
              0{i + 1}
            </div>
            <h3 className={cn("text-sm sm:text-base font-black", palette.textPrimary)}>{card.title}</h3>
            <p className={cn("text-xs font-medium leading-relaxed", palette.textSecondary)}>{card.description}</p>
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
  const { isMobile } = useDevice()
  const items = config.items || []

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", palette.textHighlight)}>
          Pilares da Parceria Michelines
        </span>
        <h2 className={cn(
          "font-display mt-1 font-black",
          isMobile ? "text-xl leading-snug" : "text-2xl sm:text-4xl",
          palette.textPrimary
        )}>
          {config.title}
        </h2>
        {config.subtitle && (
          <p className={cn("mt-1.5 text-xs sm:text-sm font-medium leading-relaxed", palette.textSecondary)}>
            {config.subtitle}
          </p>
        )}
      </div>

      <div className={cn(
        "grid gap-3",
        isMobile ? "grid-cols-1" : "sm:grid-cols-2 gap-4"
      )}>
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "group rounded-3xl p-5 space-y-2.5 transition-all",
              palette.cardBg,
              palette.cardBorder,
              palette.cardShadow
            )}
          >
            <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black border", palette.badgeBg, palette.badgeBorder, palette.badgeText)}>
              {item.highlight}
            </span>
            <h3 className={cn("text-base sm:text-lg font-black transition-colors", palette.textPrimary)}>
              {item.title}
            </h3>
            <p className={cn("text-xs font-medium leading-relaxed", palette.textSecondary)}>{item.description}</p>
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
  const { isMobile } = useDevice()
  const carImage = resolveVehicleImage(campaign, config.imageUrl)

  return (
    <section className={cn(
      "overflow-hidden rounded-3xl transition-all",
      isMobile ? "p-4 space-y-4" : "p-6 sm:p-10",
      palette.vehicleStageBg, palette.vehicleStageBorder, palette.vehicleStageShadow
    )}>
      <div className={cn(
        isMobile ? "flex flex-col gap-4" : "grid gap-8 lg:grid-cols-12 lg:items-center"
      )}>
        {/* Informações da Oferta */}
        <div className={cn(
          isMobile ? "w-full space-y-3.5" : "space-y-5 lg:col-span-7"
        )}>
          <span className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border", palette.badgeBg, palette.badgeBorder, palette.badgeText)}>
            {config.vehicleCategory || "Oferta Exclusiva da Campanha"}
          </span>
          <h2 className={cn(
            "font-display font-black",
            isMobile ? "text-xl leading-snug" : "text-2xl sm:text-4xl",
            palette.textPrimary
          )}>
            {config.vehicleName}
          </h2>
          {config.subtitle && (
            <p className={cn("text-xs sm:text-sm font-medium leading-relaxed", palette.textSecondary)}>
              {config.subtitle}
            </p>
          )}

          {/* Foto do Veículo em Destaque no Mobile (logo após o título) */}
          {isMobile && (
            <div className={cn("relative w-full rounded-2xl p-3 flex items-center justify-center my-2", palette.cardInnerBg)}>
              <img
                src={carImage}
                alt={config.vehicleName}
                className="h-auto w-full max-h-[160px] object-contain drop-shadow-md"
              />
            </div>
          )}

          {/* Cards de Preço / Valores */}
          <div className={cn(
            isMobile ? "grid grid-cols-3 gap-2 py-1" : "flex flex-wrap gap-3 py-2"
          )}>
            {config.dailyRate && (
              <div className={cn("rounded-2xl p-2.5 text-center", isMobile ? "w-full" : "min-w-[120px]", palette.cardInnerBg)}>
                <span className={cn("text-[9px] font-bold block uppercase", palette.textMuted)}>Diária</span>
                <span className={cn("font-black", isMobile ? "text-base" : "text-2xl", palette.textHighlight)}>R$ {config.dailyRate}</span>
              </div>
            )}
            {config.weeklyRate && (
              <div className={cn("rounded-2xl p-2.5 text-center", isMobile ? "w-full" : "min-w-[120px]", palette.cardInnerBg)}>
                <span className={cn("text-[9px] font-bold block uppercase", palette.textMuted)}>Semanal</span>
                <span className={cn("font-black", isMobile ? "text-base" : "text-2xl", palette.textPrimary)}>R$ {config.weeklyRate}</span>
              </div>
            )}
            {config.monthlyRate && (
              <div className={cn("rounded-2xl p-2.5 text-center", isMobile ? "w-full" : "min-w-[120px]", palette.cardInnerBg)}>
                <span className={cn("text-[9px] font-bold block uppercase", palette.textMuted)}>Mensal</span>
                <span className={cn("font-black", isMobile ? "text-base" : "text-2xl", palette.textPrimary)}>R$ {config.monthlyRate}</span>
              </div>
            )}
          </div>

          {/* Lista de Vantagens */}
          <ul className={cn(
            "grid gap-2 text-xs font-bold pt-1",
            isMobile ? "grid-cols-1" : "sm:grid-cols-2"
          )}>
            {config.features && config.features.length > 0 ? (
              config.features.map((feat, i) => (
                <li key={i} className={cn("flex items-center gap-2", palette.textPrimary)}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))
            ) : (
              <>
                <li className={cn("flex items-center gap-2", palette.textPrimary)}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Consumo urbano de até 22 km/l
                </li>
                <li className={cn("flex items-center gap-2", palette.textPrimary)}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Manutenção preventiva inclusa
                </li>
                <li className={cn("flex items-center gap-2", palette.textPrimary)}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Seguro total e assistência 24h
                </li>
                <li className={cn("flex items-center gap-2", palette.textPrimary)}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Aprovado para Uber Black & Comfort
                </li>
              </>
            )}
          </ul>

          <div className="pt-2">
            <Link
              href={config.ctaUrl || "#cadastro"}
              onClick={onCta}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-2xl font-black shadow-lg transition-all",
                isMobile ? "h-12 w-full text-xs" : "h-13 px-7 text-sm hover:scale-105",
                palette.accentGradient
              )}
            >
              <span>{config.ctaText || "Garantir Este Veículo"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Foto do Veículo em Destaque no Desktop */}
        {!isMobile && (
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className={cn("relative w-full rounded-3xl p-4 flex items-center justify-center", palette.cardInnerBg)}>
              <img
                src={carImage}
                alt={config.vehicleName}
                className="h-auto w-full max-h-[260px] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        )}
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
  const { isMobile } = useDevice()
  const steps = config.steps || [
    { number: 1, title: "Envie seus dados", description: "Preencha o formulário rápido com seu WhatsApp e CNH." },
    { number: 2, title: "Análise sem Score", description: "Avaliamos seu perfil sem burocracia ou exigência de score alto." },
    { number: 3, title: "Assinatura Digital", description: "Contrato transparente e 100% digital direto no seu celular." },
    { number: 4, title: "Retirada em 24h", description: "Pegue seu carro higienizado e abastecido na Zona Sul de SP." },
  ]

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", palette.textHighlight)}>
          Passo a Passo Simplificado
        </span>
        <h2 className={cn(
          "font-display mt-1 font-black",
          isMobile ? "text-xl leading-snug" : "text-2xl sm:text-4xl",
          palette.textPrimary
        )}>
          {config.title}
        </h2>
        {config.subtitle && (
          <p className={cn("mt-1.5 text-xs sm:text-sm font-medium leading-relaxed", palette.textSecondary)}>
            {config.subtitle}
          </p>
        )}
      </div>

      <div className={cn(
        "grid gap-3",
        isMobile ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-4 gap-4"
      )}>
        {steps.map((st) => (
          <div
            key={st.number}
            className={cn(
              "relative rounded-3xl p-5 space-y-2.5 transition-all",
              palette.cardBg,
              palette.cardBorder,
              palette.cardShadow
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 font-black text-slate-950 text-sm shadow-md shadow-amber-500/20">
              0{st.number}
            </span>
            <h3 className={cn("text-sm sm:text-base font-black", palette.textPrimary)}>{st.title}</h3>
            <p className={cn("text-xs font-medium leading-relaxed", palette.textSecondary)}>{st.description}</p>
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
  const { isMobile } = useDevice()
  const items = config.items || []

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", palette.textHighlight)}>
          Quem Já Roda com a Michelines
        </span>
        <h2 className={cn(
          "font-display mt-1 font-black",
          isMobile ? "text-xl leading-snug" : "text-2xl sm:text-4xl",
          palette.textPrimary
        )}>
          {config.title}
        </h2>
        {config.subtitle && (
          <p className={cn("mt-1.5 text-xs sm:text-sm font-medium leading-relaxed", palette.textSecondary)}>
            {config.subtitle}
          </p>
        )}
      </div>

      <div className={cn(
        "grid gap-3",
        isMobile ? "grid-cols-1" : "sm:grid-cols-3 gap-4"
      )}>
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col justify-between rounded-3xl p-5 space-y-3 transition-all",
              palette.cardBg,
              palette.cardBorder,
              palette.cardShadow
            )}
          >
            <div className="space-y-2">
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: item.rating || 5 }).map((_, r) => (
                  <Star key={r} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className={cn("text-xs font-medium italic leading-relaxed", palette.textSecondary)}>
                "{item.testimony}"
              </p>
            </div>
            <div className={cn("border-t pt-2.5", palette.isDark ? "border-slate-800" : "border-slate-100")}>
              <p className={cn("text-xs sm:text-sm font-black", palette.textPrimary)}>{item.name}</p>
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{item.role}</p>
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
  const { isMobile } = useDevice()
  const [km, setKm] = useState(config.defaultKmPerDay || 200)

  const fuelPrice = config.fuelPricePerLiter || 5.89
  const hybridKm = config.hybridAvgKmPerLiter || 19.5
  const flexKm = config.flexAvgKmPerLiter || 9.8

  const flexDailyCost = (km / flexKm) * fuelPrice
  const hybridDailyCost = (km / hybridKm) * fuelPrice

  const dailySavings = Math.max(0, flexDailyCost - hybridDailyCost)
  const monthlySavings = dailySavings * 26 // 26 dias úteis

  return (
    <section className={cn(
      "rounded-3xl transition-all",
      isMobile ? "p-4 space-y-4" : "p-6 sm:p-10 space-y-6",
      palette.cardBg, palette.cardBorder, palette.cardShadow
    )}>
      <div className="text-center max-w-xl mx-auto">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", palette.textHighlight)}>
          Simulador de Economia Real · V1
        </span>
        <h2 className={cn(
          "font-display mt-1 font-black",
          isMobile ? "text-xl leading-snug" : "text-2xl sm:text-3xl",
          palette.textPrimary
        )}>
          {config.title}
        </h2>
        {config.subtitle && (
          <p className={cn("mt-1 text-xs font-medium leading-relaxed", palette.textSecondary)}>
            {config.subtitle}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-xl space-y-4">
        {/* Controle Deslizante */}
        <div className={cn("rounded-2xl p-4 space-y-2.5", palette.cardInnerBg)}>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className={palette.textPrimary}>Quilômetros rodados:</span>
            <span className="text-amber-600 dark:text-amber-400 font-black text-sm bg-amber-400/10 px-2.5 py-0.5 rounded-xl border border-amber-400/30">
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
            className="h-2.5 w-full accent-amber-500 cursor-pointer rounded-lg"
          />
          <div className={cn("flex justify-between text-[9px] font-bold", palette.textMuted)}>
            <span>80 km (Part-time)</span>
            <span>200 km (Padrão)</span>
            <span>350 km (Integral)</span>
          </div>
        </div>

        {/* Resultados Comparativos */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className={cn("rounded-2xl p-3 space-y-0.5", palette.cardInnerBg)}>
            <span className={cn("text-[9px] font-bold block uppercase tracking-wider", palette.textMuted)}>
              Economia / Dia
            </span>
            <span className={cn("font-black text-emerald-600 dark:text-emerald-400", isMobile ? "text-lg" : "text-2xl sm:text-3xl")}>
              R$ {dailySavings.toFixed(0)}
            </span>
            <span className={cn("text-[9px] block", palette.textMuted)}>Menos no posto</span>
          </div>
          <div className={cn("rounded-2xl p-3 space-y-0.5 border", palette.badgeBg, palette.badgeBorder)}>
            <span className={cn("text-[9px] font-bold block uppercase tracking-wider", palette.badgeText)}>
              Economia / Mês
            </span>
            <span className={cn("font-black", isMobile ? "text-lg" : "text-2xl sm:text-3xl", palette.badgeText)}>
              R$ {monthlySavings.toFixed(0)}
            </span>
            <span className={cn("text-[9px] block opacity-80", palette.badgeText)}>Em 26 dias úteis</span>
          </div>
        </div>

        <div className="text-center pt-1">
          <Link
            href="#cadastro"
            onClick={onCta}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-2xl font-black shadow-xl transition-transform",
              isMobile ? "h-12 w-full text-xs" : "h-13 px-8 text-sm hover:scale-105",
              palette.accentGradient
            )}
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
  const { isMobile } = useDevice()
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const items = config.items || []

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", palette.textHighlight)}>
          Tire Suas Dúvidas
        </span>
        <h2 className={cn(
          "font-display mt-1 font-black",
          isMobile ? "text-xl leading-snug" : "text-2xl sm:text-4xl",
          palette.textPrimary
        )}>
          {config.title}
        </h2>
        {config.subtitle && (
          <p className={cn("mt-1.5 text-xs sm:text-sm font-medium leading-relaxed", palette.textSecondary)}>
            {config.subtitle}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-3xl space-y-2.5">
        {items.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={i}
              className={cn("overflow-hidden rounded-2xl transition-colors", palette.cardBg, palette.cardBorder, palette.cardShadow)}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between p-3.5 sm:p-5 text-left font-bold text-xs sm:text-sm"
              >
                <span className={palette.textPrimary}>{item.question}</span>
                <ChevronDown
                  className={cn("h-4 w-4 text-amber-500 shrink-0 transition-transform duration-200", isOpen ? "rotate-180" : "")}
                />
              </button>
              {isOpen && (
                <div className={cn("border-t p-3.5 sm:p-5 text-xs sm:text-sm font-medium leading-relaxed", palette.cardInnerBg, palette.textSecondary)}>
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
  const { isMobile } = useDevice()
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
      className={cn(
        "scroll-mt-20 overflow-hidden rounded-3xl transition-all",
        isMobile ? "p-4 space-y-4" : "p-6 sm:p-10 space-y-6",
        palette.cardBg, palette.cardBorder, palette.cardShadow
      )}
    >
      <div className="text-center max-w-xl mx-auto">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", palette.textHighlight)}>
          Cadastro Direto sem Burocracia
        </span>
        <h2 className={cn(
          "font-display mt-1 font-black",
          isMobile ? "text-xl leading-snug" : "text-2xl sm:text-4xl",
          palette.textPrimary
        )}>
          {config.title}
        </h2>
        {config.subtitle && (
          <p className={cn("mt-1.5 text-xs sm:text-sm font-medium leading-relaxed", palette.textSecondary)}>
            {config.subtitle}
          </p>
        )}
      </div>

      {submitted ? (
        <div className="mx-auto max-w-md text-center space-y-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 shadow-inner">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className={cn("text-lg font-black", palette.textPrimary)}>Cadastro Recebido!</h3>
          <p className={cn("text-xs leading-relaxed", palette.textSecondary)}>
            {config.successMessage || "Nosso consultor entrará em contato com você pelo WhatsApp em instantes para finalizar a reserva."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-3.5">
          <div className="space-y-1">
            <label className={cn("text-xs font-bold block", palette.textPrimary)}>Seu Nome Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: João Silva"
              className={cn("h-11 w-full rounded-xl border px-3.5 text-sm font-medium focus:outline-none transition-colors", palette.inputBg, palette.inputBorder, palette.inputText, palette.inputPlaceholder)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={cn("text-xs font-bold block", palette.textPrimary)}>WhatsApp com DDD</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className={cn("h-11 w-full rounded-xl border px-3.5 text-sm font-medium focus:outline-none transition-colors", palette.inputBg, palette.inputBorder, palette.inputText, palette.inputPlaceholder)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={cn("text-xs font-bold block", palette.textPrimary)}>Veículo de Interesse</label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Ex: Corolla Cross Híbrido, Spin, D-Taxi..."
              className={cn("h-11 w-full rounded-xl border px-3.5 text-sm font-medium focus:outline-none transition-colors", palette.inputBg, palette.inputBorder, palette.inputText, palette.inputPlaceholder)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={cn("h-12 w-full rounded-2xl text-sm font-black shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50", palette.accentGradient)}
          >
            {submitting ? "Enviando..." : config.buttonText || "Enviar Cadastro para Análise"}
          </button>

          <p className={cn("text-center text-[10px]", palette.textMuted)}>
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
  const { isMobile } = useDevice()
  const phone = config.phone || "5511999999999"
  const message = encodeURIComponent(config.customMessage || "Olá! Gostaria de informações sobre a locação de veículos.")

  return (
    <section
      className={cn(
        "rounded-3xl border text-center shadow-xl transition-colors",
        isMobile ? "p-5 space-y-3" : "p-6 sm:p-10 space-y-4",
        palette.isDark
          ? "border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 text-white"
          : "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 text-emerald-950"
      )}
    >
      <h2 className={cn(
        "font-display font-black",
        isMobile ? "text-xl leading-snug" : "text-2xl sm:text-3xl",
        palette.isDark ? "text-white" : "text-emerald-950"
      )}>
        {config.title}
      </h2>
      {config.subtitle && (
        <p className={cn("text-xs sm:text-sm font-medium max-w-lg mx-auto leading-relaxed", palette.isDark ? "text-emerald-100/80" : "text-emerald-800")}>
          {config.subtitle}
        </p>
      )}

      <div className="pt-1">
        <a
          href={`https://wa.me/${phone}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCta}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 font-black text-slate-950 shadow-xl shadow-emerald-500/20 transition-all active:scale-95",
            isMobile ? "h-12 w-full text-xs" : "h-14 px-8 text-base hover:scale-105"
          )}
        >
          <Phone className="h-4 w-4 fill-slate-950" />
          <span>{config.buttonText || "Falar com Consultor no WhatsApp"}</span>
        </a>
      </div>
    </section>
  )
}
