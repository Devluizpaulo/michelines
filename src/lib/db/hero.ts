import { supabase } from "@/lib/supabase"
import type { HeroSlideRow } from "@/types/database"
import type { HeroSlideType } from "@/types/hero-slide"

export function rowToHeroSlide(row: HeroSlideRow): HeroSlideType {
  return {
    id: row.id,
    order: row.order,
    active: row.active,
    title: row.title ?? "",
    glowTitle: row.glow_title ?? "",
    subtitle: row.subtitle ?? "",
    ctaText: row.cta_text ?? "",
    ctaUrl: row.cta_url ?? "",
    image: row.image ?? "",
    mobileImage: row.mobile_image ?? undefined,
    video: row.video ?? undefined,
    badge: row.badge ?? undefined,
    overlay: (row.overlay as HeroSlideType["overlay"]) ?? "gradient",
    theme: (row.theme as HeroSlideType["theme"]) ?? "navy",
    views: row.views,
    clicks: row.clicks,
    ...(row.config as Record<string, any>),
  }
}

export function heroSlideToRow(slide: Partial<HeroSlideType>): Partial<HeroSlideRow> {
  const row: Partial<HeroSlideRow> = {}
  if (slide.order !== undefined) row.order = slide.order
  if (slide.active !== undefined) row.active = slide.active
  if (slide.title !== undefined) row.title = slide.title
  if (slide.glowTitle !== undefined) row.glow_title = slide.glowTitle
  if (slide.subtitle !== undefined) row.subtitle = slide.subtitle
  if (slide.ctaText !== undefined) row.cta_text = slide.ctaText
  if (slide.ctaUrl !== undefined) row.cta_url = slide.ctaUrl
  if (slide.image !== undefined) row.image = slide.image
  if (slide.mobileImage !== undefined) row.mobile_image = slide.mobileImage ?? null
  if (slide.video !== undefined) row.video = slide.video ?? null
  if (slide.badge !== undefined) row.badge = slide.badge ?? null
  if (slide.overlay !== undefined) row.overlay = slide.overlay ?? null
  if (slide.theme !== undefined) row.theme = slide.theme ?? null
  return row
}

export async function listHeroSlides(): Promise<HeroSlideType[]> {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .order("order", { ascending: true })

  if (error) throw error
  return (data ?? []).map((r) => rowToHeroSlide(r as HeroSlideRow))
}

export async function createHeroSlide(slide: Partial<HeroSlideType>): Promise<HeroSlideType> {
  const row = heroSlideToRow(slide)
  const { data, error } = await supabase.from("hero_slides").insert(row as any).select().single()
  if (error) throw error
  return rowToHeroSlide(data as HeroSlideRow)
}

export async function updateHeroSlide(id: string, patch: Partial<HeroSlideType>): Promise<void> {
  const row = heroSlideToRow(patch)
  const { error } = await supabase.from("hero_slides").update(row).eq("id", id)
  if (error) throw error
}

export async function deleteHeroSlide(id: string): Promise<void> {
  const { error } = await supabase.from("hero_slides").delete().eq("id", id)
  if (error) throw error
}

export function subscribeToHeroSlides(onUpdate: (slides: HeroSlideType[]) => void): () => void {
  const channel = supabase
    .channel("hero_slides_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "hero_slides" },
      async () => {
        const slides = await listHeroSlides()
        onUpdate(slides)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export async function incrementHeroViews(id: string): Promise<void> {
  const { data } = await supabase.from("hero_slides").select("views").eq("id", id).maybeSingle()
  if (data) {
    const current = (data as any).views || 0
    await supabase.from("hero_slides").update({ views: current + 1 }).eq("id", id)
  }
}

export async function incrementHeroClicks(id: string): Promise<void> {
  const { data } = await supabase.from("hero_slides").select("clicks").eq("id", id).maybeSingle()
  if (data) {
    const current = (data as any).clicks || 0
    await supabase.from("hero_slides").update({ clicks: current + 1 }).eq("id", id)
  }
}
