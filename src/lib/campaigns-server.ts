import { Campaign } from "@/types/campaign"
import { getCampaignBySlug } from "@/lib/db/campaigns"

/**
 * Busca uma campanha pelo slug no servidor (Server Components e Metadata).
 * Lê do Supabase Postgres respeitando as políticas públicas de RLS.
 * Retorna null se não encontrar ou em caso de erro (tratado como 404).
 */
export async function fetchCampaignBySlug(slug: string): Promise<Campaign | null> {
  if (!slug) return null

  try {
    const campaign = await getCampaignBySlug(slug)
    return campaign
  } catch (e) {
    console.warn("[campaigns-server] Erro ao buscar campanha por slug:", e)
    return null
  }
}
