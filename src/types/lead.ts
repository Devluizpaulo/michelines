/** Categorias de documento que podem ser anexados à ficha do lead. */
export type DocCategory =
  | "cnh"
  | "condutax"
  | "residencia"
  | "foto"
  | "consulta_cpf"
  | "contrato"
  | "outros"

/**
 * Registro de uma consulta de CPF / análise de crédito.
 *
 * Guardar apenas o status ("aprovada"/"reprovada") não sustenta auditoria: é
 * preciso saber quem consultou, quando, qual o resultado do birô e qual
 * documento embasou a decisão.
 */
export interface CreditCheckRecord {
  /** Resultado da consulta */
  result: "approved" | "rejected" | "restricted" | "inconclusive"
  /** Quem executou a consulta (displayName do operador) */
  checkedBy: string
  /** ISO date da consulta */
  checkedAt: string
  /** Birô utilizado (Serasa, SPC, Boa Vista...) */
  bureau?: string
  /** Pontuação devolvida pelo birô, quando houver */
  bureauScore?: number
  /** Restrições encontradas (protestos, negativações) */
  restrictions?: string
  /** Observação livre do analista */
  notes?: string
  /** Comprovante da consulta anexado junto à decisão */
  documentUrl?: string
  documentPath?: string
  documentName?: string
}

export interface LeadInteraction {
  id: string
  type:
    | 'whatsapp'
    | 'note'
    | 'status_change'
    | 'credit_check'
    | 'authorization'
    | 'document_upload'
    | 'appointment'
    | 'decision'
    | 'archive'
    | 'score_update'
  agentName: string
  content: string
  createdAt: string
}

export interface Lead {
  id: string
  fullName: string
  phone: string
  source: string
  vehicleInterest: string
  status: 'new' | 'contacted' | 'negotiating' | 'scheduled' | 'converted' | 'lost'
  notes?: string
  assignedTo?: string
  createdAt: any
  updatedAt?: any
  contacted: boolean
  whatsappSent: boolean
  interestDTaxi?: boolean
  interestAirport?: boolean
  interestExecutive?: boolean
  interestHybrid?: boolean
  interestGNV?: boolean
  leadReason?: string
  operationInterest?: string
  preferredContactTime?: string
  cityNeighborhood?: string
  hasCnhEar?: boolean
  utm?: {
    source?: string
    medium?: string
    campaign?: string
  }
  // New driver registration fields
  email?: string
  whatsapp?: string
  rg?: string
  cpf?: string
  cep?: string
  address?: string
  addressStreet?: string
  addressNumber?: string
  addressComplement?: string
  addressNeighborhood?: string
  addressCity?: string
  addressState?: string
  addressNotes?: string
  messagePhone1?: string
  messageName1?: string
  messagePhone2?: string
  messageName2?: string
  isTaxiDriver?: boolean
  condutaxNumber?: string
  hasLicense?: boolean
  licenseDetails?: string
  cnhNumber?: string
  cnhCategory?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  fileUrls?: Record<string, string>
  
  // New driver registration evaluation fields
  registrationStatus?: 'complete' | 'incomplete' | 'pending_contact'
  needsMoreData?: boolean
  contactedForData?: boolean
  creditAnalysisStatus?: 'pending' | 'approved' | 'rejected' | 'needs_authorization'
  /** Última consulta de CPF registrada (ver histórico completo em interactions) */
  creditCheck?: CreditCheckRecord
  authorizedBy?: string
  authorizationRecordedBy?: string
  authorizationDate?: string
  approvedBy?: string
  approvalDate?: string
  interactions?: LeadInteraction[]
  archived?: boolean

  // Smart Funnel fields
  protocol?: string
  situation?: string
  hasCondutax?: string
  hasOwnAlvara?: string
  workedInFleet?: string
  fleetName?: string
  fleetDuration?: string
  experienceYears?: string
  hasCnh?: string
  hasEar?: string
  condutaxProcess?: string
  needsHelpWith?: string[]
  passengerExperience?: string
  paymentPreference?: string
  contractType?: string
  score?: number
  attachedDocs?: {
    name: string
    url: string
    path?: string
    uploadedAt: string
    category?: DocCategory
    /** Quem anexou — necessário para auditar documentos de crédito */
    uploadedBy?: string
  }[]

  // Calculated score (cached)
  leadScore?: number

  // Marketing Intelligence Campaign Links
  campaignId?: string
  campaignName?: string
}


