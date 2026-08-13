"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Plus, Link2, Copy, Check, ExternalLink, Trash2, Pencil, Loader2,
  ImageIcon, Eye, MousePointerClick, Users, X, Megaphone, Instagram,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Lead } from "@/types/lead"
import {
  Campaign, CampaignStatus, CampaignTheme,
  CAMPAIGN_STATUS_LABELS, CAMPAIGN_THEMES,
  slugifyCampaign, campaignPublicUrl,
} from "@/types/campaign"
import {
  listCampaigns, createCampaign, updateCampaign, deleteCampaign, CampaignInput,
} from "@/lib/campaigns-crud"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/toast-simple"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MediaSelectorDialog } from "@/components/admin/shared/MediaSelectorDialog"
import { CampaignSharePanel } from "./CampaignSharePanel"

const EMPTY_FORM: CampaignInput = {
  slug: "",
  name: "",
  status: "draft",
  headline: "",
  subheadline: "",
  description: "",
  imageUrl: "",
  highlights: [],
  ctaText: "Quero me cadastrar",
  vehicleInterest: "",
  theme: "navy",
  startDate: "",
  endDate: "",
}

interface CampaignBuilderProps {
  /** Leads já carregados pelo painel — usados para atribuição por campanha. */
  leads: Lead[]
}

/**
 * Criador de campanhas com página própria.
 *
 * Cada campanha gera uma URL /c/{slug} para colar na bio do Instagram ou mandar
 * no WhatsApp. O CTA da página leva ao cadastro carregando o `campaignId`, então
 * os leads voltam atribuídos e a conversão aparece aqui na listagem.
 */
