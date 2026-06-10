import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/app/firebase/config"
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
  image: "/images/banners/1.jpg",
  mobileImage: "/images/banners/1.jpg",
  video: "https://player.vimeo.com/external/435674703.sd.mp4?s=7fdb2ef485c1c045d025154cf4d75d27d75a6c11&profile_id=165&oauth2_token_id=57447761",
  badge: "Grupo Michelines — Mobilidade Premium",
  overlay: "gradient",
  theme: "navy"
}

/**
 * Returns the default slide, overriding title and glowTitle from
 * landingSettings when provided (used as fallback when no Firestore slides exist).
 */
function buildDefaultSlide(landingSettings?: Partial<LandingSettings>): HeroSlideType {
  return {
    ...BASE_DEFAULT_SLIDE,
    title: landingSettings?.heroTitle?.trim() || BASE_DEFAULT_SLIDE.title,
    glowTitle: landingSettings?.heroGlowText?.trim() || BASE_DEFAULT_SLIDE.glowTitle,
  }
}

// Keep exporting DEFAULT_SLIDES for backwards compatibility
export const DEFAULT_SLIDES: HeroSlideType[] = [BASE_DEFAULT_SLIDE]

export function useHeroSlides(landingSettings?: Partial<LandingSettings>) {
  const [slides, setSlides] = useState<HeroSlideType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to load from localStorage cache first (fast initial render)
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

    const q = query(
      collection(db, "hero_slides"),
      orderBy("order", "asc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list: HeroSlideType[] = []
        snap.forEach((doc) => {
          const data = doc.data() as HeroSlideType
          if (data.active) {
            list.push({ id: doc.id, ...data })
          }
        })

        // Filtro de vigência de datas (Agendamento)
        const now = new Date()
        const visibleList = list.filter((slide) => {
          const startValid = !slide.startDate || new Date(slide.startDate) <= now
          const endValid = !slide.endDate || new Date(slide.endDate) >= now
          return startValid && endValid
        })

        // Ordenação: prioridade de exibição desc (maior primeiro) e ordem asc
        visibleList.sort((a, b) => {
          const priorityA = a.displayPriority ?? 0
          const priorityB = b.displayPriority ?? 0
          if (priorityA !== priorityB) {
            return priorityB - priorityA
          }
          return (a.order ?? 0) - (b.order ?? 0)
        })

        if (visibleList.length > 0) {
          setSlides(visibleList)
          if (typeof window !== "undefined") {
            localStorage.setItem("hero_slides", JSON.stringify(visibleList))
          }
        } else {
          // No Firestore slides — use default with landingSettings override
          const fallback = [buildDefaultSlide(landingSettings)]
          setSlides(fallback)
          if (typeof window !== "undefined") {
            localStorage.setItem("hero_slides", JSON.stringify(fallback))
          }
        }
        setLoading(false)
      },
      (error) => {
        console.warn("Erro ao carregar slides do Firestore em tempo real:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landingSettings?.heroTitle, landingSettings?.heroGlowText])

  const defaultSlide = buildDefaultSlide(landingSettings)
  return { slides: slides.length > 0 ? slides : [defaultSlide], loading }
}
