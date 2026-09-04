"use client"

import React, { useState, useMemo } from "react"
import {
  ArrowUp, ArrowDown, Eye, EyeOff, Plus, Trash2, Copy, Edit3, Smartphone,
  Monitor, Check, Sparkles, Megaphone, Share2, Layers, HelpCircle, Save, ExternalLink
} from "lucide-react"
import { Campaign } from "@/types/campaign"
import { CampaignSection, SectionType, DEFAULT_4V_SECTIONS } from "@/types/campaign-studio"
import { DynamicLandingRenderer } from "@/components/public/campaign-sections/DynamicLandingRenderer"
import { updateCampaign } from "@/lib/campaigns-crud"
import { useToast } from "@/components/ui/toast-simple"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { JsonAiModal } from "../JsonAiModal"

interface CampaignStudioProps {
  campaign: Campaign
  onCampaignUpdated: () => void
  onClose?: () => void
}

export function CampaignStudio({ campaign, onCampaignUpdated, onClose }: CampaignStudioProps) {
  const { success, error: showError } = useToast()

  // State of sections (defaults to 4V template if empty)
  const [sections, setSections] = useState<CampaignSection[]>(() => {
    if (campaign.sections && campaign.sections.length > 0) {
      return campaign.sections
    }
    return DEFAULT_4V_SECTIONS
  })

  const [saving, setSaving] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(sections[0]?.id || null)
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile")
  const [jsonModalOpen, setJsonModalOpen] = useState(false)

  // Handle section import from LLM JSON
  const handleImportSections = (newSections: CampaignSection[], append: boolean) => {
    const formatted = newSections.map((sec, idx) => ({
      ...sec,
      id: sec.id || `sec_${sec.type || "custom"}_${Date.now()}_${idx}`,
      enabled: sec.enabled !== undefined ? sec.enabled : true,
    }))

    if (append) {
      setSections((prev) => {
        const startIdx = prev.length
        const reordered = formatted.map((s, i) => ({ ...s, order: startIdx + i }))
        const next = [...prev, ...reordered]
        if (reordered[0]) setActiveSectionId(reordered[0].id)
        return next
      })
    } else {
      const reordered = formatted.map((s, i) => ({ ...s, order: i }))
      setSections(reordered)
      if (reordered[0]) setActiveSectionId(reordered[0].id)
    }
  }

  // UTM Generator State
  const [utmSource, setUtmSource] = useState("facebook")
  const [utmMedium, setUtmMedium] = useState("cpc")
  const [utmCampaign, setUtmCampaign] = useState(campaign.slug)
  const [copiedUtm, setCopiedUtm] = useState(false)

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) || sections[0],
    [sections, activeSectionId]
  )

  // Save Sections to Supabase
  const handleSave = async () => {
    try {
      setSaving(true)
      await updateCampaign(campaign.id, {
        sections: sections,
      })
      success("Landing Page salva!", "Todas as seções do Estúdio 4V foram atualizadas.")
      onCampaignUpdated()
    } catch (err: any) {
      console.error(err)
      showError("Erro ao salvar seções", err?.message || "Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  // Move Section Up/Down
  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= sections.length) return

    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[targetIdx]
    newSections[targetIdx] = temp

    // Reassign orders
    const ordered = newSections.map((sec, idx) => ({ ...sec, order: idx }))
    setSections(ordered)
  }

  // Toggle Enable/Disable
  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  // Duplicate Section
  const duplicateSection = (sec: CampaignSection) => {
    const newSec: CampaignSection = {
      ...JSON.parse(JSON.stringify(sec)),
      id: `sec_${sec.type}_${Date.now()}`,
      order: sections.length,
    }
    setSections([...sections, newSec])
    setActiveSectionId(newSec.id)
    success("Seção duplicada", "Nova seção adicionada ao estúdio.")
  }

  // Delete Section
  const deleteSection = (id: string) => {
    if (sections.length <= 1) {
      showError("Atenção", "A landing page precisa ter pelo menos uma seção.")
      return
    }
    const filtered = sections.filter((s) => s.id !== id)
    setSections(filtered)
    if (activeSectionId === id) {
      setActiveSectionId(filtered[0]?.id || null)
    }
  }

  // Add New Section
  const addSection = (type: SectionType) => {
    const newSec = createDefaultSection(type, sections.length)
    setSections([...sections, newSec])
    setActiveSectionId(newSec.id)
    success("Seção adicionada", `Bloco '${type}' inserido na página.`)
  }

  // Update Section Config Field
  const updateActiveSectionField = (field: string, value: any) => {
    if (!activeSection) return
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === activeSection.id) {
          return { ...s, [field]: value }
        }
        return s
      })
    )
  }

  // Campaign with current editing sections for Live Preview
  const previewCampaign: Campaign = useMemo(
    () => ({
      ...campaign,
      sections: sections,
    }),
    [campaign, sections]
  )

  // Generate UTM Link
  const generatedUtmUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://grupomichelines.com.br"
    const base = `${origin}/c/${campaign.slug}`
    const params = new URLSearchParams()
    if (utmSource) params.set("utm_source", utmSource)
    if (utmMedium) params.set("utm_medium", utmMedium)
    if (utmCampaign) params.set("utm_campaign", utmCampaign)
    const str = params.toString()
    return str ? `${base}?${str}` : base
  }, [campaign.slug, utmSource, utmMedium, utmCampaign])

  const copyUtmLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedUtmUrl)
      setCopiedUtm(true)
      success("Link de Anúncio Copiado!", "Cole no seu anúncio do Facebook / Instagram Ads.")
      setTimeout(() => setCopiedUtm(false), 2000)
    } catch {
      showError("Erro ao copiar", "Copie o link manualmente.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Studio Header Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-950">
              Bíblia 4V Studio
            </span>
            <h3 className="text-base font-black tracking-tight">{campaign.name}</h3>
          </div>
          <p className="text-xs font-medium text-slate-300 mt-0.5">
            URL: <span className="font-mono text-amber-300">/c/{campaign.slug}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Device Preview Switcher */}
          <div className="flex items-center rounded-xl bg-slate-800 p-1 border border-slate-700">
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                previewDevice === "mobile" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                previewDevice === "desktop" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
          </div>

          <Button
            onClick={() => setJsonModalOpen(true)}
            variant="outline"
            className="h-10 text-xs border-amber-500/50 bg-slate-800 text-amber-400 font-bold hover:bg-slate-700 hover:text-amber-300 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 fill-amber-400" /> 🤖 IA / JSON
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-10 px-5 rounded-xl shadow-md gap-1.5"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Estúdio 4V"}
          </Button>

          {onClose && (
            <Button onClick={onClose} variant="outline" className="h-10 text-xs border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
              Voltar
            </Button>
          )}
        </div>
      </div>

      {/* Main Studio Grid: Editor vs Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Section List & Editor Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Section Organizer Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 shrink-0">
                <Layers className="h-4 w-4 text-violet-600" />
                Seções ({sections.length})
              </h4>
              
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setJsonModalOpen(true)}
                  className="h-8 px-2 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 flex items-center gap-1"
                  title="Importar ou adicionar seções via JSON"
                >
                  <Sparkles className="h-3 w-3 fill-amber-600" /> JSON / IA
                </button>

                {/* Add Section Select */}
                <Select onValueChange={(val) => addSection(val as SectionType)}>
                  <SelectTrigger className="h-8 text-[11px] font-bold bg-violet-50 text-violet-700 border-violet-200 w-[130px]">
                    <SelectValue placeholder="+ Seção" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="hero">Hero (V1/Atenção)</SelectItem>
                    <SelectItem value="context_empathy">Contexto (V2/Empatia)</SelectItem>
                    <SelectItem value="diferenciais_4v">Os 4Vs (V1/V2)</SelectItem>
                    <SelectItem value="vehicle_spotlight">Veículo em Destaque</SelectItem>
                    <SelectItem value="how_it_works">Como Funciona (V3)</SelectItem>
                    <SelectItem value="testimonials">Depoimentos (V3)</SelectItem>
                    <SelectItem value="earnings_calculator">Calculadora Ganhos</SelectItem>
                    <SelectItem value="faq_accordion">FAQ (Objeções)</SelectItem>
                    <SelectItem value="lead_form">Formulário Cadastro</SelectItem>
                    <SelectItem value="whatsapp_cta_banner">Banner WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* List of draggable/reorderable sections */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {sections.map((sec, idx) => {
                const isActive = activeSectionId === sec.id
                return (
                  <div
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-xs font-bold",
                      isActive
                        ? "border-violet-600 bg-violet-50/80 text-violet-950 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      !sec.enabled && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-500 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold">{getSectionLabel(sec.type)}</p>
                        <span className="text-[9px] text-slate-400 block uppercase tracking-wider">{sec.type}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSection(sec.id)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title={sec.enabled ? "Ocultar" : "Exibir"}
                      >
                        {sec.enabled ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                      </button>
                      <button
                        onClick={() => moveSection(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Mover para cima"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "down")}
                        disabled={idx === sections.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => duplicateSection(sec)}
                        className="p-1 text-slate-400 hover:text-violet-600"
                        title="Duplicar seção"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSection(sec.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Excluir seção"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Section Content Editor Drawer */}
          {activeSection && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-violet-200/60 pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-violet-900 flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4 text-violet-600" />
                  Editar: {getSectionLabel(activeSection.type)}
                </h4>
                <span className="text-[9px] font-bold text-violet-600 bg-white px-2 py-0.5 rounded-full border border-violet-200">
                  ID: {activeSection.id}
                </span>
              </div>

              {/* Dynamic form inputs based on active section type */}
              <SectionEditorForm
                section={activeSection}
                onChange={updateActiveSectionField}
              />
            </div>
          )}

          {/* UTM Link Generator Panel for Facebook Ads */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Share2 className="h-4 w-4" /> Rastreamento de Tráfego (Links para Anúncios)
            </h4>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              Gere o link parametrizado com tags UTM para colar no botão do anúncio do Facebook/Instagram Ads.
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Origem (utm_source)</label>
                <Input
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="facebook"
                  className="bg-slate-800 border-slate-700 text-white text-xs h-8 mt-1"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Meio (utm_medium)</label>
                <Input
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="cpc"
                  className="bg-slate-800 border-slate-700 text-white text-xs h-8 mt-1"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Campanha (utm_campaign)</label>
                <Input
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="hibridos"
                  className="bg-slate-800 border-slate-700 text-white text-xs h-8 mt-1"
                />
              </div>
            </div>

            <div className="pt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUtmUrl}
                  className="flex-1 bg-slate-950 border border-slate-800 text-amber-300 font-mono text-[10px] px-3 py-2 rounded-xl"
                />
                <Button
                  type="button"
                  onClick={copyUtmLink}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 rounded-xl shrink-0"
                >
                  {copiedUtm ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Live Preview Frame (7 cols) */}
        <div className="lg:col-span-7">
          <div className="sticky top-20 space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Prévia ao Vivo (Real-Time Live Preview)
              </span>
              <a
                href={`/c/${campaign.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                Abrir Página Pública <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Container Frame (Mobile Phone or Desktop Window) */}
            <div className="flex justify-center bg-slate-950/90 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
              <div
                className={cn(
                  "transition-all duration-300 overflow-hidden bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl relative",
                  previewDevice === "mobile"
                    ? "w-[375px] min-h-[720px] max-h-[820px] overflow-y-auto ring-8 ring-slate-800"
                    : "w-full min-h-[720px] max-h-[850px] overflow-y-auto"
                )}
              >
                <DynamicLandingRenderer campaign={previewCampaign} />
              </div>
            </div>
          </div>
        </div>

      </div>

      <JsonAiModal
        open={jsonModalOpen}
        onClose={() => setJsonModalOpen(false)}
        mode="import_sections"
        currentSections={sections}
        onImportSections={handleImportSections}
      />
    </div>
  )
}

// ── AUXILIARY EDITOR FORM BY SECTION TYPE ─────────────────────────────────────

function SectionEditorForm({
  section,
  onChange,
}: {
  section: CampaignSection
  onChange: (field: string, val: any) => void
}) {
  switch (section.type) {
    case "hero": {
      const s = section as any
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block">Título do Hero</label>
            <Input value={s.title || ""} onChange={(e) => onChange("title", e.target.value)} className="bg-white" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block">Subtítulo</label>
            <Textarea value={s.subtitle || ""} onChange={(e) => onChange("subtitle", e.target.value)} className="bg-white min-h-[60px]" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block">Selo / Badge (Ex: 45 anos de tradição)</label>
            <Input value={s.badgeText || ""} onChange={(e) => onChange("badgeText", e.target.value)} className="bg-white" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block">URL da Imagem</label>
            <Input value={s.imageUrl || ""} onChange={(e) => onChange("imageUrl", e.target.value)} className="bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block">Texto do Botão CTA</label>
              <Input value={s.primaryCtaText || ""} onChange={(e) => onChange("primaryCtaText", e.target.value)} className="bg-white" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block">Link do Botão CTA</label>
              <Input value={s.primaryCtaUrl || ""} onChange={(e) => onChange("primaryCtaUrl", e.target.value)} className="bg-white" />
            </div>
          </div>
        </div>
      )
    }

    case "vehicle_spotlight": {
      const s = section as any
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block">Nome do Veículo</label>
            <Input value={s.vehicleName || ""} onChange={(e) => onChange("vehicleName", e.target.value)} className="bg-white" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block">Categoria / Selo</label>
            <Input value={s.vehicleCategory || ""} onChange={(e) => onChange("vehicleCategory", e.target.value)} className="bg-white" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-700 block">Diária (R$)</label>
              <Input type="number" value={s.dailyRate || ""} onChange={(e) => onChange("dailyRate", Number(e.target.value))} className="bg-white" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block">Semanal (R$)</label>
              <Input type="number" value={s.weeklyRate || ""} onChange={(e) => onChange("weeklyRate", Number(e.target.value))} className="bg-white" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block">Mensal (R$)</label>
              <Input type="number" value={s.monthlyRate || ""} onChange={(e) => onChange("monthlyRate", Number(e.target.value))} className="bg-white" />
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-700 block">URL da Imagem do Carro</label>
            <Input value={s.imageUrl || ""} onChange={(e) => onChange("imageUrl", e.target.value)} className="bg-white" />
          </div>
        </div>
      )
    }

    default: {
      const s = section as any
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block">Título da Seção</label>
            <Input value={s.title || ""} onChange={(e) => onChange("title", e.target.value)} className="bg-white" />
          </div>
          <div>
            <label className="font-bold text-slate-700 block">Subtítulo / Descrição</label>
            <Textarea value={s.subtitle || ""} onChange={(e) => onChange("subtitle", e.target.value)} className="bg-white min-h-[60px]" />
          </div>
        </div>
      )
    }
  }
}

function getSectionLabel(type: SectionType): string {
  switch (type) {
    case "hero": return "Hero (Atenção & V1)"
    case "context_empathy": return "Contexto & Empatia (V2)"
    case "diferenciais_4v": return "Os 4Vs Michelines (V1/V2)"
    case "vehicle_spotlight": return "Veículo em Destaque (V1/V3)"
    case "how_it_works": return "Como Funciona em 4 Passos (V3)"
    case "testimonials": return "Depoimentos & Prova Social (V3)"
    case "earnings_calculator": return "Calculadora de Economia (V1)"
    case "faq_accordion": return "Perguntas Frequentes FAQ (V3/V4)"
    case "lead_form": return "Formulário de Cadastro (V4)"
    case "whatsapp_cta_banner": return "Banner WhatsApp (V4)"
    default: return "Seção Customizada"
  }
}

function createDefaultSection(type: SectionType, order: number): CampaignSection {
  const base = { id: `sec_${type}_${Date.now()}`, type, enabled: true, order }
  switch (type) {
    case "hero":
      return { ...base, type: "hero", title: "Nova Chamada Principal", subtitle: "Subtítulo de apoio da oferta." }
    case "context_empathy":
      return { ...base, type: "context_empathy", title: "Entendemos sua rotina", cards: [] }
    case "diferenciais_4v":
      return { ...base, type: "diferenciais_4v", title: "Os 4Vs da Experiência Michelines", items: [] }
    case "vehicle_spotlight":
      return { ...base, type: "vehicle_spotlight", title: "Veículo em Destaque", vehicleName: "Corolla Cross", features: [] }
    case "how_it_works":
      return { ...base, type: "how_it_works", title: "Como Funciona", steps: [] }
    case "testimonials":
      return { ...base, type: "testimonials", title: "Depoimentos de Motoristas", items: [] }
    case "earnings_calculator":
      return { ...base, type: "earnings_calculator", title: "Simulador de Economia" }
    case "faq_accordion":
      return { ...base, type: "faq_accordion", title: "Perguntas Frequentes", items: [] }
    case "lead_form":
      return { ...base, type: "lead_form", title: "Garanta seu Veículo" }
    case "whatsapp_cta_banner":
      return { ...base, type: "whatsapp_cta_banner", title: "Fale no WhatsApp" }
    default:
      return { ...base, type: "hero", title: "Título da Seção" }
  }
}
