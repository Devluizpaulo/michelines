import { supabase } from "@/lib/supabase"
import type { LeadRow, LeadInteractionRow, LeadDocumentRow, DocCategoryDb } from "@/types/database"
import type { Lead, LeadInteraction, CreditCheckRecord, DocCategory } from "@/types/lead"

/**
 * Repositório de leads.
 *
 * Toda tradução entre o banco (snake_case) e a aplicação (camelCase) mora aqui.
 * Nenhum componente deve montar query própria: assim uma mudança de coluna se
 * resolve num arquivo só.
 *
 * Diferença importante em relação ao Firestore: `interactions` e `attachedDocs`
 * eram arrays dentro do documento e agora são tabelas. Ler um lead "completo"
 * significa juntar as três — por isso `fetchLead` existe separado de `listLeads`,
 * que traz só o essencial para o board.
 */

// ─── Tradução ─────────────────────────────────────────────────────────────────

export function rowToLead(
  row: LeadRow,
  interactions: LeadInteractionRow[] = [],
  documents: LeadDocumentRow[] = []
): Lead {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    whatsapp: row.whatsapp ?? undefined,
    email: row.email ?? undefined,
    cpf: row.cpf ?? undefined,
    rg: row.rg ?? undefined,
    protocol: row.protocol ?? undefined,

    cep: row.cep ?? undefined,
    address: row.address ?? undefined,
    addressStreet: row.address_street ?? undefined,
    addressNumber: row.address_number ?? undefined,
    addressComplement: row.address_complement ?? undefined,
    addressNeighborhood: row.address_neighborhood ?? undefined,
    addressCity: row.address_city ?? undefined,
    addressState: row.address_state ?? undefined,
    addressNotes: row.address_notes ?? undefined,

    source: row.source,
    vehicleInterest: row.vehicle_interest ?? "",
    operationInterest: row.operation_interest ?? undefined,
    situation: row.situation ?? undefined,
    campaignId: row.campaign_id ?? undefined,
    campaignName: row.campaign_name ?? undefined,
    utm: (row.utm as Lead["utm"]) ?? undefined,

    status: row.status,
    contacted: row.contacted,
    whatsappSent: row.whatsapp_sent,
    archived: row.archived,
    assignedTo: row.assigned_to ?? undefined,
    notes: row.notes ?? undefined,

    hasCondutax: row.has_condutax ?? undefined,
    condutaxNumber: row.condutax_number ?? undefined,
    hasOwnAlvara: row.has_own_alvara ?? undefined,
    workedInFleet: row.worked_in_fleet ?? undefined,
    fleetName: row.fleet_name ?? undefined,
    fleetDuration: row.fleet_duration ?? undefined,
    experienceYears: row.experience_years ?? undefined,
    hasCnh: row.has_cnh ?? undefined,
    cnhNumber: row.cnh_number ?? undefined,
    cnhCategory: row.cnh_category ?? undefined,
    hasEar: row.has_ear ?? undefined,
    condutaxProcess: row.condutax_process ?? undefined,
    passengerExperience: row.passenger_experience ?? undefined,
    needsHelpWith: row.needs_help_with ?? [],
    preferredContactTime: row.preferred_contact_time ?? undefined,
    interestDTaxi: row.interest_dtaxi,
    interestHybrid: row.interest_hybrid,
    interestGNV: row.interest_gnv,
    interestAirport: row.interest_airport,
    interestExecutive: row.interest_executive,
    isTaxiDriver: row.is_taxi_driver,
    hasCnhEar: row.has_cnh_ear,
    hasLicense: row.has_license,
    licenseDetails: row.license_details ?? undefined,
    messageName1: row.message_name_1 ?? undefined,
    messagePhone1: row.message_phone_1 ?? undefined,
    messageName2: row.message_name_2 ?? undefined,
    messagePhone2: row.message_phone_2 ?? undefined,
    leadReason: row.lead_reason ?? undefined,
    cityNeighborhood: row.city_neighborhood ?? undefined,
    score: row.score ?? undefined,
    leadScore: row.lead_score ?? undefined,
    fileUrls: (row.file_urls as Record<string, string>) ?? undefined,
    paymentPreference: row.payment_preference ?? undefined,
    contractType: row.contract_type ?? undefined,

    registrationStatus: row.registration_status ?? undefined,
    needsMoreData: row.needs_more_data,
    contactedForData: row.contacted_for_data,
    creditAnalysisStatus: row.credit_analysis_status,
    creditCheck: (row.credit_check as CreditCheckRecord | null) ?? undefined,
    approvalStatus: row.approval_status,
    approvedBy: row.approved_by ?? undefined,
    approvalDate: row.approval_date ?? undefined,
    authorizedBy: row.authorized_by ?? undefined,
    authorizationDate: row.authorization_date ?? undefined,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    interactions: interactions.map((i) => ({
      id: i.id,
      type: i.type,
      agentName: i.agent_name,
      content: i.content,
      createdAt: i.created_at,
    })),

    attachedDocs: documents.map((d) => ({
      name: d.name,
      url: d.url,
      path: d.storage_path ?? undefined,
      uploadedAt: d.created_at,
      category: d.category as DocCategory,
      uploadedBy: d.uploaded_by ?? undefined,
    })),
  }
}

