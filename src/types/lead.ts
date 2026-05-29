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
}

