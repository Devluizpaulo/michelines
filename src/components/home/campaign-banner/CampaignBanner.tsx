"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LandingSettings } from "@/types/landing"
import { doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/app/firebase/config"

interface CampaignBannerProps {
  landingSettings: LandingSettings
}

const TEMPLATE_CONFIGS: Record<number, {
  containerClass: string
  tagText: string
  tagClass: string
  buttonClass: string
  defaultImage: string
  imageBorderClass: string
}> = {
  1: {
    containerClass: "from-sky-50/80 to-indigo-50/50 border-sky-100",
    tagText: "Campanha D-TAXI",
    tagClass: "bg-sky-100 text-sky-700 border-sky-200",
    buttonClass: "bg-sky-600 hover:bg-sky-500 text-white",
    defaultImage: "/images/banners/banner-1.png",
    imageBorderClass: "border-slate-200"
  },
  2: {
    containerClass: "from-amber-50/80 to-orange-50/50 border-amber-100",
    tagText: "Destaque Exclusivo",
    tagClass: "bg-amber-100 text-amber-800 border-amber-200",
    buttonClass: "bg-amber-600 hover:bg-amber-500 text-white",
    defaultImage: "/images/banners/banner-2.png",
    imageBorderClass: "border-amber-200"
  },
  3: {
    containerClass: "from-emerald-50/80 to-teal-50/50 border-emerald-100",
    tagText: "Mobilidade Híbrida Eco",
    tagClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
    defaultImage: "/images/banners/banner-3.png",
    imageBorderClass: "border-emerald-200"
  }
}

export function CampaignBanner({ landingSettings }: CampaignBannerProps) {
  if (!landingSettings.showCampaignBanner) return null

  const templateId = landingSettings.campaignTemplateId || 1
  const cfg = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS[1]

  useEffect(() => {
    if (landingSettings.showCampaignBanner) {
      updateDoc(doc(db, "landing", "settings"), {
        campaignViews: increment(1)
      }).catch((err) => console.warn("Erro ao registrar view do banner:", err))
    }
  }, [landingSettings.showCampaignBanner])

  const handleBannerClick = () => {
    updateDoc(doc(db, "landing", "settings"), {
      campaignClicks: increment(1)
    }).catch((err) => console.warn("Erro ao registrar click do banner:", err))
  }

  const imagePosition = landingSettings.campaignImagePosition || "right"
  const imageSize = landingSettings.campaignImageSize || "md"
  const imageAspectRatio = landingSettings.campaignImageAspectRatio || "video"

  const sizeWidthClasses = {
    sm: "md:w-[260px]",
    md: "md:w-[360px]",
    lg: "md:w-[460px]"
  }

  const aspectRatioClasses = {
    video: "aspect-video",
    square: "aspect-square",
    wide: "aspect-[21/9]",
    original: "aspect-auto"
  }

  const imageLeft = imagePosition === "left"

  return (
    <section className="w-full py-16 bg-transparent relative overflow-hidden select-none">
      {/* Ambient glows behind the banner */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.01] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl">
        <div className={`bg-gradient-to-r ${cfg.containerClass} border rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm relative overflow-hidden`}>
          
          {/* Text Container */}
          <div className={`flex-1 space-y-4 text-left relative z-10 ${imageLeft ? "order-2" : "order-1"}`}>
            <span className={`${cfg.tagClass} border text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider`}>
              {cfg.tagText}
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {landingSettings.campaignText || "Alugue seu Corolla Cross com Fila D-TAXI!"}
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium text-justify">
              {landingSettings.campaignSubtitle || "Fature alto no aeroporto de Congonhas. Retirada rápida em 24 horas."}
            </p>
            <div className="pt-2">
              <Link 
                href={(() => {
                  const url = landingSettings.campaignBtnUrl || "/cadastro"
                  if (url.startsWith("/cadastro")) {
                    return `${url}${url.includes("?") ? "&" : "?"}campaignId=main_banner&campaignName=${encodeURIComponent(landingSettings.campaignText || "Banner Principal")}`
                  }
                  return url
                })()}
                onClick={handleBannerClick}
              >
                <Button className={`${cfg.buttonClass} rounded-2xl font-bold px-6 h-11 transition-all shadow-sm hover:shadow`}>
                  {landingSettings.campaignBtnText || "Quero Aproveitar"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Image Container */}
          <div className={`w-full ${sizeWidthClasses[imageSize]} ${imageAspectRatio === 'original' ? '' : aspectRatioClasses[imageAspectRatio]} ${imageLeft ? "order-1" : "order-2"} relative rounded-2xl overflow-hidden shrink-0 shadow-sm border ${cfg.imageBorderClass} bg-white transition-all duration-300`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={landingSettings.campaignImageUrl || cfg.defaultImage} 
              alt={landingSettings.campaignText || "Campanha Michelines"}
              className={`w-full ${imageAspectRatio === 'original' ? 'h-auto' : 'h-full object-cover'}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
              }}
            />
          </div>

        </div>
      </div>
    </section>
  )
}
