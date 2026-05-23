"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, getDocs, doc, setDoc, updateDoc, addDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { HeroSlideType } from "@/types/hero-slide"
import { LandingSettings } from "@/types/landing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash, Edit3, Settings, Play, Image as ImageIcon, CheckCircle, AlertCircle, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

interface CampaignManagerProps {
  landingSettings: LandingSettings
  onSettingsSaved: (updatedSettings: LandingSettings) => void
}

export function CampaignManager({ landingSettings, onSettingsSaved }: CampaignManagerProps) {
  // Campaign Banner States
  const [showCampaignBanner, setShowCampaignBanner] = useState(false)
  const [campaignText, setCampaignText] = useState("")
  const [campaignTemplateId, setCampaignTemplateId] = useState(1)
  const [campaignSubtitle, setCampaignSubtitle] = useState("")
  const [campaignBtnText, setCampaignBtnText] = useState("")
  const [campaignBtnUrl, setCampaignBtnUrl] = useState("")
  const [savingCampaign, setSavingCampaign] = useState(false)

  // Hero Slides States
  const [slides, setSlides] = useState<HeroSlideType[]>([])
  const [loadingSlides, setLoadingSlides] = useState(true)
  const [slideDialogOpen, setSlideDialogOpen] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<HeroSlideType | null>(null)
  
  // Slide Form State
  const [slideForm, setSlideForm] = useState<Partial<HeroSlideType>>({
    active: true,
    order: 0,
    title: "",
    glowTitle: "",
    subtitle: "",
    ctaText: "",
    ctaUrl: "",
    image: "/images/banners/1.jpg",
    mobileImage: "",
    video: "",
    badge: "",
    overlay: "gradient",
    theme: "navy"
  })
  const [savingSlide, setSavingSlide] = useState(false)

  // Sync props
  useEffect(() => {
    if (landingSettings) {
      setShowCampaignBanner(!!landingSettings.showCampaignBanner)
      setCampaignText(landingSettings.campaignText || "")
      setCampaignTemplateId(landingSettings.campaignTemplateId || 1)
      setCampaignSubtitle(landingSettings.campaignSubtitle || "")
      setCampaignBtnText(landingSettings.campaignBtnText || "")
      setCampaignBtnUrl(landingSettings.campaignBtnUrl || "")
    }
  }, [landingSettings])

  // Load Hero Slides
  const fetchSlides = async () => {
    try {
      setLoadingSlides(true)
      const q = query(collection(db, "hero_slides"), orderBy("order", "asc"))
      const snap = await getDocs(q)
      const list: HeroSlideType[] = []
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as HeroSlideType)
      })
      setSlides(list)
    } catch (e) {
      console.error("Erro ao carregar slides:", e)
    } finally {
      setLoadingSlides(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  // Save Campaign Banner
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSavingCampaign(true)
      const payload = {
        ...landingSettings,
        showCampaignBanner,
        campaignText,
        campaignTemplateId,
        campaignSubtitle,
        campaignBtnText,
        campaignBtnUrl,
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, "landing", "settings"), payload, { merge: true })
      onSettingsSaved(payload)
      alert("Configurações do banner de campanha salvas na nuvem!")
    } catch (error) {
      console.error("Erro ao salvar campanha:", error)
      alert("Erro ao salvar campanha.")
    } finally {
      setSavingCampaign(false)
    }
  }

  // Open Slide Creator/Editor
  const openSlideDialog = (slide: HeroSlideType | null) => {
    if (slide) {
      setSelectedSlide(slide)
      setSlideForm(slide)
    } else {
      setSelectedSlide(null)
      setSlideForm({
        active: true,
        order: slides.length,
        title: "",
        glowTitle: "",
        subtitle: "",
        ctaText: "Quero Faturar Agora",
        ctaUrl: "/cadastro",
        image: "/images/banners/1.jpg",
        mobileImage: "",
        video: "",
        badge: "",
        overlay: "gradient",
        theme: "navy"
      })
    }
    setSlideDialogOpen(true)
  }

  // Save Hero Slide
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSavingSlide(true)
      
      if (selectedSlide?.id) {
        // Edit existing slide
        const slideRef = doc(db, "hero_slides", selectedSlide.id)
        await updateDoc(slideRef, slideForm)
      } else {
        // Create new slide
        await addDoc(collection(db, "hero_slides"), slideForm)
      }

      setSlideDialogOpen(false)
      fetchSlides()
    } catch (e) {
      console.error("Erro ao salvar slide:", e)
      alert("Erro ao salvar slide.")
    } finally {
      setSavingSlide(false)
    }
  }

  // Delete Hero Slide
  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este slide?")) return
    try {
      await deleteDoc(doc(db, "hero_slides", id))
      fetchSlides()
    } catch (e) {
      console.error("Erro ao excluir slide:", e)
      alert("Erro ao excluir slide.")
    }
  }

  return (
    <div className="space-y-12">
      
      {/* 1. SEÇÃO SLIDES DO HERO CAROUSEL */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Carrossel de Slides (Hero Cinematic)</h2>
            <p className="text-xs text-slate-550 mt-0.5">Gerencie os slides do topo da landing page principal.</p>
          </div>
          <Button 
            onClick={() => openSlideDialog(null)}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-10 px-4 flex items-center gap-2 rounded-lg"
          >
            <Plus className="h-4 w-4" /> Novo Slide
          </Button>
        </div>

        {loadingSlides ? (
          <div className="h-48 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
            <span className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full mr-2"></span>
            Carregando slides...
          </div>
        ) : slides.length === 0 ? (
          <div className="h-32 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 bg-slate-50/50 font-semibold">
            Nenhum slide cadastrado. Exibindo slide estático padrão.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide) => (
              <Card key={slide.id} className="bg-white border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row justify-between items-start">
                  <div className="min-w-0 pr-2">
                    <CardTitle className="text-sm font-bold text-slate-800 truncate">{slide.title}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 truncate">{slide.subtitle}</CardDescription>
                  </div>
                  <Badge variant="outline" className={slide.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}>
                    {slide.active ? "Ativo" : "Inativo"}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-slate-600">
                  <div className="flex justify-between text-xs">
                    <span>Ordem: <strong className="text-slate-800">{slide.order}</strong></span>
                    <span>Tema: <strong className="text-slate-800 capitalize">{slide.theme}</strong></span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Fundo:</span>
                    <span className="truncate max-w-[200px] text-slate-800">
                      {slide.video ? "Vídeo Mp4" : "Imagem JPG/PNG"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-3 flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => openSlideDialog(slide)}
                    className="text-sky-600 hover:text-sky-750 hover:bg-slate-100 h-8 px-2 flex items-center gap-1"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => slide.id && handleDeleteSlide(slide.id)}
                    className="text-red-650 hover:text-red-750 hover:bg-slate-100 h-8 px-2 flex items-center gap-1"
                  >
                    <Trash className="h-3.5 w-3.5" /> Excluir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 2. SEÇÃO BANNER PROMOCIONAL INFORMATIVO */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-500" />
            Banner Promocional Dinâmico
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Controle e edite o banner secundário da campanha comercial posicionado na Home.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSaveCampaign} className="space-y-6">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="showCampaign" 
                checked={showCampaignBanner} 
                onChange={(e) => setShowCampaignBanner(e.target.checked)}
                className="h-5 w-5 rounded border-slate-250 bg-slate-50 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <label htmlFor="showCampaign" className="text-sm font-bold text-slate-800 cursor-pointer select-none">
                Exibir banner promocional na página principal
              </label>
            </div>

            {showCampaignBanner && (
              <div className="space-y-6 border border-slate-200 rounded-2xl p-5 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Título do Banner</label>
                    <Input 
                      value={campaignText} 
                      onChange={(e) => setCampaignText(e.target.value)} 
                      placeholder="Ex: Corolla Cross com Fila D-TAXI!"
                      className="bg-white border-slate-200 text-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Subtítulo do Banner</label>
                    <Input 
                      value={campaignSubtitle} 
                      onChange={(e) => setCampaignSubtitle(e.target.value)} 
                      placeholder="Ex: Conditions de diárias exclusivas..."
                      className="bg-white border-slate-200 text-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Texto do Botão (CTA)</label>
                    <Input 
                      value={campaignBtnText} 
                      onChange={(e) => setCampaignBtnText(e.target.value)} 
                      placeholder="Ex: Quero Aproveitar"
                      className="bg-white border-slate-200 text-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Link do Botão (URL)</label>
                    <Input 
                      value={campaignBtnUrl} 
                      onChange={(e) => setCampaignBtnUrl(e.target.value)} 
                      placeholder="Ex: /cadastro ou link do WhatsApp"
                      className="bg-white border-slate-200 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block">Escolha o Modelo Visual (Template ID)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((id) => (
                      <div 
                        key={id}
                        onClick={() => setCampaignTemplateId(id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all text-center ${
                          campaignTemplateId === id 
                            ? "border-sky-500 bg-sky-50" 
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-800">Template {id}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {id === 1 && "Corolla Cross (Sky Blue)"}
                          {id === 2 && "Taxa Zero (Amber/Gold)"}
                          {id === 3 && "Híbrido Eco (Emerald)"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={savingCampaign}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold h-11 px-6 rounded-lg flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> {savingCampaign ? "Salvando..." : "Salvar Banner"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3. DIALOG DE EDICAO DE SLIDE */}
      <Dialog open={slideDialogOpen} onOpenChange={setSlideDialogOpen}>
        <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-md overflow-y-auto max-h-[90vh]">
          <form onSubmit={handleSaveSlide} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900">
                {selectedSlide ? "Editar Slide" : "Criar Novo Slide"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs">
                Configure os parâmetros de texto, imagens e CTA para o topo da Landing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Ordem de Exibição</label>
                  <Input 
                    type="number"
                    value={slideForm.order}
                    onChange={(e) => setSlideForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                    className="bg-white border-slate-200 text-slate-800"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Tema Visual</label>
                  <Select 
                    value={slideForm.theme} 
                    onValueChange={(val) => setSlideForm(prev => ({ ...prev, theme: val }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                      <SelectValue placeholder="Tema" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                      <SelectItem value="navy">Navy Blue (Corporativo)</SelectItem>
                      <SelectItem value="amber">Amber Gold (Destaque)</SelectItem>
                      <SelectItem value="emerald">Emerald Eco (Híbridos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Badge Superior</label>
                <Input 
                  value={slideForm.badge || ""}
                  onChange={(e) => setSlideForm(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="Ex: 45 Anos de Tradição..."
                  className="bg-white border-slate-200 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Título Principal</label>
                <Input 
                  value={slideForm.title || ""}
                  onChange={(e) => setSlideForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Aluguel de Corolla Cross"
                  className="bg-white border-slate-200 text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Título Glow (Gradiente)</label>
                <Input 
                  value={slideForm.glowTitle || ""}
                  onChange={(e) => setSlideForm(prev => ({ ...prev, glowTitle: e.target.value }))}
                  placeholder="Ex: Com fila D-TAXI em Congonhas"
                  className="bg-white border-slate-200 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Subtítulo</label>
                <Input 
                  value={slideForm.subtitle || ""}
                  onChange={(e) => setSlideForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Ex: Economize rodando no corredor..."
                  className="bg-white border-slate-200 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Texto CTA</label>
                  <Input 
                    value={slideForm.ctaText || ""}
                    onChange={(e) => setSlideForm(prev => ({ ...prev, ctaText: e.target.value }))}
                    placeholder="Ex: Faturar Agora"
                    className="bg-white border-slate-200 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">URL CTA</label>
                  <Input 
                    value={slideForm.ctaUrl || ""}
                    onChange={(e) => setSlideForm(prev => ({ ...prev, ctaUrl: e.target.value }))}
                    placeholder="Ex: /cadastro"
                    className="bg-white border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Link Imagem (Desktop)</label>
                <Input 
                  value={slideForm.image || ""}
                  onChange={(e) => setSlideForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="Ex: /images/banners/1.jpg"
                  className="bg-white border-slate-200 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Link Imagem (Celular)</label>
                  <Input 
                    value={slideForm.mobileImage || ""}
                    onChange={(e) => setSlideForm(prev => ({ ...prev, mobileImage: e.target.value }))}
                    placeholder="Ex: /images/banners/1-mobile.jpg"
                    className="bg-white border-slate-200 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Overlay Escuro</label>
                  <Select 
                    value={slideForm.overlay} 
                    onValueChange={(val) => setSlideForm(prev => ({ ...prev, overlay: val }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                      <SelectValue placeholder="Overlay" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                      <SelectItem value="gradient">Gradiente Azul/Preto</SelectItem>
                      <SelectItem value="dark">Forte (Escuro)</SelectItem>
                      <SelectItem value="medium">Médio (Padrão)</SelectItem>
                      <SelectItem value="none">Sem Overlay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Link Vídeo Mp4 (Opcional)</label>
                <Input 
                  value={slideForm.video || ""}
                  onChange={(e) => setSlideForm(prev => ({ ...prev, video: e.target.value }))}
                  placeholder="Ex: Link externo MP4 para loop"
                  className="bg-white border-slate-200 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="slideActive" 
                  checked={slideForm.active}
                  onChange={(e) => setSlideForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-250 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="slideActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Publicar slide imediatamente na Home
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSlideDialogOpen(false)}
                className="border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={savingSlide}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                {savingSlide ? "Salvando..." : "Salvar Slide"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
