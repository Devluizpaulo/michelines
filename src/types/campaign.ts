/**
 * Campanha de divulgação com página própria.
 *
 * Cada campanha vira uma URL pública (/c/{slug}) que pode ser colada no link da
 * bio do Instagram, em stories ou no WhatsApp. Todo lead que entra por essa
 * página carrega o `campaignId`, fechando o ciclo criação → divulgação →
 * atribuição do lead.
 */
import type { CampaignSection } from "./campaign-studio"

export interface Campaign {
  id: string
  /** Identificador da URL pública: /c/{slug}. Único e imutável após criado. */
  slug: string
  /** Nome interno, usado no painel e nos relatórios */
  name: string
  status: CampaignStatus

  // ── Conteúdo da página ──
  headline: string
  subheadline?: string
  description?: string
  imageUrl?: string
  /** Destaques exibidos como selos (ex.: "Diária a partir de R$ 57") */
  highlights?: string[]
  ctaText: string
  /** Modelo pré-selecionado no formulário de cadastro */
  vehicleInterest?: string
  theme: CampaignTheme

  // ── Seções Dinâmicas do Estúdio 4V ──
  sections?: CampaignSection[]
  utmStats?: Record<string, number>

  // ── Vigência (opcional) ──
  startDate?: string
  endDate?: string

  // ── Métricas acumuladas ──
  views: number
  clicks: number

  // ── Auditoria ──
  createdAt: string
  updatedAt?: string
  createdBy?: string
}

export type CampaignStatus = "draft" | "active" | "paused" | "ended"

export type CampaignTheme =
  | "claro"
  | "verde_claro"
  | "creme"
  | "navy"
  | "amber"
  | "emerald"
  | "violet"
  | "editorial"
  | "minimal"

export const CAMPAIGN_STATUS_LABELS: Record<
  CampaignStatus,
  { label: string; color: string }
> = {
  draft:  { label: "Rascunho", color: "bg-slate-100 text-slate-600 border-slate-200" },
  active: { label: "Ativa",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  paused: { label: "Pausada",  color: "bg-amber-50 text-amber-700 border-amber-200" },
  ended:  { label: "Encerrada", color: "bg-slate-100 text-slate-500 border-slate-200" },
}

/** Paleta de cada tema, usada tanto na página pública quanto na prévia do painel. */
export const CAMPAIGN_THEMES: Record<
  CampaignTheme,
  { label: string; from: string; to: string; accent: string; accentHover: string; swatch: string }
> = {
  claro: {
    label: "Claro Neutro (Branco & Cinza)",
    from: "from-[#ffffff]",
    to: "to-[#f1f5f9]",
    accent: "bg-slate-900",
    accentHover: "hover:bg-slate-800",
    swatch: "#ffffff",
  },
  verde_claro: {
    label: "Verde Claro (Sálvia & Esmeralda)",
    from: "from-[#f3faf6]",
    to: "to-[#dcf0e4]",
    accent: "bg-emerald-600",
    accentHover: "hover:bg-emerald-500",
    swatch: "#10b981",
  },
  creme: {
    label: "Institucional Nobre (Creme & Ouro)",
    from: "from-[#fbf9f5]",
    to: "to-[#eee6d8]",
    accent: "bg-amber-500",
    accentHover: "hover:bg-amber-600",
    swatch: "#f5f0e8",
  },
  navy: {
    label: "Azul Michelines (Céu & Marinho)",
    from: "from-[#0a192f]",
    to: "to-[#1b3e72]",
    accent: "bg-amber-500",
    accentHover: "hover:bg-amber-600",
    swatch: "#1b3e72",
  },
  amber: {
    label: "Ouro & Âmbar (Urgência & Feirão)",
    from: "from-[#7c2d12]",
    to: "to-[#b45309]",
    accent: "bg-amber-400",
    accentHover: "hover:bg-amber-500",
    swatch: "#b45309",
  },
  emerald: {
    label: "Tons de Verde (Economia & Híbridos)",
    from: "from-[#064e3b]",
    to: "to-[#047857]",
    accent: "bg-emerald-400",
    accentHover: "hover:bg-emerald-500",
    swatch: "#047857",
  },
  violet: {
    label: "Violeta Tecnológico (Moderno)",
    from: "from-[#2e1065]",
    to: "to-[#6d28d9]",
    accent: "bg-violet-400",
    accentHover: "hover:bg-violet-500",
    swatch: "#6d28d9",
  },
  editorial: {
    label: "Editorial Dark (Ouro & Preto Nobre)",
    from: "from-[#171108]",
    to: "to-[#070503]",
    accent: "bg-amber-400",
    accentHover: "hover:bg-amber-300",
    swatch: "#d97706",
  },
  minimal: {
    label: "Minimal Sofisticado (Carvão Profundo)",
    from: "from-[#111317]",
    to: "to-[#050607]",
    accent: "bg-slate-100",
    accentHover: "hover:bg-white",
    swatch: "#334155",
  },
}

/**
 * Converte um nome livre em slug de URL.
 * "Feirão Híbrido 2026!" → "feirao-hibrido-2026"
 */
export function slugifyCampaign(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove os acentos separados pelo NFD
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

/** A campanha está no ar agora? Considera status e vigência. */
export function isCampaignLive(campaign: Campaign, now = new Date()): boolean {
  if (campaign.status !== "active") return false
  if (campaign.startDate && new Date(campaign.startDate) > now) return false
  // endDate é o último dia inclusive
  if (campaign.endDate) {
    const end = new Date(campaign.endDate)
    end.setHours(23, 59, 59, 999)
    if (end < now) return false
  }
  return true
}

/** URL pública absoluta da campanha (para copiar/compartilhar). */
export function campaignPublicUrl(slug: string, origin?: string): string {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "")
  return `${base}/c/${slug}`
}

/** Link de cadastro já com a atribuição da campanha. */
export function campaignSignupUrl(campaign: Pick<Campaign, "id" | "name" | "vehicleInterest">): string {
  const params = new URLSearchParams({
    campaignId: campaign.id,
    campaignName: campaign.name,
  })
  if (campaign.vehicleInterest) params.set("vehicle", campaign.vehicleInterest)
  return `/cadastro?${params.toString()}`
}
