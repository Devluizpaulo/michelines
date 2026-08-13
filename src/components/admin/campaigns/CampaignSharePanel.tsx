"use client"

import { useState } from "react"
import { Copy, Check, Instagram, MessageCircle, Link2, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Campaign, campaignPublicUrl } from "@/types/campaign"

/**
 * Kit de divulgação da campanha.
 *
 * O Instagram não aceita link clicável na legenda: o link vai na bio (ou no
 * sticker do story) e a legenda manda o seguidor para lá. Por isso as duas
 * ações ficam separadas — copiar o link e copiar a legenda.
 */
export function CampaignSharePanel({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const url = campaignPublicUrl(campaign.slug)

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      /* clipboard bloqueado: o usuário seleciona manualmente no textarea */
    }
  }

  const instagramCaption = buildInstagramCaption(campaign)
  const storyText = `${campaign.headline}\n\nArrasta pra cima 👆 ou link na bio`
  const whatsappText = `${campaign.headline}${campaign.subheadline ? `\n${campaign.subheadline}` : ""}\n\n${url}`

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-xs font-bold text-slate-600 transition-colors hover:text-slate-900"
      >
        <Instagram className="h-3.5 w-3.5 shrink-0 text-pink-600" />
        Kit de divulgação
        <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Link para a bio */}
          <ShareBlock
            icon={Link2}
            title="Link para a bio do Instagram"
            hint="Cole no campo de link do perfil ou no sticker do story."
            value={url}
            mono
            copied={copied === "url"}
            onCopy={() => copy(url, "url")}
          />

          <ShareBlock
            icon={Instagram}
            title="Legenda do post"
            hint="O link não fica clicável na legenda — por isso ela manda para a bio."
            value={instagramCaption}
            multiline
            copied={copied === "caption"}
            onCopy={() => copy(instagramCaption, "caption")}
          />

          <ShareBlock
            icon={Instagram}
            title="Texto do story"
            hint="Curto, para caber sobre a arte."
            value={storyText}
            multiline
            copied={copied === "story"}
            onCopy={() => copy(storyText, "story")}
          />

          <ShareBlock
            icon={MessageCircle}
            title="Mensagem de WhatsApp"
            hint="Aqui o link é clicável e abre a página da campanha."
            value={whatsappText}
            multiline
            copied={copied === "wa"}
            onCopy={() => copy(whatsappText, "wa")}
          />
        </div>
      )}
    </div>
  )
}

function ShareBlock({
  icon: Icon, title, hint, value, multiline, mono, copied, onCopy,
}: {
  icon: React.ElementType
  title: string
  hint: string
  value: string
  multiline?: boolean
  mono?: boolean
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-black text-slate-700">
            <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {title}
          </p>
          <p className="mt-0.5 text-[10px] font-medium leading-snug text-slate-400">{hint}</p>
        </div>
        <button
          onClick={onCopy}
          className={cn(
            "flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition-colors",
            copied
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      {multiline ? (
        <textarea
          readOnly
          value={value}
          rows={value.split("\n").length > 6 ? 7 : 4}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white p-2 text-[11px] leading-relaxed text-slate-700"
        />
      ) : (
        <input
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "mt-2 w-full rounded-lg border border-slate-200 bg-white p-2 text-[11px] text-slate-700",
            mono && "font-mono"
          )}
        />
      )}
    </div>
  )
}

/** Legenda pronta com a oferta da campanha e as hashtags do nicho. */
function buildInstagramCaption(campaign: Campaign): string {
  const linhas = [
    `✨ ${campaign.headline}`,
    "",
    campaign.subheadline || "",
    campaign.subheadline ? "" : null,
    ...(campaign.highlights || []).map((h) => `✅ ${h}`),
    (campaign.highlights || []).length ? "" : null,
    "🏆 45 anos de tradição em São Paulo",
    "🚕 Manutenção, seguro e suporte inclusos",
    "",
    `👉 ${campaign.ctaText || "Cadastre-se"} pelo link da bio!`,
    "",
    ".",
    ".",
    ".",
    "#michelines #grupomichelines #locacaodetaxi #taxisp #motoristadetaxi #dtaxi #congonhas #taxihibrido #saopaulo #motoristaprofissional #rendaextra #taxi",
  ]

  return linhas.filter((l) => l !== null && l !== "").length
    ? linhas.filter((l) => l !== null).join("\n").replace(/\n{3,}/g, "\n\n").trim()
    : ""
}
