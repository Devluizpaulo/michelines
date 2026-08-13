/**
 * Tipos das tabelas do Supabase (Postgres).
 *
 * Escritos à mão a partir de supabase/migrations/*.sql. Se o schema mudar,
 * atualize aqui junto — é este arquivo que dá tipagem ao cliente e impede que um
 * `select` peça coluna inexistente.
 *
 * Convenção: o banco é snake_case, a aplicação é camelCase. A tradução acontece
 * nos repositórios em src/lib/db/, nunca espalhada pelos componentes.
 */

export type UserRole = "super_admin" | "supervisor" | "gerente" | "vendedor" | "marketing"
export type LeadStatus = "new" | "contacted" | "negotiating" | "scheduled" | "converted" | "lost"
export type ApprovalStatus = "pending" | "approved" | "rejected"
export type CreditStatus = "pending" | "approved" | "rejected" | "needs_authorization"
export type RegistrationStatus = "complete" | "incomplete" | "pending_contact"
export type CampaignStatusDb = "draft" | "active" | "paused" | "ended"
export type AppointmentTypeDb = "visit" | "pickup" | "docs" | "callback"
export type DocCategoryDb =
  | "cnh" | "condutax" | "residencia" | "foto" | "consulta_cpf" | "contrato" | "outros"
export type InteractionTypeDb =
  | "whatsapp" | "note" | "status_change" | "credit_check" | "authorization"
  | "document_upload" | "appointment" | "decision" | "archive" | "score_update"

export type AdminUserRow = {
  id: string
  email: string
  display_name: string
  phone: string | null
  role: UserRole
  active: boolean
  avatar_url: string | null
  created_by: string | null
  last_login: string | null
  created_at: string
  updated_at: string
}

export type LeadRow = {
  id: string

  full_name: string
  phone: string
  whatsapp: string | null
  email: string | null
  cpf: string | null
  rg: string | null
  protocol: string | null

  cep: string | null
  address: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_notes: string | null

  source: string
  vehicle_interest: string | null
  operation_interest: string | null
  situation: string | null
  campaign_id: string | null
  campaign_name: string | null
  utm: Record<string, unknown>

  status: LeadStatus
  contacted: boolean
  whatsapp_sent: boolean
  archived: boolean
  assigned_to: string | null
  notes: string | null

  has_condutax: string | null
  condutax_number: string | null
  has_own_alvara: string | null
  worked_in_fleet: string | null
  fleet_name: string | null
  fleet_duration: string | null
  experience_years: string | null
  has_cnh: string | null
  cnh_number: string | null
  cnh_category: string | null
  has_ear: string | null
  condutax_process: string | null
  passenger_experience: string | null
  needs_help_with: string[]
  preferred_contact_time: string | null
  interest_dtaxi: boolean
  interest_hybrid: boolean
  interest_gnv: boolean
  interest_airport: boolean
  interest_executive: boolean
  is_taxi_driver: boolean
  has_cnh_ear: boolean
  has_license: boolean
  license_details: string | null
  message_name_1: string | null
  message_phone_1: string | null
  message_name_2: string | null
  message_phone_2: string | null
  lead_reason: string | null
  city_neighborhood: string | null
  score: number | null
  lead_score: number | null
  file_urls: Record<string, string>
  payment_preference: string | null
  contract_type: string | null

  registration_status: RegistrationStatus | null
  needs_more_data: boolean
  contacted_for_data: boolean
  credit_analysis_status: CreditStatus
  credit_check: Record<string, unknown> | null
  approval_status: ApprovalStatus
  approved_by: string | null
  approval_date: string | null
  authorized_by: string | null
  authorization_date: string | null

  created_at: string
  updated_at: string
}

export type LeadInteractionRow = {
  id: string
  lead_id: string
  type: InteractionTypeDb
  agent_name: string
  content: string
  created_at: string
}

export type LeadDocumentRow = {
  id: string
  lead_id: string
  name: string
  url: string
  storage_path: string | null
  category: DocCategoryDb
  uploaded_by: string | null
  created_at: string
}

