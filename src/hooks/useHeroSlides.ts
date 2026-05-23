import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { HeroSlideType } from "@/types/hero-slide"

export const DEFAULT_SLIDES: HeroSlideType[] = [
  {
    id: "default-1",
    active: true,
    order: 0,
    title: "Ganhe mais. Trabalhe com liberdade.",
    glowTitle: "Dirija com propósito.",
    subtitle: "Chega de pagar taxas absurdas para aplicativos convencionais e ficar refém de algoritmos. No táxi, você tem corredor exclusivo de ônibus, acesso garantido ao aeroporto de Congonhas e fica com 100% da sua corrida.",
    ctaText: "Quero Faturar Agora",
    ctaUrl: "/cadastro",
    image: "/images/banners/1.jpg",
    mobileImage: "/images/banners/1.jpg",
    video: "https://player.vimeo.com/external/435674703.sd.mp4?s=7fdb2ef485c1c045d025154cf4d75d27d75a6c11&profile_id=165&oauth2_token_id=57447761",
    badge: "45 Anos de Tradição e Confiança em São Paulo",
    overlay: "gradient",
    theme: "navy"
  }
]

export function useHeroSlides() {
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
          setSlides(DEFAULT_SLIDES)
        }
      } catch (e) {
        console.warn("Erro ao buscar slides do Firestore, usando fallback local:", e)
        setSlides((prev) => (prev.length > 0 ? prev : DEFAULT_SLIDES))
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  return { slides: slides.length > 0 ? slides : DEFAULT_SLIDES, loading }
}
