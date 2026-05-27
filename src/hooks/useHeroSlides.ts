import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
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

    const fetchSlides = async () => {
      try {
        const q = query(
          collection(db, "hero_slides"),
          where("active", "==", true),
          orderBy("order", "asc")
        )
        const snap = await getDocs(q)
        const list: HeroSlideType[] = []
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as HeroSlideType)
        })

        if (list.length > 0) {
          setSlides(list)
          localStorage.setItem("hero_slides", JSON.stringify(list))
        } else {
          // No Firestore slides — use default with landingSettings override
          setSlides([buildDefaultSlide(landingSettings)])
        }
      } catch (e) {
        console.warn("Erro ao buscar slides do Firestore, usando fallback local:", e)
        setSlides((prev) =>
          prev.length > 0 ? prev : [buildDefaultSlide(landingSettings)]
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const defaultSlide = buildDefaultSlide(landingSettings)
  return { slides: slides.length > 0 ? slides : [defaultSlide], loading }
}
