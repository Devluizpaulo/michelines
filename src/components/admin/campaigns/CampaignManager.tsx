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
    }
  }, [landingSettings])

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

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <CampaignExporter landingSettings={{
                ...landingSettings,
                showCampaignBanner,
                campaignText,
                campaignSubtitle,
                campaignBtnText,
                campaignBtnUrl,
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
