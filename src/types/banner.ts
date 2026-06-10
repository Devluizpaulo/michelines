export interface CampaignBannerSettings {
  showCampaignBanner: boolean
  campaignText: string
  campaignTemplateId: number
  campaignSubtitle: string
  campaignBtnText: string
  campaignBtnUrl: string
  campaignImageUrl?: string
  campaignImagePosition?: 'left' | 'right'
  campaignImageSize?: 'sm' | 'md' | 'lg'
  campaignImageAspectRatio?: 'square' | 'video' | 'wide' | 'original'
}

