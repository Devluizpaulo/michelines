"use client"

import { useState, useEffect } from "react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { LandingSettings } from "@/types/landing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [heroAutoplayInterval, setHeroAutoplayInterval] = useState(8)
  const [heroTransitionDuration, setHeroTransitionDuration] = useState(50)
  const [savingSettings, setSavingSettings] = useState(false)

  // Sync state with props
  useEffect(() => {
    if (landingSettings) {
      setHeroTitle(landingSettings.heroTitle || "")
      setHeroGlowText(landingSettings.heroGlowText || "")
      setLiveBannerText(landingSettings.liveBannerText || "")
      setCongonhasStatus(landingSettings.congonhasStatus || "")
      setHeroAutoplayInterval(landingSettings.heroAutoplayInterval || 8)
      setHeroTransitionDuration(landingSettings.heroTransitionDuration || 50)
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
        heroAutoplayInterval: Number(heroAutoplayInterval || 8),
        heroTransitionDuration: Number(heroTransitionDuration || 50),
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, "landing", "settings"), payload, { merge: true })

      // Invalidate local cache so Home reflects changes immediately
      if (typeof window !== "undefined") {
        localStorage.removeItem("landing_settings")
        localStorage.setItem("landing_settings", JSON.stringify(payload))
      }

      onSettingsSaved(payload)
      success("Configurações salvas!", "Os textos e o tempo de rotação foram atualizados.")
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

              {/* Tempo de Rotação do Carrossel */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Tempo de Rotação do Carrossel (segundos)</label>
                <Input
                  type="number"
                  min={2}
                  max={30}
                  value={heroAutoplayInterval}
                  onChange={(e) => setHeroAutoplayInterval(Number(e.target.value))}
                  placeholder="Ex: 8"
                  className="bg-white border-slate-200 text-slate-800 h-11 focus-visible:ring-sky-500"
                />
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Duração de exibição de cada slide antes de girar automaticamente (Padrão: 8s).</span>
              </div>

              {/* Velocidade de Transição do Slide */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Velocidade de Transição do Slide (suavidade)</label>
                <Select
                  value={String(heroTransitionDuration)}
                  onValueChange={(v) => setHeroTransitionDuration(Number(v))}
                >
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-11 focus:ring-sky-500">
                    <SelectValue placeholder="Selecione a velocidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-700">
                    <SelectItem value="20">Muito Rápida (20ms)</SelectItem>
                    <SelectItem value="35">Rápida (35ms)</SelectItem>
                    <SelectItem value="50">Suave / Cinemática (50ms - Padrão)</SelectItem>
                    <SelectItem value="75">Lenta / Gradual (75ms)</SelectItem>
                    <SelectItem value="100">Super Lenta (100ms)</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  Controla o tempo da animação ao deslizar de um banner para o outro (valores maiores são mais suaves).
                </span>
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

            {/* LIVE PREVIEW INSTITUCIONAL */}
            <div className="space-y-4 pt-6 border-t border-slate-200 mt-6">
              <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Prévia em Tempo Real (Live Preview)</label>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-slate-900 text-white relative">
                
                {/* 1. Scrolling Ticker Preview */}
                <div className="bg-[#0A192F] border-b border-blue-900/30 py-2 px-4 text-center overflow-hidden relative">
                  <div className="flex justify-center items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-100/90 truncate">
                      {liveBannerText || "Campanha ativa: Oportunidade especial da semana..."}
                    </span>
                  </div>
                </div>

                {/* 2. Hero Slice Mockup */}
                <div className="p-6 md:p-8 space-y-6 relative overflow-hidden bg-gradient-to-br from-[#0F1E36] to-[#0A1224]">
                  {/* Ambient light overlay */}
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-sky-500/5 rounded-full blur-[60px] pointer-events-none" />
                  
                  <div className="space-y-3 relative z-10 max-w-lg">
                    <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">
                      Grupo Michelines • Frota Própria
                    </span>
                    <h1 className="text-xl md:text-2xl font-black leading-tight tracking-tight text-white">
                      {heroTitle || "Ganhe mais. Trabalhe com liberdade."}{" "}
                      <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm font-black">
                        {heroGlowText || "Dirija com propósito."}
                      </span>
                    </h1>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      Carros novos, híbridos e sedans executivos com manutenção preventiva inclusa e suporte especializado 24/7.
                    </p>
                  </div>

                  {/* 3. Congonhas Fila Status Indicator */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur relative z-10">
                    <div className="space-y-1">
                      <span className="text-[8px] text-sky-300 font-black uppercase tracking-wider block">✈️ Fila D-TAXI — Aeroporto Congonhas</span>
                      <p className="text-xs font-bold text-white leading-tight">
                        {congonhasStatus || "Carregando status em tempo real..."}
                      </p>
                    </div>
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wide">
                      Operacional
                    </span>
                  </div>

                </div>

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
