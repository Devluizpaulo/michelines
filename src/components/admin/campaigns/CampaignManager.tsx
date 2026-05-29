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
    }
  }, [landingSettings])

  // Handle local image upload via Base64 FileReader
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 800000) {
      showError("Arquivo muito grande", "Por favor, selecione uma imagem com menos de 800KB para otimização.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setCampaignImageUrl(reader.result)
        success("Imagem carregada!", "A imagem foi carregada e convertida com sucesso.")
      }
    }
    reader.onerror = () => {
      showError("Erro no upload", "Não foi possível ler o arquivo de imagem.")
    }
    reader.readAsDataURL(file)
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

                {/* LIVE PREVIEW */}
                <div className="space-y-3 pt-5 border-t border-slate-200">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Prévia em Tempo Real (Live Preview)</label>
                  
                  {campaignTemplateId === 1 && (
                    <div className="bg-gradient-to-r from-sky-50/80 to-indigo-50/50 border border-sky-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden transition-all duration-300">
                      <div className="flex-1 space-y-3 text-left relative z-10">
                        <span className="bg-sky-100 text-sky-700 border border-sky-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                          Campanha D-TAXI
                        </span>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
                          {campaignText || "Alugue seu Corolla Cross com Fila D-TAXI!"}
                        </h3>
                        <p className="text-slate-600 text-xs font-semibold leading-relaxed text-justify">
                          {campaignSubtitle || "Fature alto no aeroporto de Congonhas. Retirada rápida em 24 horas."}
                        </p>
                        <div className="pt-1">
                          <button type="button" className="bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold px-4 h-9 text-xs transition-all shadow-sm">
                            {campaignBtnText || "Quero Aproveitar"}
                          </button>
                        </div>
                      </div>
                      <div className="w-full md:w-[220px] h-[125px] relative rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={campaignImageUrl || "/images/banners/banner-1.png"} 
                          alt="Promo Corolla Cross"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {campaignTemplateId === 2 && (
                    <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden transition-all duration-300">
                      <div className="flex-1 space-y-3 text-left relative z-10">
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                          Destaque Exclusivo
                        </span>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
                          {campaignText || "Taxa Zero: 3 Diárias Grátis para Começar!"}
                        </h3>
                        <p className="text-slate-600 text-xs font-semibold leading-relaxed text-justify">
                          {campaignSubtitle || "Inscreva-se hoje e aproveite as condições especiais sem comprovante de score."}
                        </p>
                        <div className="pt-1">
                          <button type="button" className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold px-4 h-9 text-xs transition-all shadow-sm">
                            {campaignBtnText || "Quero Aproveitar"}
                          </button>
                        </div>
                      </div>
                      <div className="w-full md:w-[220px] h-[125px] relative rounded-xl overflow-hidden shrink-0 shadow-sm border border-amber-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={campaignImageUrl || "/images/banners/banner-2.png"} 
                          alt="Promo Taxa Zero"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80"
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {campaignTemplateId === 3 && (
                    <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden transition-all duration-300">
                      <div className="flex-1 space-y-3 text-left relative z-10">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                          Mobilidade Híbrida Eco
                        </span>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
                          {campaignText || "Economize até R$ 2.000 com Corolla Híbrido + GNV"}
                        </h3>
                        <p className="text-slate-600 text-xs font-semibold leading-relaxed text-justify">
                          {campaignSubtitle || "Tecnologia de ponta para rodar mais gastando muito menos combustível."}
                        </p>
                        <div className="pt-1">
                          <button type="button" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold px-4 h-9 text-xs transition-all shadow-sm">
                            {campaignBtnText || "Quero Aproveitar"}
                          </button>
                        </div>
                      </div>
                      <div className="w-full md:w-[220px] h-[125px] relative rounded-xl overflow-hidden shrink-0 shadow-sm border border-emerald-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={campaignImageUrl || "/images/banners/banner-3.png"} 
                          alt="Promo Híbridos"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
                          }}
                        />
                      </div>
                    </div>
                  )}
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
