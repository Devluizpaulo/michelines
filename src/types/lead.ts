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
}
