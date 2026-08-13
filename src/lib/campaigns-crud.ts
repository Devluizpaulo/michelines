import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
} from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Campaign, slugifyCampaign } from "@/types/campaign"

const COLLECTION = "campaigns"

/** Campos que o formulário edita — id, métricas e auditoria ficam de fora. */
export type CampaignInput = Omit<
  Campaign,
  "id" | "views" | "clicks" | "createdAt" | "updatedAt" | "createdBy"
>

/**
 * Garante um slug livre, acrescentando sufixo numérico em caso de colisão.
 * `ignoreId` permite reeditar uma campanha sem colidir com ela mesma.
 */
export async function ensureUniqueSlug(desired: string, ignoreId?: string): Promise<string> {
  const base = slugifyCampaign(desired) || "campanha"

  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
    const snap = await getDocs(
      query(collection(db, COLLECTION), where("slug", "==", candidate), limit(1))
    )
    const taken = snap.docs.some((d) => d.id !== ignoreId)
    if (!taken) return candidate
  }

  // Escape final improvável: sufixo aleatório
  return `${base}-${Math.random().toString(36).slice(2, 7)}`
}

export async function listCampaigns(): Promise<Campaign[]> {
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Campaign))
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Campaign) : null
}

/** Busca pelo slug — usado pela página pública /c/{slug}. */
export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("slug", "==", slug), limit(1))
  )
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Campaign
}

export async function createCampaign(
  input: CampaignInput,
  createdBy?: string
): Promise<Campaign> {
  const slug = await ensureUniqueSlug(input.slug || input.name)
  const now = new Date().toISOString()

  const payload = {
    ...input,
    slug,
    views: 0,
    clicks: 0,
    createdAt: now,
    updatedAt: now,
    ...(createdBy ? { createdBy } : {}),
  }

  const ref = await addDoc(collection(db, COLLECTION), payload)
  return { id: ref.id, ...payload } as Campaign
}

export async function updateCampaign(id: string, input: Partial<CampaignInput>): Promise<void> {
  const patch: Record<string, unknown> = { ...input, updatedAt: new Date().toISOString() }

  // Slug só é regravado quando muda de fato, para não gastar uma consulta à toa
  if (input.slug) {
    patch.slug = await ensureUniqueSlug(input.slug, id)
  }

  await updateDoc(doc(db, COLLECTION, id), patch)
}

export async function deleteCampaign(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

/**
 * Contadores da página pública.
 *
 * Falham em silêncio de propósito: métrica não pode derrubar a landing do
 * visitante nem travar o clique no CTA.
 */
export async function registerCampaignView(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), { views: increment(1) })
  } catch (e) {
    console.warn("[campaigns] Falha ao registrar visualização:", e)
  }
}

export async function registerCampaignClick(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), { clicks: increment(1) })
  } catch (e) {
    console.warn("[campaigns] Falha ao registrar clique:", e)
  }
}
