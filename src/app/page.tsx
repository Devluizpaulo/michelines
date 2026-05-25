"use client"

import { useLandingSettings } from "@/hooks/useLandingSettings"
import { Navbar } from "@/components/home/navbar/Navbar"
import { Hero } from "@/components/home/hero/Hero"
import { CampaignBanner } from "@/components/home/campaign-banner/CampaignBanner"
import { Simulator } from "@/components/home/simulator/Simulator"
import { Timeline } from "@/components/home/timeline/Timeline"
import { Showroom } from "@/components/home/showroom/Showroom"
import { DiferenciaisInstitucionais } from "@/components/home/diferenciais/DiferenciaisInstitucionais"
import { Advantages } from "@/components/home/advantages/Advantages"
import { MapSection } from "@/components/home/maps/MapSection"
import { Testimonials } from "@/components/home/testimonials/Testimonials"
import { FAQ } from "@/components/home/faq/FAQ"
import { Footer } from "@/components/home/footer/Footer"

export default function Home() {
  const { landingSettings, isMobile } = useLandingSettings()

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-sky-600 selection:text-white overflow-x-hidden">
      <Navbar landingSettings={landingSettings} />
      
      <main className="flex-1">
        <Hero landingSettings={landingSettings} isMobile={isMobile} />
        <CampaignBanner landingSettings={landingSettings} />
        <Simulator />
        <Timeline />
        <Showroom />
        <DiferenciaisInstitucionais />
        <Advantages />
        <MapSection />
        <Testimonials />
        <FAQ />
      </main>

      <Footer />
    </div>
  )
}
