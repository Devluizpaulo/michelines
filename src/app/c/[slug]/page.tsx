import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { fetchCampaignBySlug } from "@/lib/campaigns-server"
import { isCampaignLive } from "@/types/campaign"
import { CampaignLanding } from "./CampaignLanding"

interface PageProps {
  params: { slug: string }
}

/**
 * Open Graph da campanha — é o que aparece quando o link é colado no WhatsApp,
 * no Facebook ou no direct do Instagram. Sem isto o compartilhamento mostraria
 * apenas a URL crua.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const campaign = await fetchCampaignBySlug(params.slug)

  if (!campaign) {
    return { title: "Campanha não encontrada | Grupo Michelines" }
  }

  const title = campaign.headline || campaign.name
  const description =
    campaign.subheadline ||
    campaign.description ||
    "Alugue seu táxi com o Grupo Michelines. Cadastro rápido, sem burocracia de score."

  return {
    title: `${title} | Grupo Michelines`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Grupo Michelines",
      locale: "pt_BR",
      ...(campaign.imageUrl ? { images: [{ url: campaign.imageUrl }] } : {}),
    },
    twitter: {
      card: campaign.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(campaign.imageUrl ? { images: [campaign.imageUrl] } : {}),
    },
    // Páginas de campanha são efêmeras e feitas para tráfego pago/social:
    // manter fora do índice evita competir com o site institucional.
    robots: { index: false, follow: true },
  }
}

export default async function CampaignPage({ params }: PageProps) {
  const campaign = await fetchCampaignBySlug(params.slug)

  // Rascunho, pausada, encerrada ou fora da vigência não é acessível ao público
  if (!campaign || !isCampaignLive(campaign)) {
    notFound()
  }

  return <CampaignLanding campaign={campaign} />
}
