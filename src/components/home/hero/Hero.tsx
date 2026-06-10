"use client"

import { useHeroSlides } from "@/hooks/useHeroSlides"
import { HeroCarousel } from "./HeroCarousel"
import { LandingSettings } from "@/types/landing"

interface HeroProps {
  landingSettings: LandingSettings
  isMobile: boolean
}

export function Hero({ landingSettings, isMobile }: HeroProps) {
  // Pass landingSettings so the default slide respects heroTitle/heroGlowText
  const { slides } = useHeroSlides(landingSettings)

  // Calculate dynamic padding-top to accommodate the fixed header/banner
  const hasBanner = landingSettings.showCampaignBanner
  const ptClass = hasBanner 
    ? "pt-[114px] md:pt-[126px]" 
    : "pt-[76px] md:pt-[88px]"

  return (
    <section className={`relative w-full bg-transparent ${ptClass}`}>
      <HeroCarousel 
        slides={slides} 
        isMobile={isMobile} 
        autoplayInterval={landingSettings.heroAutoplayInterval || 8}
        transitionDuration={landingSettings.heroTransitionDuration || 50}
      />
    </section>
  )
}

