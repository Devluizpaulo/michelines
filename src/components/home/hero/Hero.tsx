"use client"

import { useHeroSlides } from "@/hooks/useHeroSlides"
import { HeroCarousel } from "./HeroCarousel"
import { LandingSettings } from "@/types/landing"

interface HeroProps {
  landingSettings: LandingSettings
  isMobile: boolean
}

export function Hero({ landingSettings, isMobile }: HeroProps) {
  const { slides } = useHeroSlides()

  return (
    <section className="relative min-h-[90vh] md:min-h-[100vh] w-full bg-[#F8FAFC]">
      <HeroCarousel slides={slides} isMobile={isMobile} />
    </section>
  )
}
