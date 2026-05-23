import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { LandingSettings } from "@/types/landing"

const DEFAULT_SETTINGS: LandingSettings = {
  heroTitle: "Ganhe mais. Trabalhe com liberdade.",
  heroGlowText: "Dirija com propósito.",
  liveBannerText: "Oportunidade da semana: Diárias especiais para híbridos com GNV! Cadastro rápido sem comprovação de score.",
  congonhasStatus: "Fila rápida D-TAXI liberada (média 15 min de espera)",
  showCampaignBanner: false,
  campaignText: "TAXA ZERO: Cadastre-se hoje e ganhe as primeiras 3 diárias grátis!",
  campaignTemplateId: 1,
  campaignSubtitle: "Diárias a partir de R$ 57. Retirada rápida em 24h sem burocracia de score.",
  campaignBtnText: "Quero Aproveitar",
  campaignBtnUrl: "/cadastro"
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

  // Carrega configurações dinâmicas do Firestore com fallback para LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("landing_settings")
      if (local) {
        try {
          setLandingSettings(JSON.parse(local))
        } catch (e) {
          console.error(e)
        }
      }
    }

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "landing", "settings")
        const docSnap = await getDoc(docRef)
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
            campaignBtnUrl: data.campaignBtnUrl || DEFAULT_SETTINGS.campaignBtnUrl
          }
          setLandingSettings(updated)
          localStorage.setItem("landing_settings", JSON.stringify(updated))
        }
      } catch (e) {
        console.warn("Firestore offline, usando configurações locais:", e)
      }
    }
    fetchSettings()
  }, [])

  return { landingSettings, isMobile }
}
