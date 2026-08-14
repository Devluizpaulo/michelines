import { supabase } from "@/lib/supabase"
import type { AppSettingRow } from "@/types/database"

/**
 * Repositório para a tabela `app_settings`.
 * Armazena configurações globais em formato JSONB (`key` -> `value`).
 */

export async function getSetting<T = unknown>(key: string, defaultValue?: T): Promise<T> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle()

  if (error) {
    console.warn(`[app_settings] Erro ao carregar chave '${key}':`, error)
    return (defaultValue ?? null) as T
  }

  return data?.value !== undefined && data?.value !== null ? (data.value as T) : ((defaultValue ?? null) as T)
}

export async function setSetting<T = unknown>(
  key: string,
  value: T,
  description?: string
): Promise<void> {
  const row: AppSettingRow = {
    key,
    value: value as any,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("app_settings").upsert(row as any, { onConflict: "key" })
  if (error) throw error
}

export function subscribeToSetting<T = unknown>(
  key: string,
  onUpdate: (value: T) => void
): () => void {
  const channel = supabase
    .channel(`setting-${key}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "app_settings",
        filter: `key=eq.${key}`,
      },
      (payload) => {
        if (payload.new && "value" in payload.new) {
          onUpdate((payload.new as AppSettingRow).value as T)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