/**
 * Converte um patch da aplicação em colunas do banco.
 * Só inclui chaves presentes — assim um update parcial não sobrescreve o resto.
 */
export function leadToRow(lead: Partial<Lead>): Partial<LeadRow> {
  const map: Array<[keyof Lead, keyof LeadRow]> = [
    ["fullName", "full_name"], ["phone", "phone"], ["whatsapp", "whatsapp"],
    ["email", "email"], ["cpf", "cpf"], ["rg", "rg"], ["protocol", "protocol"],
    ["cep", "cep"], ["address", "address"], ["addressStreet", "address_street"],
    ["addressNumber", "address_number"], ["addressComplement", "address_complement"],
    ["addressNeighborhood", "address_neighborhood"], ["addressCity", "address_city"],
    ["addressState", "address_state"], ["addressNotes", "address_notes"],
    ["source", "source"], ["vehicleInterest", "vehicle_interest"],
    ["operationInterest", "operation_interest"], ["situation", "situation"],
    ["campaignId", "campaign_id"], ["campaignName", "campaign_name"], ["utm", "utm"],
    ["status", "status"], ["contacted", "contacted"], ["whatsappSent", "whatsapp_sent"],
    ["archived", "archived"], ["assignedTo", "assigned_to"], ["notes", "notes"],
    ["hasCondutax", "has_condutax"], ["condutaxNumber", "condutax_number"],
    ["hasOwnAlvara", "has_own_alvara"], ["workedInFleet", "worked_in_fleet"],
    ["fleetName", "fleet_name"], ["fleetDuration", "fleet_duration"],
    ["experienceYears", "experience_years"], ["hasCnh", "has_cnh"],
    ["cnhNumber", "cnh_number"], ["cnhCategory", "cnh_category"], ["hasEar", "has_ear"],
    ["condutaxProcess", "condutax_process"], ["passengerExperience", "passenger_experience"],
    ["needsHelpWith", "needs_help_with"], ["preferredContactTime", "preferred_contact_time"],
    ["interestDTaxi", "interest_dtaxi"], ["interestHybrid", "interest_hybrid"],
    ["interestGNV", "interest_gnv"], ["interestAirport", "interest_airport"],
    ["interestExecutive", "interest_executive"], ["isTaxiDriver", "is_taxi_driver"],
    ["hasCnhEar", "has_cnh_ear"], ["hasLicense", "has_license"],
    ["licenseDetails", "license_details"], ["messageName1", "message_name_1"],
    ["messagePhone1", "message_phone_1"], ["messageName2", "message_name_2"],
    ["messagePhone2", "message_phone_2"], ["leadReason", "lead_reason"],
    ["cityNeighborhood", "city_neighborhood"], ["score", "score"],
    ["leadScore", "lead_score"], ["fileUrls", "file_urls"],
    ["paymentPreference", "payment_preference"], ["contractType", "contract_type"],
    ["registrationStatus", "registration_status"], ["needsMoreData", "needs_more_data"],
    ["contactedForData", "contacted_for_data"],
    ["creditAnalysisStatus", "credit_analysis_status"], ["creditCheck", "credit_check"],
    ["approvalStatus", "approval_status"], ["approvedBy", "approved_by"],
    ["approvalDate", "approval_date"], ["authorizedBy", "authorized_by"],
    ["authorizationDate", "authorization_date"],
  ]

  const row: Record<string, unknown> = {}
  for (const [appKey, dbKey] of map) {
    if (appKey in lead) row[dbKey] = lead[appKey] ?? null
  }
  return row as Partial<LeadRow>
}

// ─── Leitura ──────────────────────────────────────────────────────────────────

/** Lista para o board/dashboard. Não traz interações nem anexos (peso à toa). */
export async function listLeads({ includeArchived = false } = {}): Promise<Lead[]> {
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false })
  if (!includeArchived) query = query.eq("archived", false)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((row) => rowToLead(row as LeadRow))
}

