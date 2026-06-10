"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { doc, setDoc, collection, query, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { LandingSettings } from "@/types/landing"
import { HeroSlideType } from "@/types/hero-slide"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, ShieldCheck, Info, Layers, Settings, Play, ArrowLeft, ArrowRight, Eye, MonitorPlay } from "lucide-react"
import { HeroSlideManager } from "./HeroSlideManager"
import { useToast } from "@/components/ui/toast-simple"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface LandingConfigProps {
  landingSettings: LandingSettings
  onSettingsSaved: (updatedSettings: LandingSettings) => void
}

export function LandingConfig({ landingSettings, onSettingsSaved }: LandingConfigProps) {
  const { success, error: showError } = useToast()
  
  // Tab states
  const [activeTab, setActiveTab] = useState("slides")

  // Form states
  const [heroTitle, setHeroTitle] = useState("")
  const [heroGlowText, setHeroGlowText] = useState("")
  const [liveBannerText, setLiveBannerText] = useState("")
  const [congonhasStatus, setCongonhasStatus] = useState("")
  const [heroAutoplayInterval, setHeroAutoplayInterval] = useState(8)
  const [heroTransitionDuration, setHeroTransitionDuration] = useState(50)
  const [savingSettings, setSavingSettings] = useState(false)

  // Slides state
  const [slides, setSlides] = useState<HeroSlideType[]>([])
  const [loadingSlides, setLoadingSlides] = useState(true)

  // Preview state
  const [previewMode, setPreviewMode] = useState<"slides" | "default">("slides")
  const [previewIndex, setPreviewIndex] = useState(0)

  // Fetch slides centralizado
  const fetchSlides = useCallback(async () => {
    try {
      setLoadingSlides(true)
      const q = query(collection(db, "hero_slides"), orderBy("order", "asc"))
      const snap = await getDocs(q)
      const list: HeroSlideType[] = []
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as HeroSlideType))
      setSlides(list)
    } catch (e) {
      console.error("Erro ao carregar slides:", e)
      showError("Erro", "Não foi possível carregar os slides.")
    } finally {
      setLoadingSlides(false)
    }
  }, [showError])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

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

  // Filtra slides ativos
  const activeSlides = useMemo(() => {
    return slides.filter((s) => s.active)
  }, [slides])

  // Se o índice do preview ficar fora dos limites dos slides ativos, reseta ele
  useEffect(() => {
    if (previewIndex >= activeSlides.length) {
      setPreviewIndex(0)
    }
  }, [activeSlides, previewIndex])

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

  // Prepara o slide de preview atual
  const currentPreviewSlide = useMemo(() => {
    if (previewMode === "slides" && activeSlides.length > 0) {
      return activeSlides[previewIndex]
    }
    
    // Slide padrão / fallback
    return {
      title: heroTitle || "Ganhe mais. Trabalhe com liberdade.",
      glowTitle: heroGlowText || "Dirija com propósito.",
      subtitle: "Carros novos, híbridos e sedans executivos com manutenção preventiva inclusa e suporte especializado 24/7.",
      theme: "navy",
      badge: "Grupo Michelines • Frota Própria",
      ctaText: "Quero Faturar Agora",
      overlay: "gradient",
      showTextOverlay: true,
      textAlignment: "center"
    } as Partial<HeroSlideType>
  }, [previewMode, activeSlides, previewIndex, heroTitle, heroGlowText])

  return (
    <div className="space-y-6 select-none max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MonitorPlay className="h-5 w-5 text-sky-600" />
          Landing Page — Painel & Design
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 font-semibold">
          Configure a experiência visual dos motoristas, controle o carrossel de ofertas e visualize em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: CONTROLES (TABBED INTERFACE) */}
        <div className="xl:col-span-7 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100 border border-slate-200/60 p-1 rounded-xl w-full grid grid-cols-2 mb-6">
              <TabsTrigger 
                value="slides" 
                className="rounded-lg font-bold text-xs flex items-center gap-2 h-9 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm transition-all"
              >
                <Layers className="h-3.5 w-3.5" />
                Slides do Carrossel ({slides.length})
              </TabsTrigger>
              <TabsTrigger 
                value="textos" 
                className="rounded-lg font-bold text-xs flex items-center gap-2 h-9 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm transition-all"
              >
                <Settings className="h-3.5 w-3.5" />
                Textos Fixos & Configurações
              </TabsTrigger>
            </TabsList>

            {/* TAB: GERENCIADOR DE SLIDES */}
            <TabsContent value="slides" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
              <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                  <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Slides Cadastrados
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 font-medium">
                    Configure os slides exibidos no topo da Home. A reordenação reflete instantaneamente no carrossel.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <HeroSlideManager 
                    slides={slides} 
                    loading={loadingSlides} 
                    onRefresh={fetchSlides} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: TEXTOS INSTITUCIONAIS */}
            <TabsContent value="textos" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
              <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-sky-600" />
                    Textos & Indicadores da Home
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 font-medium">
                    Textos secundários e dados que funcionam como fallback ou indicadores fixos na Landing Page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">

                  <div className="flex items-start gap-3 bg-sky-50 border border-sky-100 rounded-xl p-4">
                    <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-sky-700 leading-relaxed font-semibold">
                      💡 <strong>Slide Padrão:</strong> Se o carrossel não possuir slides ativos publicados, o site exibirá o <em>Título Principal</em> e o <em>Slogan Glow</em> aqui configurados.
                    </p>
                  </div>

                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Título Principal (Slide Padrão)</label>
                        <Input
                          value={heroTitle}
                          onChange={(e) => setHeroTitle(e.target.value)}
                          placeholder="Ex: Ganhe mais. Trabalhe com liberdade."
                          className="bg-white border-slate-200 text-slate-800 h-10 focus-visible:ring-sky-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Slogan de Destaque — Glow (Slide Padrão)</label>
                        <Input
                          value={heroGlowText}
                          onChange={(e) => setHeroGlowText(e.target.value)}
                          placeholder="Ex: Dirija com propósito."
                          className="bg-white border-slate-200 text-slate-800 h-10 focus-visible:ring-sky-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Tempo de Rotação do Carrossel (segundos)</label>
                        <Input
                          type="number"
                          min={2}
                          max={30}
                          value={heroAutoplayInterval}
                          onChange={(e) => setHeroAutoplayInterval(Number(e.target.value))}
                          placeholder="Ex: 8"
                          className="bg-white border-slate-200 text-slate-800 h-10 focus-visible:ring-sky-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Velocidade de Transição do Slide (suavidade)</label>
                        <Select
                          value={String(heroTransitionDuration)}
                          onValueChange={(v) => setHeroTransitionDuration(Number(v))}
                        >
                          <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-10 focus:ring-sky-500">
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
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Fila Congonhas D-Taxi (Status / Tempo)</label>
                        <Input
                          value={congonhasStatus}
                          onChange={(e) => setCongonhasStatus(e.target.value)}
                          placeholder="Ex: Fila rápida liberada (média 15 min de espera)"
                          className="bg-white border-slate-200 text-slate-800 h-10 focus-visible:ring-sky-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Aviso do Banner Live (Scrolling Ticker)</label>
                        <Input
                          value={liveBannerText}
                          onChange={(e) => setLiveBannerText(e.target.value)}
                          placeholder="Ex: Oportunidade da semana: Diárias especiais..."
                          className="bg-white border-slate-200 text-slate-800 h-10 focus-visible:ring-sky-500"
                        />
                      </div>

                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <Button
                        type="submit"
                        disabled={savingSettings}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold h-10 px-6 rounded-lg flex items-center gap-2 shadow-sm"
                      >
                        <Save className="h-4 w-4" /> {savingSettings ? "Salvando..." : "Salvar Configurações"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* COLUNA DIREITA: PREVIEW INTERATIVO DA HOME (STICKY) */}
        <div className="xl:col-span-5 sticky top-6">
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden border-2 border-dashed border-slate-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5 text-sky-600" />
                  Live Preview Interativo
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-medium">
                  Veja em tempo real como o carrossel e os avisos aparecem na Home.
                </CardDescription>
              </div>
              
              {/* Toggle Preview Mode */}
              {activeSlides.length > 0 && (
                <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/40">
                  <button
                    onClick={() => setPreviewMode("slides")}
                    className={cn(
                      "text-[9px] font-bold px-2 py-1 rounded transition-all",
                      previewMode === "slides" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Slides
                  </button>
                  <button
                    onClick={() => setPreviewMode("default")}
                    className={cn(
                      "text-[9px] font-bold px-2 py-1 rounded transition-all",
                      previewMode === "default" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Fixo
                  </button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              
              <div className="bg-slate-900 text-white rounded-xl overflow-hidden relative shadow-lg aspect-[16/11] border border-slate-800 flex flex-col justify-between">
                
                {/* 1. Scrolling Ticker Preview (Aviso Live) */}
                <div className="bg-[#0A192F] border-b border-blue-900/30 py-2 px-3 overflow-hidden shrink-0">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[9px] font-black tracking-wider uppercase text-sky-200/90 truncate max-w-full">
                      {liveBannerText || "Campanha ativa: Oportunidade especial da semana..."}
                    </span>
                  </div>
                </div>

                {/* 2. Slide Content Area (Interactive Preview) */}
                <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
                  
                  {/* Background Image Container with Ken Burns effect */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPreviewSlide.image || currentPreviewSlide.id || "default"}
                      initial={{ scale: 1.05, opacity: 0 }}
                      animate={{ scale: 1.0, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 z-0 pointer-events-none"
                    >
                      {currentPreviewSlide.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={currentPreviewSlide.image}
                          alt=""
                          className={cn(
                            "w-full h-full object-cover",
                            currentPreviewSlide.imageFit === "contain" && "object-contain"
                          )}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0F1E36] to-[#0A1224]" />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Dynamic Dark / Gradient Overlay */}
                  <div 
                    className={cn(
                      "absolute inset-0 z-10 pointer-events-none transition-colors duration-500",
                      currentPreviewSlide.overlay === "gradient" && "bg-gradient-to-br from-[#0F1E36]/50 to-[#0A1224]/75 backdrop-blur-[0.3px]",
                      currentPreviewSlide.overlay === "dark" && "bg-[#0A1224]/85",
                      currentPreviewSlide.overlay === "medium" && "bg-[#0F1E36]/70",
                      currentPreviewSlide.overlay === "none" && "bg-transparent"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent z-10 pointer-events-none" />

                  {/* Centered / Aligned Text overlay */}
                  {currentPreviewSlide.showTextOverlay !== false ? (
                    <div className={cn(
                      "w-full relative z-20 space-y-2.5 max-w-sm",
                      currentPreviewSlide.textAlignment === "left" && "text-left mr-auto ml-0",
                      currentPreviewSlide.textAlignment === "right" && "text-right ml-auto mr-0",
                      currentPreviewSlide.textAlignment === "center" && "text-center mx-auto"
                    )}>
                      {currentPreviewSlide.badge && (
                        <div className={cn(
                          "flex",
                          currentPreviewSlide.textAlignment === "left" && "justify-start",
                          currentPreviewSlide.textAlignment === "right" && "justify-end",
                          currentPreviewSlide.textAlignment === "center" && "justify-center"
                        )}>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border flex items-center gap-1",
                            currentPreviewSlide.theme === "navy" && "bg-sky-950/80 border-sky-400/30 text-sky-300",
                            currentPreviewSlide.theme === "amber" && "bg-amber-950/80 border-amber-400/30 text-amber-300",
                            currentPreviewSlide.theme === "emerald" && "bg-emerald-950/80 border-emerald-400/30 text-emerald-300"
                          )}>
                            {currentPreviewSlide.badge}
                          </span>
                        </div>
                      )}

                      <h1 className="text-sm sm:text-base font-black leading-snug tracking-tight text-white">
                        {currentPreviewSlide.title || "— Slide Principal —"}{" "}
                        {currentPreviewSlide.glowTitle && (
                          <span className={cn(
                            "bg-gradient-to-r bg-clip-text text-transparent drop-shadow-sm font-black",
                            currentPreviewSlide.theme === "navy" && "from-sky-450 via-sky-400 to-indigo-400",
                            currentPreviewSlide.theme === "amber" && "from-amber-400 via-amber-350 to-orange-400",
                            currentPreviewSlide.theme === "emerald" && "from-emerald-450 via-teal-400 to-green-400"
                          )}>
                            {currentPreviewSlide.glowTitle}
                          </span>
                        )}
                      </h1>

                      <p className="text-[9px] text-slate-300 leading-snug line-clamp-2">
                        {currentPreviewSlide.subtitle}
                      </p>

                      <div className={cn(
                        "flex items-center pt-1",
                        currentPreviewSlide.textAlignment === "left" && "justify-start",
                        currentPreviewSlide.textAlignment === "right" && "justify-end",
                        currentPreviewSlide.textAlignment === "center" && "justify-center"
                      )}>
                        <button
                          type="button"
                          className={cn(
                            "px-4 py-1.5 text-[9px] font-black rounded-lg transition-transform active:scale-95 shadow-md flex items-center gap-1.5 text-white",
                            currentPreviewSlide.theme === "navy" && "bg-sky-600 hover:bg-sky-500",
                            currentPreviewSlide.theme === "amber" && "bg-amber-500 hover:bg-amber-450 text-slate-900",
                            currentPreviewSlide.theme === "emerald" && "bg-emerald-600 hover:bg-emerald-500"
                          )}
                        >
                          {currentPreviewSlide.ctaText || "Faturar Agora"}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 z-20">
                      <span className="text-[8px] bg-slate-950/80 border border-white/10 px-2 py-0.5 rounded font-black text-white/80 uppercase tracking-widest">
                        Flyer Canva sem Textos
                      </span>
                    </div>
                  )}

                  {/* Slide controls in Mockup */}
                  {previewMode === "slides" && activeSlides.length > 1 && (
                    <>
                      <button
                        onClick={() => setPreviewIndex((p) => (p === 0 ? activeSlides.length - 1 : p - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-25 h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/80 transition-colors"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setPreviewIndex((p) => (p === activeSlides.length - 1 ? 0 : p + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-25 h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/80 transition-colors"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}

                  {/* Progress dots inside mockup */}
                  {previewMode === "slides" && activeSlides.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-25 flex gap-1.5">
                      {activeSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPreviewIndex(idx)}
                          className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            idx === previewIndex ? "w-4 bg-white" : "w-1 bg-white/40"
                          )}
                        />
                      ))}
                    </div>
                  )}

                </div>

                {/* 3. Congonhas Fila Status (Aeroporto) */}
                <div className="flex items-center justify-between gap-3 p-3 bg-white/5 border-t border-white/10 backdrop-blur-xs shrink-0">
                  <div className="space-y-0.5 truncate flex-1 min-w-0">
                    <span className="text-[7px] text-sky-300 font-black uppercase tracking-wider block">✈️ Fila D-TAXI — Congonhas</span>
                    <p className="text-[10px] font-bold text-white leading-tight truncate">
                      {congonhasStatus || "Carregando status em tempo real..."}
                    </p>
                  </div>
                  <span className="text-[7px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0">
                    Operacional
                  </span>
                </div>

              </div>

              {/* Status info below preview */}
              <div className="mt-3 text-center">
                <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-full">
                  {previewMode === "slides" && activeSlides.length > 0 
                    ? `Visualizando slide ativo ${previewIndex + 1} de ${activeSlides.length}: ${currentPreviewSlide.title || "Sem Título"}`
                    : "Visualizando Slide Padrão (Fixado sem Campanhas)"
                  }
                </span>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
