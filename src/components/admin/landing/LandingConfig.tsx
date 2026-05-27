"use client"

import { useState, useEffect } from "react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { LandingSettings } from "@/types/landing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Save, ShieldCheck, Info } from "lucide-react"
import { HeroSlideManager } from "./HeroSlideManager"
import { useToast } from "@/components/ui/toast-simple"

interface LandingConfigProps {
  landingSettings: LandingSettings
  onSettingsSaved: (updatedSettings: LandingSettings) => void
}

export function LandingConfig({ landingSettings, onSettingsSaved }: LandingConfigProps) {
  const { success, error: showError } = useToast()
  const [heroTitle, setHeroTitle] = useState("")
  const [heroGlowText, setHeroGlowText] = useState("")
  const [liveBannerText, setLiveBannerText] = useState("")
  const [congonhasStatus, setCongonhasStatus] = useState("")
  const [savingSettings, setSavingSettings] = useState(false)

  // Sync state with props
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

      // Invalidate local cache so Home reflects changes immediately
      if (typeof window !== "undefined") {
        localStorage.removeItem("landing_settings")
        localStorage.setItem("landing_settings", JSON.stringify(payload))
      }

      onSettingsSaved(payload)
      success("Configurações salvas!", "Os textos da Landing Page foram atualizados.")
    } catch (e: any) {
      console.error("Erro ao salvar configurações da landing:", e)
      showError("Erro ao salvar", e?.message || "Tente novamente.")
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">

      {/* ── SEÇÃO 1: GERENCIADOR DE SLIDES HERO ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Landing Page — Hero & Textos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie os slides do carrossel principal e os textos institucionais da Home.
          </p>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-sm font-black text-slate-900">
              Carrossel Hero — Slides
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Crie, edite e reordene os slides exibidos no topo da Home. Cada slide tem título, subtítulo, imagem/vídeo e CTA próprios.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <HeroSlideManager />
          </CardContent>
        </Card>
      </div>

      {/* ── SEÇÃO 2: TEXTOS DO SLIDE PADRÃO ── */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            Textos Institucionais & Aeroporto
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Estes textos são usados no slide padrão (quando nenhum slide está cadastrado acima) e em elementos fixos da página.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">

          {/* Info callout */}
          <div className="flex items-start gap-3 bg-sky-50 border border-sky-100 rounded-lg p-3 mb-6">
            <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-sky-700 leading-relaxed">
              <strong>Slide Padrão:</strong> quando não há nenhum slide cadastrado no carrossel acima, o Hero exibe
              automaticamente o <em>Título Principal</em> e o <em>Slogan Glow</em> configurados aqui.
              Se houver slides cadastrados, eles têm prioridade.
            </p>
          </div>

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
                <label className="text-xs font-bold text-slate-700">Slogan de Destaque — Glow (Slide Padrão)</label>
                <Input
                  value={heroGlowText}
                  onChange={(e) => setHeroGlowText(e.target.value)}
                  placeholder="Ex: Dirija com propósito."
                  className="bg-white border-slate-200 text-slate-800 h-11 focus-visible:ring-sky-500"
                />
              </div>

              {/* Fila Congonhas */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Fila Congonhas D-Taxi (Status / Tempo)</label>
                <Input
                  value={congonhasStatus}
                  onChange={(e) => setCongonhasStatus(e.target.value)}
                  placeholder="Ex: Fila rápida liberada (média 15 min de espera)"
                  className="bg-white border-slate-200 text-slate-800 h-11 focus-visible:ring-sky-500"
                />
              </div>

              {/* Live Banner Scrolling Text */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Aviso do Banner Live (Scrolling Ticker)</label>
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

    </div>
  )
}
