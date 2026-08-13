import { Campaign } from "@/types/campaign"

/**
 * Leitura de campanha no servidor, via API REST do Firestore.
 *
 * O SDK web do Firebase é client-side; para gerar as tags Open Graph em
 * `generateMetadata` (o que faz o link da campanha exibir imagem e título ao ser
 * colado no WhatsApp/Facebook) precisamos buscar antes de renderizar. A REST API
 * resolve sem Admin SDK: a coleção `campaigns` é de leitura pública, igual a
 * `landing` e `hero_slides`.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

/** Converte um valor tipado do Firestore REST para JS puro. */
function decodeValue(value: any): unknown {
  if (value == null) return undefined
  if ("stringValue" in value) return value.stringValue
  if ("integerValue" in value) return Number(value.integerValue)
  if ("doubleValue" in value) return value.doubleValue
  if ("booleanValue" in value) return value.booleanValue
  if ("nullValue" in value) return null
  if ("timestampValue" in value) return value.timestampValue
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decodeValue)
  if ("mapValue" in value) return decodeFields(value.mapValue.fields || {})
  return undefined
}

function decodeFields(fields: Record<string, any>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields)) {
    out[key] = decodeValue(value)
  }
  return out
}

/**
 * Busca uma campanha pelo slug no servidor.
 * Retorna null em qualquer falha — a página trata como 404.
 */
export async function fetchCampaignBySlug(slug: string): Promise<Campaign | null> {
  if (!PROJECT_ID || !API_KEY) {
    console.warn("[campaigns-server] Configuração do Firebase ausente no servidor.")
    return null
  }

  try {
    const res = await fetch(`${BASE}:runQuery?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "campaigns" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "slug" },
              op: "EQUAL",
              value: { stringValue: slug },
            },
          },
          limit: 1,
        },
      }),
      // Revalida a cada minuto: o conteúdo muda pouco, mas pausar uma campanha
      // precisa refletir rápido na página pública.
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      console.warn("[campaigns-server] Consulta falhou:", res.status)
      return null
    }

    const rows = await res.json()
    const row = Array.isArray(rows) ? rows.find((r: any) => r.document) : null
    if (!row?.document) return null

    const id = String(row.document.name).split("/").pop() as string
    return { id, ...decodeFields(row.document.fields || {}) } as Campaign
  } catch (e) {
    console.warn("[campaigns-server] Erro ao buscar campanha:", e)
    return null
  }
}
