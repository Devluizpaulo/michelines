import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Cliente tipado pelo schema — `select` em coluna inexistente vira erro de compilação. */
export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Singleton pattern — garante uma única instância do cliente Supabase no browser.
 * Resolve o aviso "Multiple GoTrueClient instances detected".
 */
let _supabaseInstance: TypedSupabaseClient | null = null

function getSupabaseClient(): TypedSupabaseClient {
  if (_supabaseInstance) return _supabaseInstance
  _supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Necessário para o fluxo de convite/redefinição de senha, que chega
      // com os tokens no fragmento da URL (#access_token=...).
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  })
  return _supabaseInstance
}

/**
 * Cliente público (browser-safe) — usa anon key e respeita o RLS.
 * Singleton: sempre retorna a mesma instância.
 */
export const supabase = getSupabaseClient()

/**
 * Cliente de leitura para Server Components (ex.: metadata de /c/{slug}).
 *
 * Sem sessão: enxerga exatamente o que um visitante anônimo enxerga pelo RLS.
 * Não é singleton de propósito — cada render no servidor cria o seu, evitando
 * vazar estado entre requisições.
 */
export function createServerReadClient(): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

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
 */
export function getOptimizedImageUrl(
  bucket: string,
  filename: string,
  width = 800,
  quality = 80
): string {
  // Fallback to direct public URL to avoid 403 transformation errors
  return getSupabaseImageUrl(bucket, filename)
}

/**
 * Tenta otimizar uma URL caso ela pertença ao Supabase Storage deste projeto.
 * Se não for do Supabase, retorna a URL original sem alterações.
 */
export function optimizeImageUrl(url: string, width = 600, quality = 80): string {
  // Always return direct URL to bypass paid Image Transformation 403 limitations
  return url
}

/**
 * URLs diretas das imagens de veículos já enviadas ao Supabase
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
