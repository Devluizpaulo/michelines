import { supabase } from "@/lib/supabase"
import type { CampaignRow, CampaignStatusDb } from "@/types/database"
import type { Campaign, CampaignStatus, CampaignTheme } from "@/types/campaign"
import { slugifyCampaign } from "@/types/campaign"

export function rowToCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status as CampaignStatus,
    headline: row.headline,
    subheadline: row.subheadline ?? undefined,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    highlights: row.highlights ?? [],
    ctaText: row.cta_text ?? "Quero Alugar",
    vehicleInterest: row.vehicle_interest ?? undefined,
    theme: (row.theme as CampaignTheme) ?? "navy",
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    views: row.views,
    clicks: row.clicks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? undefined,
  }
}

export function campaignToRow(c: Partial<Campaign>): Partial<CampaignRow> {
  const row: Partial<CampaignRow> = {}
  if (c.slug !== undefined) row.slug = c.slug
  if (c.name !== undefined) row.name = c.name
  if (c.status !== undefined) row.status = c.status as CampaignStatusDb
  if (c.headline !== undefined) row.headline = c.headline
  if (c.subheadline !== undefined) row.subheadline = c.subheadline ?? null
  if (c.description !== undefined) row.description = c.description ?? null
  if (c.imageUrl !== undefined) row.image_url = c.imageUrl ?? null
  if (c.highlights !== undefined) row.highlights = c.highlights
  if (c.ctaText !== undefined) row.cta_text = c.ctaText
  if (c.vehicleInterest !== undefined) row.vehicle_interest = c.vehicleInterest ?? null
  if (c.theme !== undefined) row.theme = c.theme
  if (c.startDate !== undefined) row.start_date = c.startDate ?? null
  if (c.endDate !== undefined) row.end_date = c.endDate ?? null
  return row
}

export type CampaignInput = Omit<
  Campaign,
  "id" | "views" | "clicks" | "createdAt" | "updatedAt" | "createdBy"
>

export async function ensureUniqueSlug(desired: string, ignoreId?: string): Promise<string> {
  const base = slugifyCampaign(desired) || "campanha"

  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
    let q = supabase.from("campaigns").select("id").eq("slug", candidate)
    if (ignoreId) q = q.neq("id", ignoreId)
    const { data } = await q
    if (!data || data.length === 0) return candidate
  }

  return `${base}-${Math.random().toString(36).slice(2, 7)}`
}

export async function listCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((r) => rowToCampaign(r as CampaignRow))
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data ? rowToCampaign(data as CampaignRow) : null
}

export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error) throw error
  return data ? rowToCampaign(data as CampaignRow) : null
}

export async function createCampaign(
  input: CampaignInput,
  _createdBy?: string
): Promise<Campaign> {
  const slug = await ensureUniqueSlug(input.slug || input.name)
  const row = {
    ...campaignToRow(input),
    slug,
    name: input.name,
    headline: input.headline,
  }

  const { data, error } = await supabase.from("campaigns").insert(row as any).select().single()
  if (error) throw error
  return rowToCampaign(data as CampaignRow)
}

export async function updateCampaign(id: string, input: Partial<CampaignInput>): Promise<void> {
  const patch = campaignToRow(input)
  if (input.slug) {
    patch.slug = await ensureUniqueSlug(input.slug, id)
  }

  const { error } = await supabase.from("campaigns").update(patch).eq("id", id)
  if (error) throw error
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase.from("campaigns").delete().eq("id", id)
  if (error) throw error
}

/** Usa a RPC registrar_metrica_campanha no Postgres com privilégios de segurança */
export async function registerCampaignView(id: string): Promise<void> {
  try {
    await supabase.rpc("registrar_metrica_campanha", { p_campaign_id: id, p_metrica: "view" })
  } catch (e) {
    console.warn("[campaigns] Falha ao registrar visualização:", e)
  }
}

export async function registerCampaignClick(id: string): Promise<void> {
  try {
    await supabase.rpc("registrar_metrica_campanha", { p_campaign_id: id, p_metrica: "click" })
  } catch (e) {
    console.warn("[campaigns] Falha ao registrar clique:", e)
  }
}