/** Lead completo, com histórico e anexos — usado ao abrir a ficha. */
export async function fetchLead(id: string): Promise<Lead | null> {
  const [leadRes, interactionsRes, docsRes] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    supabase.from("lead_interactions").select("*").eq("lead_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("lead_documents").select("*").eq("lead_id", id)
      .order("created_at", { ascending: true }),
  ])

  if (leadRes.error) throw leadRes.error
  if (!leadRes.data) return null

  return rowToLead(
    leadRes.data as LeadRow,
    (interactionsRes.data ?? []) as LeadInteractionRow[],
    (docsRes.data ?? []) as LeadDocumentRow[]
  )
}

// ─── Escrita ──────────────────────────────────────────────────────────────────

/**
 * Criação pelo formulário público (permitida a visitante anônimo pelo RLS).
 *
 * `fullName` e `phone` são exigidos no tipo porque são NOT NULL no banco: sem
 * isso o erro só apareceria em produção, na forma de insert rejeitado.
 */
export async function createLead(
  lead: Partial<Lead> & Pick<Lead, "fullName" | "phone">
): Promise<void> {
  const payload = {
    ...leadToRow(lead),
    full_name: lead.fullName,
    phone: lead.phone,
  }

  // Sem `.select()` de propósito: ele adiciona RETURNING à query, e o Postgres
  // avalia a policy de LEITURA na linha recém-criada. O visitante anônimo do
  // formulário público pode inserir, mas não pode ler leads — e nem deve, senão
  // a base inteira ficaria exposta. Com o retorno ligado, o cadastro falhava com
  // "new row violates row-level security policy".
  const { error } = await supabase.from("leads").insert(payload)
  if (error) throw error
}

/**
 * Criação a partir do painel, por usuário autenticado.
 *
 * Aqui o `.select()` é seguro — o admin tem policy de leitura em leads — e o
 * retorno é necessário para inserir o card no funil sem recarregar a lista.
 */
export async function createLeadAsAdmin(
  lead: Partial<Lead> & Pick<Lead, "fullName" | "phone">
): Promise<Lead> {
  const payload = {
    ...leadToRow(lead),
    full_name: lead.fullName,
    phone: lead.phone,
  }
  const { data, error } = await supabase.from("leads").insert(payload).select().single()
  if (error) throw error
  return rowToLead(data as LeadRow)
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<void> {
  const { error } = await supabase.from("leads").update(leadToRow(patch)).eq("id", id)
  if (error) throw error
}

export async function deleteLead(id: string): Promise<void> {
  // interactions e documents caem junto pelo `on delete cascade`
  const { error } = await supabase.from("leads").delete().eq("id", id)
  if (error) throw error
}

// ─── Histórico ────────────────────────────────────────────────────────────────

export async function addInteraction(
  leadId: string,
  interaction: Omit<LeadInteraction, "id" | "createdAt">
): Promise<LeadInteraction> {
  const { data, error } = await supabase
    .from("lead_interactions")
    .insert({
      lead_id: leadId,
      type: interaction.type,
      agent_name: interaction.agentName,
      content: interaction.content,
    })
    .select()
    .single()

  if (error) throw error
  const row = data as LeadInteractionRow
  return {
    id: row.id,
    type: row.type,
    agentName: row.agent_name,
    content: row.content,
    createdAt: row.created_at,
  }
}

// ─── Anexos ───────────────────────────────────────────────────────────────────

export async function addDocument(
  leadId: string,
  doc: { name: string; url: string; path?: string; category?: DocCategory; uploadedBy?: string }
): Promise<void> {
  const { error } = await supabase.from("lead_documents").insert({
    lead_id: leadId,
    name: doc.name,
    url: doc.url,
    storage_path: doc.path ?? null,
    category: (doc.category ?? "outros") as DocCategoryDb,
    uploaded_by: doc.uploadedBy ?? null,
  })
  if (error) throw error
}

export async function deleteDocumentByUrl(leadId: string, url: string): Promise<void> {
  const { error } = await supabase
    .from("lead_documents")
    .delete()
    .eq("lead_id", leadId)
    .eq("url", url)
  if (error) throw error
}

// ─── Tempo real ───────────────────────────────────────────────────────────────

/**
 * Avisa quando um lead novo entra — substitui o `onSnapshot` do Firestore.
 * Devolve a função de cancelamento.
 */
export function subscribeToNewLeads(onInsert: (lead: Lead) => void): () => void {
  const channel = supabase
    .channel("leads-novos")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "leads" },
      (payload) => onInsert(rowToLead(payload.new as LeadRow))
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
