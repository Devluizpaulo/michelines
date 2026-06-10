export interface LeadInteraction {
  id: string
  type: 'whatsapp' | 'note' | 'status_change' | 'credit_check' | 'authorization'
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
  authorizedBy?: string
  authorizationRecordedBy?: string
  authorizationDate?: string
  approvedBy?: string
  approvalDate?: string
  interactions?: LeadInteraction[]
  archived?: boolean
}


