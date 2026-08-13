"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock, ShieldCheck, Phone } from "lucide-react"
import { Campaign, CAMPAIGN_THEMES, campaignSignupUrl } from "@/types/campaign"
import { registerCampaignView, registerCampaignClick } from "@/lib/campaigns-crud"
import { LOGO_IMAGES } from "@/lib/supabase"

/**
 * Página pública de uma campanha.
 *
 * É o destino do link colado na bio do Instagram, em stories ou no WhatsApp.
 * Toda visita conta uma view e todo clique no CTA conta um clique, e o CTA leva
 * ao cadastro já carregando `campaignId` — é assim que o lead nasce atribuído.
 */
export function CampaignLanding({ campaign }: { campaign: Campaign }) {
  const theme = CAMPAIGN_THEMES[campaign.theme] ?? CAMPAIGN_THEMES.navy
  const viewCountedRef = useRef(false)

  useEffect(() => {
    // StrictMode roda o efeito duas vezes em dev; o ref evita contar em dobro.
    if (viewCountedRef.current) return
    viewCountedRef.current = true
    registerCampaignView(campaign.id)
  }, [campaign.id])

  const signupHref = campaignSignupUrl(campaign)

  const handleCtaClick = () => {
    // Não aguardamos a promessa: a navegação não pode esperar a métrica.
    registerCampaignClick(campaign.id)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.from} ${theme.to} text-white`}>
      {/* Topo */}
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_IMAGES.banner}
            alt="Grupo Michelines"
            className="h-9 w-auto object-contain"
          />
        </Link>
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/80">
          45 anos de tradição
        </span>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-16">
        {/* Criativo */}
        {campaign.imageUrl && (
          <div className="mb-7 overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campaign.imageUrl}
              alt={campaign.headline}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
          {campaign.headline}
        </h1>

        {campaign.subheadline && (
          <p className="mt-3 text-lg font-bold text-white/85 sm:text-xl">{campaign.subheadline}</p>
        )}

        {campaign.description && (
          <p className="mt-5 max-w-2xl text-sm font-medium leading-relaxed text-white/75 sm:text-base">
            {campaign.description}
          </p>
        )}

        {/* Destaques */}
        {campaign.highlights && campaign.highlights.length > 0 && (
          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {campaign.highlights.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <span className="text-sm font-bold leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA principal */}
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={signupHref}
            onClick={handleCtaClick}
            className={`inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl px-8 text-base font-black text-slate-900 shadow-xl transition-transform active:scale-[0.98] sm:flex-none ${theme.accent} ${theme.accentHover}`}
          >
            {campaign.ctaText || "Quero me cadastrar"}
            <ArrowRight className="h-5 w-5 shrink-0" />
          </Link>

          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 text-sm font-bold text-white transition-colors hover:bg-white/20"
          >
            <Phone className="h-4 w-4 shrink-0" />
            Falar no WhatsApp
          </a>
        </div>

        {campaign.vehicleInterest && (
          <p className="mt-3 text-xs font-bold text-white/60">
            Cadastro já direcionado para o {campaign.vehicleInterest}.
          </p>
        )}

        {/* Reforços de confiança */}
        <div className="mt-12 grid gap-3 border-t border-white/15 pt-8 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Sem análise de score", text: "Cadastro aprovado sem burocracia de crédito." },
            { icon: Clock, title: "Retirada em 24h", text: "Documentação simples e veículo pronto para rodar." },
            { icon: CheckCircle2, title: "Suporte completo", text: "Manutenção, seguro e apoio operacional inclusos." },
          ].map((item) => (
            <div key={item.title} className="space-y-1">
              <item.icon className="h-5 w-5 text-white/70" />
              <p className="text-sm font-black">{item.title}</p>
              <p className="text-xs font-medium leading-relaxed text-white/65">{item.text}</p>
            </div>
          ))}
        </div>
      </main>

      {/* CTA fixo no mobile — a página é longa e o botão do topo sai da tela */}
      <div className="sticky bottom-0 border-t border-white/15 bg-black/40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
        <Link
          href={signupHref}
          onClick={handleCtaClick}
          className={`flex min-h-13 items-center justify-center gap-2 rounded-2xl px-6 text-base font-black text-slate-900 ${theme.accent}`}
        >
          {campaign.ctaText || "Quero me cadastrar"}
          <ArrowRight className="h-5 w-5 shrink-0" />
        </Link>
      </div>

      <footer className="border-t border-white/10 px-5 py-6 text-center">
        <p className="text-[11px] font-medium text-white/50">
          © {new Date().getFullYear()} Grupo Michelines. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