export function CampaignBuilder({ leads }: CampaignBuilderProps) {
  const { adminUser } = useAuth()
  const { success, error: showError } = useToast()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<CampaignInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [highlightDraft, setHighlightDraft] = useState("")

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setCampaigns(await listCampaigns())
    } catch (e) {
      console.error("Erro ao carregar campanhas:", e)
      showError("Erro ao carregar", "Não foi possível buscar as campanhas.")
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => { load() }, [load])

  /** Leads atribuídos a cada campanha, contados uma única vez. */
  const leadsByCampaign = useMemo(() => {
    const map = new Map<string, number>()
    for (const lead of leads) {
      if (!lead.campaignId) continue
      map.set(lead.campaignId, (map.get(lead.campaignId) || 0) + 1)
    }
    return map
  }, [leads])

  const set = <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const openNew = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setHighlightDraft("")
    setFormOpen(true)
  }

  const openEdit = (campaign: Campaign) => {
    setForm({
      slug: campaign.slug,
      name: campaign.name,
      status: campaign.status,
      headline: campaign.headline,
      subheadline: campaign.subheadline || "",
      description: campaign.description || "",
      imageUrl: campaign.imageUrl || "",
      highlights: campaign.highlights || [],
      ctaText: campaign.ctaText || "Quero me cadastrar",
      vehicleInterest: campaign.vehicleInterest || "",
      theme: campaign.theme || "navy",
      startDate: campaign.startDate || "",
      endDate: campaign.endDate || "",
    })
    setEditingId(campaign.id)
    setHighlightDraft("")
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      showError("Nome obrigatório", "Dê um nome à campanha para identificá-la no painel.")
      return
    }
    if (!form.headline.trim()) {
      showError("Título obrigatório", "O título é a primeira coisa que o candidato lê na página.")
      return
    }

    setSaving(true)
    try {
      const payload: CampaignInput = {
        ...form,
        name: form.name.trim(),
        headline: form.headline.trim(),
        slug: form.slug.trim() || slugifyCampaign(form.name),
      }

      if (editingId) {
        await updateCampaign(editingId, payload)
        success("Campanha atualizada!", "As alterações já estão no ar.")
      } else {
        const created = await createCampaign(payload, adminUser?.displayName)
        success("Campanha criada!", `Página publicada em /c/${created.slug}`)
      }

      setFormOpen(false)
      setEditingId(null)
      await load()
    } catch (e: any) {
      console.error("Erro ao salvar campanha:", e)
      showError("Erro ao salvar", e?.message || "Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (campaign: Campaign) => {
    if (!window.confirm(`Excluir a campanha "${campaign.name}"?\n\nA página /c/${campaign.slug} sairá do ar. Os leads já captados continuam no funil.`)) return
    try {
      await deleteCampaign(campaign.id)
      success("Campanha excluída", "A página foi removida.")
      await load()
    } catch (e) {
      showError("Erro ao excluir", "Não foi possível remover a campanha.")
    }
  }

  const handleStatusToggle = async (campaign: Campaign) => {
    const next: CampaignStatus = campaign.status === "active" ? "paused" : "active"
    try {
      await updateCampaign(campaign.id, { status: next })
      success(
        next === "active" ? "Campanha ativada!" : "Campanha pausada",
        next === "active" ? "A página já está acessível." : "A página sai do ar até ser reativada."
      )
      await load()
    } catch (e) {
      showError("Erro ao alterar status", "Tente novamente.")
    }
  }

  const handleCopyLink = async (campaign: Campaign) => {
    try {
      await navigator.clipboard.writeText(campaignPublicUrl(campaign.slug))
      setCopiedId(campaign.id)
      success("Link copiado!", "Cole na bio do Instagram ou mande no WhatsApp.")
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      showError("Não foi possível copiar", "Copie o link manualmente.")
    }
  }

  const addHighlight = () => {
    const text = highlightDraft.trim()
    if (!text) return
    set("highlights", [...(form.highlights || []), text])
    setHighlightDraft("")
  }

  const previewSlug = form.slug.trim() || slugifyCampaign(form.name) || "sua-campanha"

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-black text-slate-900">
            <Megaphone className="h-4 w-4 shrink-0 text-sky-600" />
            Campanhas com página própria
          </h3>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            Cada campanha vira um link /c/… para a bio do Instagram. Os leads que entram por ele voltam atribuídos.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0 gap-1.5 bg-sky-600 font-bold hover:bg-sky-700">
          <Plus className="h-4 w-4" /> Nova campanha
        </Button>
      </div>

      {/* ── Formulário ── */}
      {formOpen && (
        <div className="space-y-5 rounded-2xl border border-sky-200 bg-sky-50/40 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              {editingId ? "Editar campanha" : "Nova campanha"}
            </h4>
            <button
              onClick={() => { setFormOpen(false); setEditingId(null) }}
              className="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-slate-600"
              aria-label="Fechar formulário"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da campanha" hint="Só aparece no painel">
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ex.: Feirão Híbrido — Instagram Janeiro"
                className="h-11 border-slate-200 bg-white text-sm"
              />
            </Field>

            <Field label="Endereço da página" hint={`michelines.com.br/c/${previewSlug}`}>
              <Input
                value={form.slug}
                onChange={(e) => set("slug", slugifyCampaign(e.target.value))}
                placeholder="gerado a partir do nome"
                className="h-11 border-slate-200 bg-white font-mono text-sm"
              />
            </Field>
          </div>

          <Field label="Título (o que o candidato lê primeiro)">
            <Input
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
              placeholder="Ex.: Diárias a partir de R$ 57 no Corolla Híbrido"
              className="h-11 border-slate-200 bg-white text-sm"
            />
          </Field>

          <Field label="Subtítulo" hint="Opcional — reforça a oferta">
            <Input
              value={form.subheadline}
              onChange={(e) => set("subheadline", e.target.value)}
              placeholder="Ex.: Retirada em 24h, sem consulta de score"
              className="h-11 border-slate-200 bg-white text-sm"
            />
          </Field>

          <Field label="Descrição" hint="Opcional — o parágrafo de apoio">
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Explique a condição, o prazo e o que está incluso."
              className="min-h-[80px] border-slate-200 bg-white text-sm"
            />
          </Field>

          {/* Imagem */}
          <Field label="Imagem da campanha" hint="Também vira a prévia ao compartilhar o link">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://…"
                className="h-11 flex-1 border-slate-200 bg-white text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setMediaOpen(true)}
                className="h-11 shrink-0 gap-1.5 border-slate-200 bg-white font-bold"
              >
                <ImageIcon className="h-4 w-4" /> Escolher
              </Button>
            </div>
            {form.imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={form.imageUrl}
                alt="Prévia"
                className="mt-2 h-32 w-full rounded-xl border border-slate-200 object-cover"
              />
            )}
          </Field>

          {/* Destaques */}
          <Field label="Destaques" hint="Selos exibidos na página">
            <div className="flex gap-2">
              <Input
                value={highlightDraft}
                onChange={(e) => setHighlightDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHighlight() } }}
                placeholder="Ex.: Manutenção e seguro inclusos"
                className="h-11 flex-1 border-slate-200 bg-white text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addHighlight}
                className="h-11 shrink-0 border-slate-200 bg-white font-bold"
              >
                Adicionar
              </Button>
            </div>
            {form.highlights && form.highlights.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700"
                  >
                    {h}
                    <button
                      onClick={() => set("highlights", form.highlights!.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-red-600"
                      aria-label={`Remover ${h}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Texto do botão">
              <Input
                value={form.ctaText}
                onChange={(e) => set("ctaText", e.target.value)}
                placeholder="Quero me cadastrar"
                className="h-11 border-slate-200 bg-white text-sm"
              />
            </Field>

            <Field label="Veículo do cadastro" hint="Opcional — já preenche o formulário">
              <Input
                value={form.vehicleInterest}
                onChange={(e) => set("vehicleInterest", e.target.value)}
                placeholder="Ex.: Toyota Corolla Sedan"
                className="h-11 border-slate-200 bg-white text-sm"
              />
            </Field>
          </div>

          {/* Tema */}
          <Field label="Cor da página">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CAMPAIGN_THEMES) as CampaignTheme[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("theme", key)}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all",
                    form.theme === key
                      ? "border-sky-500 bg-white text-slate-900 shadow-sm ring-2 ring-sky-200"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: CAMPAIGN_THEMES[key].swatch }}
                  />
                  {CAMPAIGN_THEMES[key].label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Início" hint="Opcional">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="h-11 border-slate-200 bg-white text-sm"
              />
            </Field>
            <Field label="Fim" hint="Opcional">
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="h-11 border-slate-200 bg-white text-sm"
              />
            </Field>
            <Field label="Situação">
              <div className="grid grid-cols-2 gap-1.5">
                {(["draft", "active"] as CampaignStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className={cn(
                      "min-h-11 rounded-xl border text-xs font-bold transition-all",
                      form.status === s
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {s === "draft" ? "Rascunho" : "Publicar"}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => { setFormOpen(false); setEditingId(null) }}
              className="min-h-11 border-slate-200 bg-white font-bold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-h-11 gap-2 bg-sky-600 font-bold hover:bg-sky-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingId ? "Salvar alterações" : "Criar campanha"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Listagem ── */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm font-semibold text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando campanhas...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center">
          <Instagram className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-bold text-slate-600">Nenhuma campanha criada ainda.</p>
          <p className="max-w-xs text-xs font-medium text-slate-400">
            Crie a primeira para gerar um link exclusivo e medir quantos leads ele traz.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const leadCount = leadsByCampaign.get(campaign.id) || 0
            const ctr = campaign.views > 0 ? (campaign.clicks / campaign.views) * 100 : 0
            const conv = campaign.clicks > 0 ? (leadCount / campaign.clicks) * 100 : 0
            const statusInfo = CAMPAIGN_STATUS_LABELS[campaign.status]

            return (
              <div
                key={campaign.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{campaign.name}</h4>
                      <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-black uppercase", statusInfo.color)}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 font-mono text-[11px] font-bold text-sky-600">
                      <Link2 className="h-3 w-3 shrink-0" />
                      /c/{campaign.slug}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <IconAction onClick={() => handleCopyLink(campaign)} label="Copiar link">
                      {copiedId === campaign.id
                        ? <Check className="h-4 w-4 text-emerald-600" />
                        : <Copy className="h-4 w-4" />}
                    </IconAction>
                    <a href={`/c/${campaign.slug}`} target="_blank" rel="noopener noreferrer">
                      <IconAction label="Abrir página"><ExternalLink className="h-4 w-4" /></IconAction>
                    </a>
                    <IconAction onClick={() => openEdit(campaign)} label="Editar">
                      <Pencil className="h-4 w-4" />
                    </IconAction>
                    <IconAction onClick={() => handleDelete(campaign)} label="Excluir" danger>
                      <Trash2 className="h-4 w-4" />
                    </IconAction>
                  </div>
                </div>

                {/* Métricas do funil da campanha */}
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-5">
                  <Metric icon={Eye} label="Visitas" value={campaign.views ?? 0} />
                  <Metric icon={MousePointerClick} label="Cliques" value={campaign.clicks ?? 0} />
                  <Metric label="CTR" value={`${ctr.toFixed(1)}%`} />
                  <Metric icon={Users} label="Leads" value={leadCount} highlight />
                  <Metric label="Conversão" value={`${conv.toFixed(1)}%`} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusToggle(campaign)}
                    className={cn(
                      "min-h-9 rounded-lg border px-3 text-xs font-bold transition-colors",
                      campaign.status === "active"
                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    )}
                  >
                    {campaign.status === "active" ? "Pausar" : "Ativar"}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${campaign.headline}\n\n${campaignPublicUrl(campaign.slug)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    Compartilhar no WhatsApp
                  </a>
                </div>

                <CampaignSharePanel campaign={campaign} />
              </div>
            )
          })}
        </div>
      )}

      <MediaSelectorDialog
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => { set("imageUrl", url); setMediaOpen(false) }}
        bucket="banners"
        title="Imagem da campanha"
        description="Escolha a arte que aparece na página e na prévia do link."
      />
    </div>
  )
}

// ─── Auxiliares de layout ─────────────────────────────────────────────────────

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
        {label}
        {hint && <span className="ml-1.5 font-bold normal-case tracking-normal text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function IconAction({
  onClick, label, danger, children,
}: { onClick?: () => void; label: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors",
        danger ? "text-red-500 hover:bg-red-50" : "text-slate-500 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  )
}

function Metric({
  icon: Icon, label, value, highlight,
}: { icon?: React.ElementType; label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
        {Icon && <Icon className="h-3 w-3 shrink-0" />}
        {label}
      </p>
      <p className={cn("mt-0.5 text-sm font-black", highlight ? "text-sky-600" : "text-slate-900")}>
        {value}
      </p>
    </div>
  )
}