export type CampaignRow = {
  id: string
  slug: string
  name: string
  status: CampaignStatusDb
  headline: string
  subheadline: string | null
  description: string | null
  image_url: string | null
  highlights: string[]
  cta_text: string
  vehicle_interest: string | null
  theme: string
  start_date: string | null
  end_date: string | null
  views: number
  clicks: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export type VehicleRow = {
  id: string
  name: string
  slug: string | null
  category: string | null
  brand: string | null
  year: string | null
  transmission: string | null
  fuel_type: string | null
  is_hybrid: boolean
  has_gnv: boolean
  is_dtaxi_approved: boolean
  is_accessible: boolean
  is_atende_approved: boolean
  has_radio_association: boolean
  is_dtp_approved: boolean
  has_dtp_course_support: boolean
  short_description: string | null
  full_description: string | null
  positive_points: string[]
  highlights: string[]
  specs: string[]
  tags: string[]
  monthly_price: number | null
  weekly_price: number | null
  daily_price: number | null
  status: string
  available: boolean
  featured: boolean
  showroom_featured: boolean
  showroom_order: number | null
  lead_count: number
  views_count: number
  clicks_count: number
  thumbnail: string | null
  images: string[]
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export type VehiclePricingRow = {
  id: string
  vehicle_id: string
  daily_rate: number
  weekly_rate: number
  monthly_rate: number
  weekend_exempt: boolean
  accepted_payments: string[]
  active: boolean
  promo_campaign: string | null
  created_at: string
  updated_at: string
}

export type HeroSlideRow = {
  id: string
  order: number
  active: boolean
  title: string | null
  glow_title: string | null
  subtitle: string | null
  cta_text: string | null
  cta_url: string | null
  image: string | null
  mobile_image: string | null
  video: string | null
  badge: string | null
  overlay: string | null
  theme: string | null
  /** Campos visuais de forma livre (alinhamento, opacidade, altura...) */
  config: Record<string, unknown>
  views: number
  clicks: number
  created_at: string
  updated_at: string
}

export type AppSettingRow = {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export type AppointmentRow = {
  id: string
  lead_id: string | null
  lead_name: string
  lead_phone: string | null
  type: AppointmentTypeDb
  date: string
  notes: string | null
  completed: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type TestimonialRow = {
  id: string
  name: string
  time: string | null
  testimony: string
  rating: number
  approved: boolean
  created_at: string
  updated_at: string
}

export type DriverRow = {
  id: string
  full_name: string | null
  phone: string | null
  whatsapp: string | null
  cpf: string | null
  car_model: string | null
  city_neighborhood: string | null
  status: string
  created_at: string
}

/**
 * Mapa consumido pelo cliente tipado do Supabase.
 * `Insert` e `Update` derivam de `Row` porque quase toda coluna tem default.
 */
export interface Database {
  public: {
    Tables: {
      admin_users:        TableDef<AdminUserRow, "id" | "email">
      leads:              TableDef<LeadRow, "full_name" | "phone">
      lead_interactions:  TableDef<LeadInteractionRow, "lead_id" | "type" | "agent_name" | "content">
      lead_documents:     TableDef<LeadDocumentRow, "lead_id" | "name" | "url">
      campaigns:          TableDef<CampaignRow, "slug" | "name" | "headline">
      vehicles:           TableDef<VehicleRow, "name">
      vehicle_pricing:    TableDef<VehiclePricingRow, "vehicle_id">
      hero_slides:        TableDef<HeroSlideRow, never>
      app_settings:       TableDef<AppSettingRow, "key">
      appointments:       TableDef<AppointmentRow, "lead_name" | "date">
      testimonials:       TableDef<TestimonialRow, "name" | "testimony">
      drivers:            TableDef<DriverRow, never>
    }
    Views: { [_ in never]: never }
    Functions: {
      registrar_metrica_campanha: {
        Args: { p_campaign_id: string; p_metrica: "view" | "click" }
        Returns: void
      }
      e_admin: { Args: Record<string, never>; Returns: boolean }
      e_super_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      user_role: UserRole
      lead_status: LeadStatus
      approval_status: ApprovalStatus
      credit_status: CreditStatus
      registration_status: RegistrationStatus
      campaign_status: CampaignStatusDb
      appointment_type: AppointmentTypeDb
      doc_category: DocCategoryDb
      interaction_type: InteractionTypeDb
    }
    CompositeTypes: { [_ in never]: never }
  }
}

/** Row/Insert/Update a partir de uma linha e das colunas realmente obrigatórias. */
type TableDef<Row, Required extends keyof Row> = {
  Row: Row
  Insert: Pick<Row, Required extends never ? never : Required> & Partial<Row>
  Update: Partial<Row>
  Relationships: []
}
