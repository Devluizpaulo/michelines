"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock, ShieldCheck, Phone } from "lucide-react"
import { Campaign, CAMPAIGN_THEMES, campaignSignupUrl } from "@/types/campaign"
import { registerCampaignView, registerCampaignClick } from "@/lib/campaigns-crud"
import { LOGO_IMAGES } from "@/lib/supabase"

import { DynamicLandingRenderer } from "@/components/public/campaign-sections/DynamicLandingRenderer"
import { DEFAULT_4V_SECTIONS } from "@/types/campaign-studio"

/**
 * Página pública de uma campanha.
 *
 * É o destino do link colado na bio do Instagram, em stories ou no WhatsApp.
 * Toda visita conta uma view e todo clique no CTA conta um clique.
 * Renderiza dinamicamente as seções configuradas no Estúdio 4V do Painel.
 */
export function CampaignLanding({ campaign }: { campaign: Campaign }) {
  const viewCountedRef = useRef(false)

  useEffect(() => {
    // StrictMode roda o efeito duas vezes em dev; o ref evita contar em dobro.
    if (viewCountedRef.current) return
    viewCountedRef.current = true
    registerCampaignView(campaign.id)
  }, [campaign.id])

  const handleCtaClick = () => {
    registerCampaignClick(campaign.id)
  }

  // Se a campanha não tiver seções personalizadas salvas ainda, usa o template 4V padrão
  const campaignWithSections: Campaign = {
    ...campaign,
    sections: campaign.sections && campaign.sections.length > 0 ? campaign.sections : DEFAULT_4V_SECTIONS,
  }

  return (
    <DynamicLandingRenderer campaign={campaignWithSections} onCtaClick={handleCtaClick} />
  )
}
