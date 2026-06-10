/**
 * supabase-crud.ts
 * Wrapper centralizado para operações no Supabase Storage e (futuramente) Supabase DB.
 * Retorna { data, error } em vez de lançar exceções.
 *
 * Usa o cliente singleton de supabase.ts para evitar múltiplas instâncias GoTrueClient.
 */

import { supabase, supabaseUrl } from "@/lib/supabase"

export { supabase, supabaseUrl }

export interface StorageResult<T> {
  data: T | null
  error: string | null
}

// ─── Bucket names ─────────────────────────────────────────────────────────────
export const BUCKETS = {
  vehicles: "vehicles",
  banners: "banners",
  logos: "logos",
} as const

// ─── URLs ─────────────────────────────────────────────────────────────────────

/**
 * URL pública direta de um arquivo no Storage
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * URL com transformação (redimensionamento + qualidade) — requer Supabase Pro ou capacidade de transformação ativa
 * Fallback para URL direta se não disponível.
 */
export function getOptimizedUrl(
  bucket: string,
  path: string,
  width = 800,
  quality = 80
): string {
  // Always fallback to public URL to avoid 403 rendering errors on free tiers
  return getPublicUrl(bucket, path)
}

/**
 * URL pública base (compatível com next/image remotePatterns)
 */
export const SUPABASE_STORAGE_BASE = `${supabaseUrl}/storage/v1/object/public`

// ─── UPLOAD ───────────────────────────────────────────────────────────────────

export interface UploadOptions {
  upsert?: boolean
  cacheControl?: string
  contentType?: string
}

/**
 * Faz upload de um arquivo para o Storage
 */
export async function uploadFile(
  bucket: string,
  filePath: string,
  file: File,
  options: UploadOptions = {}
): Promise<StorageResult<string>> {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: options.upsert ?? true,
      cacheControl: options.cacheControl ?? "31536000",
      contentType: options.contentType ?? file.type,
    })
    if (error) return { data: null, error: error.message }
    return { data: getPublicUrl(bucket, data.path), error: null }
  } catch (err: any) {
    console.error(`[supabase-crud] uploadFile(${bucket}/${filePath}):`, err)
    return { data: null, error: err.message || "Erro ao fazer upload." }
  }
}

// ─── LIST ─────────────────────────────────────────────────────────────────────

export interface StorageFile {
  name: string
  id: string
  publicUrl: string
  updatedAt: string
  size: number
  mimeType: string
}

/**
 * Lista arquivos de uma pasta no bucket
 */
export async function listFiles(
  bucket: string,
  folder = "",
  limit = 100
): Promise<StorageResult<StorageFile[]>> {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit,
      sortBy: { column: "created_at", order: "desc" },
    })
    if (error) return { data: null, error: error.message }

    const files: StorageFile[] = (data || [])
      .filter((f) => f.name !== ".emptyFolderPlaceholder")
      .map((f) => ({
        name: f.name,
        id: f.id || f.name,
        publicUrl: getPublicUrl(bucket, folder ? `${folder}/${f.name}` : f.name),
        updatedAt: f.updated_at || "",
        size: f.metadata?.size || 0,
        mimeType: f.metadata?.mimetype || "",
      }))

    return { data: files, error: null }
  } catch (err: any) {
    console.error(`[supabase-crud] listFiles(${bucket}/${folder}):`, err)
    return { data: null, error: err.message || "Erro ao listar arquivos." }
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Remove um ou mais arquivos do bucket utilizando a API interna para evitar restrições RLS
 */
export async function deleteFiles(
  bucket: string,
  paths: string[]
): Promise<StorageResult<boolean>> {
  try {
    const res = await fetch(`/api/media?bucket=${bucket}&paths=${encodeURIComponent(paths.join(","))}`, {
      method: "DELETE",
    })
    const json = await res.json()
    if (!res.ok || json.error) {
      return { data: null, error: json.error || "Erro na API ao excluir arquivos." }
    }
    return { data: true, error: null }
  } catch (err: any) {
    console.error(`[supabase-crud] deleteFiles(${bucket}):`, err)
    return { data: null, error: err.message || "Erro ao excluir arquivos." }
  }
}

// ─── Helpers de URL para retrocompatibilidade ─────────────────────────────────
export function getSupabaseImageUrl(bucket: string, filename: string): string {
  return `${SUPABASE_STORAGE_BASE}/${bucket}/${filename}`
}
