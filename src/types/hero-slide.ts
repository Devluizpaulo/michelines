export interface HeroSlideType {
  id?: string
  active: boolean
  order: number
  title: string
  glowTitle: string
  subtitle: string
  ctaText: string
  ctaUrl: string
  image: string
  mobileImage?: string
  video?: string
  badge?: string
  overlay?: string
  theme?: string
  showTextOverlay?: boolean
  textAlignment?: 'left' | 'center' | 'right'
  titleWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black'
  subtitleWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black'
  bgOpacity?: number
  heroHeight?: 'sm' | 'md' | 'lg' | 'fullscreen'
  imageFit?: 'cover' | 'contain'
  clickableSlide?: boolean
  destinationUrl?: string
  displayPriority?: number
  startDate?: string
  endDate?: string
  views?: number
  clicks?: number
}
