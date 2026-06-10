"use client"

import { useState, useEffect } from "react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { LandingSettings } from "@/types/landing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Settings, Save } from "lucide-react"
import { CampaignExporter } from "./CampaignExporter"
import { useToast } from "@/components/ui/toast-simple"

// Helper to compress and load image client-side to keep base64 sizes small
const compressAndLoadImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml") {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") resolve(reader.result)
        else reject(new Error("Erro ao ler SVG"))
      }
      reader.onerror = () => reject(new Error("Erro ao ler SVG"))
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX_WIDTH = 1000
        const MAX_HEIGHT = 1000
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Não foi possível obter contexto do canvas"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL("image/webp", 0.75)
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error("Erro ao carregar imagem no DOM"))
      img.src = event.target?.result as string
    }
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"))
    reader.readAsDataURL(file)
  })
}

interface CampaignManagerProps {
  landingSettings: LandingSettings
  onSettingsSaved: (updatedSettings: LandingSettings) => void
}

export function CampaignManager({ landingSettings, onSettingsSaved }: CampaignManagerProps) {
  const { success, error: showError } = useToast()

  // Campaign Banner States
  const [showCampaignBanner, setShowCampaignBanner] = useState(false)
  const [campaignText, setCampaignText] = useState("")
  const [campaignTemplateId, setCampaignTemplateId] = useState(1)
  const [campaignSubtitle, setCampaignSubtitle] = useState("")
  const [campaignBtnText, setCampaignBtnText] = useState("")
  const [campaignBtnUrl, setCampaignBtnUrl] = useState("")
  const [campaignImageUrl, setCampaignImageUrl] = useState("")
  const [campaignImagePosition, setCampaignImagePosition] = useState<'left' | 'right'>("right")
  const [campaignImageSize, setCampaignImageSize] = useState<'sm' | 'md' | 'lg'>("md")
  const [campaignImageAspectRatio, setCampaignImageAspectRatio] = useState<'square' | 'video' | 'wide' | 'original'>("video")
  const [savingCampaign, setSavingCampaign] = useState(false)

  // Sync props
  useEffect(() => {
    if (landingSettings) {
      setShowCampaignBanner(!!landingSettings.showCampaignBanner)
      setCampaignText(landingSettings.campaignText || "")
      setCampaignTemplateId(landingSettings.campaignTemplateId || 1)
      setCampaignSubtitle(landingSettings.campaignSubtitle || "")
      setCampaignBtnText(landingSettings.campaignBtnText || "")
      setCampaignBtnUrl(landingSettings.campaignBtnUrl || "")
      setCampaignImageUrl(landingSettings.campaignImageUrl || "")
      setCampaignImagePosition(landingSettings.campaignImagePosition || "right")
      setCampaignImageSize(landingSettings.campaignImageSize || "md")
      setCampaignImageAspectRatio(landingSettings.campaignImageAspectRatio || "video")
    }
  }, [landingSettings])

  // Handle local image upload via Base64 FileReader with auto-compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const compressedBase64 = await compressAndLoadImage(file)
      setCampaignImageUrl(compressedBase64)
      success("Imagem carregada!", "A imagem foi carregada, redimensionada e otimizada com sucesso.")
    } catch (err: any) {
      console.error("Erro ao processar imagem:", err)
      showError("Erro no upload", "Não foi possível carregar ou otimizar a imagem. Tente outro arquivo.")
    } finally {
      e.target.value = "" // Reset target
    }
  }

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
        campaignImageUrl,
        campaignImagePosition,
        campaignImageSize,
        campaignImageAspectRatio,
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, "landing", "settings"), payload, { merge: true })
      onSettingsSaved(payload)
      success("Banner salvo!", "Configurações do banner de campanha gravadas na nuvem.")
    } catch (error: any) {
      console.error("Erro ao salvar campanha:", error)
      showError("Erro ao salvar campanha", error?.message || "Tente novamente.")
    } finally {
      setSavingCampaign(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* BANNER PROMOCIONAL DINÂMICO */}
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

                  {/* CUSTOM IMAGE UPLOADER & URL SECTION */}
                  <div className="space-y-2 md:col-span-2 border-t border-slate-200 pt-4">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Imagem Promocional Personalizada (Opcional)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* File Upload */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase block">Fazer Upload de Foto</label>
                        <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-350 rounded-xl p-4 bg-white flex flex-col items-center justify-center transition-all cursor-pointer group min-h-[96px]">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <span className="text-xl">📷</span>
                          <p className="text-[10px] font-bold text-slate-650 group-hover:text-slate-800 mt-1">
                            Clique para carregar imagem
                          </p>
                          <p className="text-[8px] text-slate-400 mt-0.5 font-medium">
                            PNG, JPG até 800KB
                          </p>
                        </div>
                      </div>

                      {/* Custom Image URL */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase block">Ou colar URL da Imagem</label>
                        <Input 
                          value={campaignImageUrl} 
                          onChange={(e) => setCampaignImageUrl(e.target.value)} 
                          placeholder="https://exemplo.com/sua-imagem.png"
                          className="bg-white border-slate-200 text-slate-800 text-xs h-[52px]"
                        />
                        {campaignImageUrl && (
                          <button
                            type="button"
                            onClick={() => setCampaignImageUrl("")}
                            className="text-[9px] font-black text-rose-500 hover:text-rose-600 flex items-center gap-1 mt-1.5 transition-colors"
                          >
                            ❌ Usar Imagem Padrão do Template
                          </button>
                        )}
                      </div>
                    </div>
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

                {/* IMAGE LAYOUT SETTINGS */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block">Configurações de Layout da Imagem</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Position Control */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase block">Posição da Imagem</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCampaignImagePosition("right")}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all h-9 ${
                            campaignImagePosition === "right"
                              ? "border-sky-500 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-white hover:border-slate-300 text-slate-650"
                          }`}
                        >
                          Direita
                        </button>
                        <button
                          type="button"
                          onClick={() => setCampaignImagePosition("left")}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all h-9 ${
                            campaignImagePosition === "left"
                              ? "border-sky-500 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-white hover:border-slate-300 text-slate-650"
                          }`}
                        >
                          Esquerda
                        </button>
                      </div>
                    </div>

                    {/* Size Control */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase block">Tamanho da Imagem</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["sm", "md", "lg"] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setCampaignImageSize(sz)}
                            className={`p-1 rounded-lg border text-[10px] font-bold capitalize transition-all h-9 ${
                              campaignImageSize === sz
                                ? "border-sky-500 bg-sky-50 text-sky-700"
                                : "border-slate-200 bg-white hover:border-slate-300 text-slate-650"
                            }`}
                          >
                            {sz === "sm" && "Peq."}
                            {sz === "md" && "Méd."}
                            {sz === "lg" && "Grd."}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Aspect Ratio Control */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase block">Formato da Imagem</label>
                      <div className="grid grid-cols-4 gap-1">
                        {(["video", "square", "wide", "original"] as const).map((ratio) => (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setCampaignImageAspectRatio(ratio)}
                            className={`p-0.5 rounded-lg border text-[8px] font-black uppercase transition-all h-9 ${
                              campaignImageAspectRatio === ratio
                                ? "border-sky-500 bg-sky-50 text-sky-700"
                                : "border-slate-200 bg-white hover:border-slate-300 text-slate-650"
                            }`}
                          >
                            {ratio === "video" && "16:9"}
                            {ratio === "square" && "1:1"}
                            {ratio === "wide" && "21:9"}
                            {ratio === "original" && "Orig."}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* LIVE PREVIEW */}
                <div className="space-y-3 pt-5 border-t border-slate-200">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Prévia em Tempo Real (Live Preview)</label>
                  
                  {(() => {
                    const TEMPLATE_CONFIGS: Record<number, {
                      containerClass: string
                      tagText: string
                      tagClass: string
                      buttonClass: string
                      defaultImage: string
                      imageBorderClass: string
                    }> = {
                      1: {
                        containerClass: "from-sky-50/80 to-indigo-50/50 border-sky-100",
                        tagText: "Campanha D-TAXI",
                        tagClass: "bg-sky-100 text-sky-700 border-sky-200",
                        buttonClass: "bg-sky-600 hover:bg-sky-500 text-white",
                        defaultImage: "/images/banners/banner-1.png",
                        imageBorderClass: "border-slate-200"
                      },
                      2: {
                        containerClass: "from-amber-50/80 to-orange-50/50 border-amber-100",
                        tagText: "Destaque Exclusivo",
                        tagClass: "bg-amber-100 text-amber-800 border-amber-200",
                        buttonClass: "bg-amber-600 hover:bg-amber-500 text-white",
                        defaultImage: "/images/banners/banner-2.png",
                        imageBorderClass: "border-amber-200"
                      },
                      3: {
                        containerClass: "from-emerald-50/80 to-teal-50/50 border-emerald-100",
                        tagText: "Mobilidade Híbrida Eco",
                        tagClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                        buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
                        defaultImage: "/images/banners/banner-3.png",
                        imageBorderClass: "border-emerald-200"
                      }
                    }

                    const cfg = TEMPLATE_CONFIGS[campaignTemplateId] || TEMPLATE_CONFIGS[1]
                    const imageLeft = campaignImagePosition === "left"
                    
                    const previewWidths = {
                      sm: "md:w-[150px]",
                      md: "md:w-[200px]",
                      lg: "md:w-[250px]"
                    }

                    const previewRatios = {
                      video: "aspect-video",
                      square: "aspect-square",
                      wide: "aspect-[21/9]",
                      original: "aspect-auto"
                    }

                    return (
                      <div className={`bg-gradient-to-r ${cfg.containerClass} border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden transition-all duration-300`}>
                        <div className={`flex-1 space-y-3 text-left relative z-10 ${imageLeft ? "order-2" : "order-1"}`}>
                          <span className={`${cfg.tagClass} border text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider`}>
                            {cfg.tagText}
                          </span>
                          <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
                            {campaignText || "Alugue seu Corolla Cross com Fila D-TAXI!"}
                          </h3>
                          <p className="text-slate-600 text-xs font-semibold leading-relaxed text-justify">
                            {campaignSubtitle || "Fature alto no aeroporto de Congonhas. Retirada rápida em 24 horas."}
                          </p>
                          <div className="pt-1">
                            <button type="button" className={`${cfg.buttonClass} rounded-xl font-bold px-4 h-9 text-xs transition-all shadow-sm`}>
                              {campaignBtnText || "Quero Aproveitar"}
                            </button>
                          </div>
                        </div>
                        <div className={`w-full ${previewWidths[campaignImageSize]} ${campaignImageAspectRatio === 'original' ? '' : previewRatios[campaignImageAspectRatio]} ${imageLeft ? "order-1" : "order-2"} relative rounded-xl overflow-hidden shrink-0 shadow-sm border ${cfg.imageBorderClass} bg-white transition-all duration-300`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={campaignImageUrl || cfg.defaultImage} 
                            alt="Promo Campaign"
                            className={`w-full ${campaignImageAspectRatio === 'original' ? 'h-auto' : 'h-full object-cover'}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
                            }}
                          />
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <CampaignExporter landingSettings={{
                ...landingSettings,
                showCampaignBanner,
                campaignText,
                campaignSubtitle,
                campaignBtnText,
                campaignBtnUrl,
                campaignImageUrl,
                campaignImagePosition,
                campaignImageSize,
                campaignImageAspectRatio,
              }} />
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

    </div>
  )
}
