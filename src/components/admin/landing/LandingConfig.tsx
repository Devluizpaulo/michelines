"use client"

import { useState, useEffect } from "react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { LandingSettings } from "@/types/landing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Save, ShieldCheck } from "lucide-react"

interface LandingConfigProps {
  landingSettings: LandingSettings
  onSettingsSaved: (updatedSettings: LandingSettings) => void
}

export function LandingConfig({ landingSettings, onSettingsSaved }: LandingConfigProps) {
  const [heroTitle, setHeroTitle] = useState("")
  const [heroGlowText, setHeroGlowText] = useState("")
  const [liveBannerText, setLiveBannerText] = useState("")
  const [congonhasStatus, setCongonhasStatus] = useState("")
  const [savingSettings, setSavingSettings] = useState(false)

  // Sync state
  useEffect(() => {
    if (landingSettings) {
      setHeroTitle(landingSettings.heroTitle || "")
      setHeroGlowText(landingSettings.heroGlowText || "")
      setLiveBannerText(landingSettings.liveBannerText || "")
      setCongonhasStatus(landingSettings.congonhasStatus || "")
    }
  }, [landingSettings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSavingSettings(true)
      const payload = {
        ...landingSettings,
        heroTitle,
        heroGlowText,
        liveBannerText,
        congonhasStatus,
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, "landing", "settings"), payload, { merge: true })
      
      // Update local cache
      if (typeof window !== "undefined") {
        localStorage.setItem("landing_settings", JSON.stringify(payload))
      }

      onSettingsSaved(payload)
      alert("Configurações gerais da Landing Page salvas!")
    } catch (e) {
      console.error("Erro ao salvar configurações da landing:", e)
      alert("Erro ao salvar.")
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sky-600" />
          Textos Institucionais & Aeroporto
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Gerencie os slogans da Hero principal, textos rotativos e status da fila de Congonhas.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Título Principal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Título Principal (Slide Padrão)</label>
              <Input 
                value={heroTitle} 
                onChange={(e) => setHeroTitle(e.target.value)} 
                placeholder="Ex: Ganhe mais. Trabalhe com liberdade."
                className="bg-white border-slate-200 text-slate-800 h-11 focus-visible:ring-sky-500"
              />
            </div>

            {/* Slogan Destaque */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Slogan de Destaque (Glow)</label>
              <Input 
                value={heroGlowText} 
                onChange={(e) => setHeroGlowText(e.target.value)} 
                placeholder="Ex: Dirija com propósito."
                className="bg-white border-slate-200 text-slate-800 h-11 focus-visible:ring-sky-500"
              />
            </div>

            {/* Fila Congonhas */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Fila Congonhas D-Taxi (Status/Tempo)</label>
              <Input 
                value={congonhasStatus} 
                onChange={(e) => setCongonhasStatus(e.target.value)} 
                placeholder="Ex: Fila rápida liberada (média 15 min de espera)"
                className="bg-white border-slate-200 text-slate-800 h-11 focus-visible:ring-sky-500"
              />
            </div>

            {/* Live Banner Scrolling Text */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Aviso do Banner Live ( Scrolling Ticker )</label>
              <Input 
                value={liveBannerText} 
                onChange={(e) => setLiveBannerText(e.target.value)} 
                placeholder="Ex: Oportunidade da semana: Diárias especiais..."
                className="bg-white border-slate-200 text-slate-800 h-11 focus-visible:ring-sky-500"
              />
            </div>

          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 mt-6">
            <Button 
              type="submit" 
              disabled={savingSettings}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold h-11 px-6 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" /> {savingSettings ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
