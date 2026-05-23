export interface Vehicle {
  id?: string
  name: string
  slug?: string
  category?: "dtaxi" | "hibridos" | "sedans" | "hatches" | string
  brand?: string
  year?: string
  transmission?: "automatic" | "manual"
  fuelType?: "flex" | "gasoline" | "ethanol" | "hybrid" | "electric"
  isHybrid?: boolean
  hasGNV?: boolean
  isDTaxiApproved?: boolean
  shortDescription?: string
  fullDescription?: string
  positivePoints?: string[]
  highlights?: string[]
  monthlyPrice?: number
  dailyPrice?: number
  status?: "active" | "inactive"
  available?: boolean
  featured?: boolean
  showroomFeatured?: boolean
  showroomOrder?: number
  leadCount?: number
  thumbnail?: string
  images?: string[]
  specs?: string[]
  tags?: string[]
  price?: string
  tag?: string
  glow?: string
  tagColor?: string
  image?: string
  seoTitle?: string
  seoDescription?: string
  createdAt?: any
  updatedAt?: any
}

export interface VehicleCategory {
  id: string
  name: string
  description: string
  vehicles: Vehicle[]
}
