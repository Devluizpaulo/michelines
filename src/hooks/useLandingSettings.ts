import { useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { LandingSettings } from "@/types/landing"

const DEFAULT_SETTINGS: LandingSettings = {
  heroTitle: "Mobilidade profissional urbana.",
  heroGlowText: "Sua jornada executiva.",
  liveBannerText: "Oportunidade da semana: Diárias especiais para híbridos com GNV! Cadastro rápido sem comprovação de score.",
  congonhasStatus: "Fila rápida D-TAXI liberada (média 15 min de espera)",
  showCampaignBanner: false,
  campaignText: "TAXA ZERO: Cadastre-se hoje e ganhe as primeiras 3 diárias grátis!",
  campaignTemplateId: 1,
  campaignSubtitle: "Diárias a partir de R$ 57. Retirada rápida em 24h sem burocracia de score.",
  campaignBtnText: "Quero Aproveitar",
  campaignBtnUrl: "/cadastro",
  campaignImageUrl: "",
  campaignImagePosition: "right",
  campaignImageSize: "md",
  campaignImageAspectRatio: "video",
  heroAutoplayInterval: 8,
  heroTransitionDuration: 50
}

export function useLandingSettings() {
  const [isMobile, setIsMobile] = useState(false)
  const [landingSettings, setLandingSettings] = useState<LandingSettings>(DEFAULT_SETTINGS)

  // Detecta dispositivo móvel
  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)")
    setIsMobile(media.matches)
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [])

  // Carrega configurações dinâmicas do Firestore em tempo real
  useEffect(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("landing_settings")
      if (local) {
        try {
          setLandingSettings(JSON.parse(local))
        } catch (e) {
          console.error("Erro ao parsear landing_settings do localStorage:", e)
        }
      }
    }

    const docRef = doc(db, "landing", "settings")
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          const updated: LandingSettings = {
            heroTitle: data.heroTitle || DEFAULT_SETTINGS.heroTitle,
            heroGlowText: data.heroGlowText || DEFAULT_SETTINGS.heroGlowText,
            liveBannerText: data.liveBannerText || DEFAULT_SETTINGS.liveBannerText,
            congonhasStatus: data.congonhasStatus || DEFAULT_SETTINGS.congonhasStatus,
            showCampaignBanner: !!data.showCampaignBanner,
            campaignText: data.campaignText || DEFAULT_SETTINGS.campaignText,
            campaignTemplateId: data.campaignTemplateId || DEFAULT_SETTINGS.campaignTemplateId,
            campaignSubtitle: data.campaignSubtitle || DEFAULT_SETTINGS.campaignSubtitle,
            campaignBtnText: data.campaignBtnText || DEFAULT_SETTINGS.campaignBtnText,
            campaignBtnUrl: data.campaignBtnUrl || DEFAULT_SETTINGS.campaignBtnUrl,
            campaignImageUrl: data.campaignImageUrl || DEFAULT_SETTINGS.campaignImageUrl,
            campaignImagePosition: data.campaignImagePosition || DEFAULT_SETTINGS.campaignImagePosition,
            campaignImageSize: data.campaignImageSize || DEFAULT_SETTINGS.campaignImageSize,
            campaignImageAspectRatio: data.campaignImageAspectRatio || DEFAULT_SETTINGS.campaignImageAspectRatio,
            heroAutoplayInterval: data.heroAutoplayInterval || 8,
            heroTransitionDuration: data.heroTransitionDuration || 50
          }
          setLandingSettings(updated)
          if (typeof window !== "undefined") {
            localStorage.setItem("landing_settings", JSON.stringify(updated))
          }
        }
      },
      (error) => {
        console.warn("Erro ao escutar configurações da landing page no Firestore:", error)
      }
    )

    return () => unsubscribe()
  }, [])

  return { landingSettings, isMobile }
}
