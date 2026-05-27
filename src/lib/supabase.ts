import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Client público (browser-safe) — usa anon key
 * Use para leitura de imagens públicas e uploads do lado do cliente.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Bucket names registrados no Supabase Storage
 */
export const BUCKETS = {
  vehicles: "vehicles",
  banners: "banners",
  logos: "logos",
} as const

/**
 * Base URL pública do Supabase Storage
 */
export const SUPABASE_STORAGE_BASE = `${supabaseUrl}/storage/v1/object/public`

/**
 * Gera a URL pública de uma imagem no Supabase Storage
 */
export function getSupabaseImageUrl(bucket: string, filename: string): string {
  return `${SUPABASE_STORAGE_BASE}/${bucket}/${filename}`
}

/**
 * Gera URL otimizada com transformação de imagem (redimensionamento + qualidade)
 * Requer que a feature de transformação esteja ativa no projeto Supabase.
 * Fallback automático para URL pública direta se não disponível.
 */
export function getOptimizedImageUrl(
  bucket: string,
  filename: string,
  width = 800,
  quality = 80
): string {
  const base = `${supabaseUrl}/storage/v1/render/image/public/${bucket}/${filename}`
  return `${base}?width=${width}&quality=${quality}&resize=contain`
}

/**
 * URLs diretas das imagens de veículos já enviadas ao Supabase
 * (geradas após o upload via scripts/upload-images-to-supabase.mjs)
 */
export const VEHICLE_IMAGES: Record<string, string> = {
  "corolla-cross":    getSupabaseImageUrl("vehicles", "corolla-cross.png"),
  "corolla":          getSupabaseImageUrl("vehicles", "corolla.png"),
  "prius":            getSupabaseImageUrl("vehicles", "prius.png"),
  "ioniq":            getSupabaseImageUrl("vehicles", "ioniq.png"),
  "dtaxi-spin":       getSupabaseImageUrl("vehicles", "dtaxi-spin.png"),
  "spin-big":         getSupabaseImageUrl("vehicles", "spin-big.png"),
  "virtus":           getSupabaseImageUrl("vehicles", "virtus.png"),
  "onix-plus":        getSupabaseImageUrl("vehicles", "onix-plus.png"),
  "polo":             getSupabaseImageUrl("vehicles", "polo.png"),
  "logan":            getSupabaseImageUrl("vehicles", "logan.png"),
  "cronos":           getSupabaseImageUrl("vehicles", "cronos.png"),
  "gol":              getSupabaseImageUrl("vehicles", "gol.png"),
  "versa":            getSupabaseImageUrl("vehicles", "versa.png"),
  "voyage":           getSupabaseImageUrl("vehicles", "voyage.png"),
  "c3":               getSupabaseImageUrl("vehicles", "c3.png"),
  "c3-aircross":      getSupabaseImageUrl("vehicles", "c3-aircross.png"),
}

export const BANNER_IMAGES: Record<string, string> = {
  "banner-1":          getSupabaseImageUrl("banners", "banner-1.png"),
  "banner-2":          getSupabaseImageUrl("banners", "banner-2.png"),
  "banner-3":          getSupabaseImageUrl("banners", "banner-3.png"),
  "dtaxi-partnership": getSupabaseImageUrl("banners", "dtaxi-partnership.png"),
  "novo-polo-2025":    getSupabaseImageUrl("banners", "novo-polo-2025.jpeg"),
}

export const LOGO_IMAGES = {
  primary:  getSupabaseImageUrl("logos", "logo-grupo-michelines.png"),
  banner:   getSupabaseImageUrl("logos", "logo-grupo-michelines-banner.png"),
}
