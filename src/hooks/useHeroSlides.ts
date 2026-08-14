import { useState, useEffect } from "react"
import { listHeroSlides, subscribeToHeroSlides } from "@/lib/db/hero"
import { HeroSlideType } from "@/types/hero-slide"
import { LandingSettings } from "@/types/landing"

const BASE_DEFAULT_SLIDE: HeroSlideType = {
  id: "default-1",
  active: true,
  order: 0,
  title: "Mobilidade profissional urbana.",
  glowTitle: "Sua jornada executiva.",
  subtitle: "Plataforma de suporte completo, veículos de alta eficiência e total previsibilidade operacional para a sua autonomia nas ruas de São Paulo.",
  ctaText: "Iniciar Cadastro Oficial",
  ctaUrl: "/cadastro",
  image: "/images/banners/banner-1.png",
  mobileImage: "/images/banners/banner-1.png",
  video: "https://player.vimeo.com/external/435674703.sd.mp4?s=7fdb2ef485c1c045d025154cf4d75d27d75a6c11&profile_id=165&oauth2_token_id=57447761",
  badge: "Grupo Michelines — Mobilidade Premium",
  overlay: "gradient",
  theme: "navy"
}

function buildDefaultSlide(landingSettings?: Partial<LandingSettings>): HeroSlideType {
  return {
    ...BASE_DEFAULT_SLIDE,
    title: landingSettings?.heroTitle?.trim() || BASE_DEFAULT_SLIDE.title,
    glowTitle: landingSettings?.heroGlowText?.trim() || BASE_DEFAULT_SLIDE.glowTitle,
  }
}

export const DEFAULT_SLIDES: HeroSlideType[] = [BASE_DEFAULT_SLIDE]

export function useHeroSlides(landingSettings?: Partial<LandingSettings>) {
  const [slides, setSlides] = useState<HeroSlideType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("hero_slides")
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed && parsed.length > 0) {
            setSlides(parsed)
            setLoading(false)
          }
        } catch (e) {
          console.error("Erro ao carregar slides do cache local", e)
        }
      }
    }

    function processSlides(rawList: HeroSlideType[]) {
      const activeList = rawList.filter((s) => s.active)

      const now = new Date()
      const visibleList = activeList.filter((slide) => {
        const startValid = !slide.startDate || new Date(slide.startDate) <= now
        const endValid = !slide.endDate || new Date(slide.endDate) >= now
        return startValid && endValid
      })

      visibleList.sort((a, b) => {
        const priorityA = a.displayPriority ?? 0
        const priorityB = b.displayPriority ?? 0
        if (priorityA !== priorityB) return priorityB - priorityA
        return (a.order ?? 0) - (b.order ?? 0)
      })

      if (visibleList.length > 0) {
        setSlides(visibleList)
        if (typeof window !== "undefined") {
          localStorage.setItem("hero_slides", JSON.stringify(visibleList))
        }
      } else {
        const fallback = [buildDefaultSlide(landingSettings)]
        setSlides(fallback)
        if (typeof window !== "undefined") {
          localStorage.setItem("hero_slides", JSON.stringify(fallback))
        }
      }
      setLoading(false)
    }

    listHeroSlides()
      .then(processSlides)
      .catch((err) => {
        console.warn("Erro ao carregar slides do Supabase:", err)
        setLoading(false)
      })

    const unsub = subscribeToHeroSlides((updated) => {
      processSlides(updated)
    })

    return () => unsub()
  }, [landingSettings?.heroTitle, landingSettings?.heroGlowText])

  const defaultSlide = buildDefaultSlide(landingSettings)
  return { slides: slides.length > 0 ? slides : [defaultSlide], loading }
}
