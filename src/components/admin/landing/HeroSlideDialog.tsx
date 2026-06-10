"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, addDoc, collection } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { HeroSlideType } from "@/types/hero-slide"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast-simple"
import { Eye, EyeOff, Image as ImageIcon, Film, UploadCloud, Loader2 } from "lucide-react"
import { MediaSelectorDialog } from "../shared/MediaSelectorDialog"

interface HeroSlideDialogProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  slide: HeroSlideType | null
  slidesCount: number
}

const EMPTY_FORM: Partial<HeroSlideType> = {
  active: true,
  order: 0,
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
  theme: "navy",
  showTextOverlay: true,
  textAlignment: "center",
  titleWeight: "black",
  subtitleWeight: "medium",
  bgOpacity: 14,
  heroHeight: "fullscreen",
  imageFit: "cover",
  clickableSlide: false,
  destinationUrl: "",
  displayPriority: 0,
  startDate: "",
  endDate: "",
}

const formatDateForInput = (isoString?: string) => {
  if (!isoString) return ""
  try {
    const date = new Date(isoString)
    const tzOffset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
  } catch (e) {
    return ""
  }
}

export function HeroSlideDialog({ open, onClose, onSaved, slide, slidesCount }: HeroSlideDialogProps) {
  const { success, error: showError } = useToast()
  const [form, setForm] = useState<Partial<HeroSlideType>>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [libraryField, setLibraryField] = useState<"image" | "mobileImage" | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "mobileImage" | "video") => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploadingField(field)

    try {
      // Clean filename for storage
      const cleanName = file.name
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "")
        .toLowerCase()
      const slug = form.title
        ? form.title
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/[\s-]+/g, "-")
        : "slide"
      const remotePath = `${slug}/${Date.now()}_${cleanName}`

      const formData = new FormData()
      formData.append("bucket", "banners")
      formData.append("path", remotePath)
      formData.append("file", file)

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        showError("Erro no upload", json.error || "Erro na API.")
      } else {
        set(field, json.url)
        success("Upload concluído!", "O arquivo foi enviado para o Supabase e o campo foi atualizado.")
      }
    } catch (err: any) {
      console.error("Erro no upload:", err)
      showError("Erro no upload", "Ocorreu um erro inesperado ao enviar o arquivo.")
    } finally {
      setUploadingField(null)
      e.target.value = "" // reset input
    }
  }

  // Sync form when slide prop changes
  useEffect(() => {
    if (slide) {
      setForm(slide)
    } else {
      setForm({ ...EMPTY_FORM, order: slidesCount })
    }
  }, [slide, slidesCount, open])

  const set = (key: keyof HeroSlideType, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (slide?.id) {
        const slideRef = doc(db, "hero_slides", slide.id)
        await updateDoc(slideRef, { ...form, updatedAt: new Date().toISOString() })
        success("Slide atualizado!", `"${form.title}" foi salvo com sucesso.`)
      } else {
        await addDoc(collection(db, "hero_slides"), {
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        success("Slide criado!", `"${form.title}" foi adicionado ao carrossel.`)
      }
      onSaved()
      onClose()
    } catch (e: any) {
      console.error("Erro ao salvar slide:", e)
      showError("Erro ao salvar slide", e?.message || "Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const themeColors: Record<string, string> = {
    navy: "bg-sky-50 border-sky-200 text-sky-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-2xl overflow-y-auto max-h-[92vh]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              {slide ? "Editar Slide" : "Novo Slide"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Configure os textos, imagem, vídeo e call-to-action do slide no topo da Home.
            </DialogDescription>
          </DialogHeader>

          {/* Theme preview badge */}
          {form.theme && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${themeColors[form.theme] || "bg-slate-50 border-slate-200 text-slate-600"}`}>
              <span className={`h-2 w-2 rounded-full ${
                form.theme === "navy" ? "bg-sky-600" :
                form.theme === "amber" ? "bg-amber-500" : "bg-emerald-500"
              }`} />
              Tema {form.theme === "navy" ? "Navy Blue" : form.theme === "amber" ? "Amber Gold" : "Emerald"}
            </div>
          )}

          {/* Row: Ordem + Tema + Overlay */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ordem</label>
              <Input
                type="number"
                value={form.order ?? 0}
                onChange={(e) => set("order", Number(e.target.value))}
                className="bg-white border-slate-200 text-slate-800 h-9"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tema Visual</label>
              <Select value={form.theme} onValueChange={(v) => set("theme", v)}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-9">
                  <SelectValue placeholder="Tema" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-700">
                  <SelectItem value="navy">Navy Blue</SelectItem>
                  <SelectItem value="amber">Amber Gold</SelectItem>
                  <SelectItem value="emerald">Emerald Eco</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overlay</label>
              <Select value={form.overlay} onValueChange={(v) => set("overlay", v)}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-9">
                  <SelectValue placeholder="Overlay" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-700">
                  <SelectItem value="gradient">Gradiente</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="none">Sem overlay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Badge */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Badge Superior (opcional)</label>
            <Input
              value={form.badge || ""}
              onChange={(e) => set("badge", e.target.value)}
              placeholder="Ex: Grupo Michelines — Mobilidade Premium"
              className="bg-white border-slate-200 text-slate-800 h-9"
            />
          </div>

          {/* Título + Glow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Título Principal</label>
              <Input
                value={form.title || ""}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Ex: Mobilidade profissional urbana."
                className="bg-white border-slate-200 text-slate-800 h-9"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Título Glow (gradiente colorido)</label>
              <Input
                value={form.glowTitle || ""}
                onChange={(e) => set("glowTitle", e.target.value)}
                placeholder="Ex: Sua jornada executiva."
                className="bg-white border-slate-200 text-slate-800 h-9"
              />
            </div>
          </div>

          {/* Subtítulo */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subtítulo / Descrição</label>
            <Input
              value={form.subtitle || ""}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="Ex: Plataforma de suporte completo e veículos de alta eficiência..."
              className="bg-white border-slate-200 text-slate-800 h-9"
              required
            />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Texto do Botão (CTA)</label>
              <Input
                value={form.ctaText || ""}
                onChange={(e) => set("ctaText", e.target.value)}
                placeholder="Ex: Iniciar Cadastro"
                className="bg-white border-slate-200 text-slate-800 h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">URL do Botão</label>
              <Input
                value={form.ctaUrl || ""}
                onChange={(e) => set("ctaUrl", e.target.value)}
                placeholder="Ex: /cadastro"
                className="bg-white border-slate-200 text-slate-800 h-9"
              />
            </div>
          </div>

          {/* Clique do Slide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => set("clickableSlide", !form.clickableSlide)}
                className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ${form.clickableSlide ? "bg-sky-600" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.clickableSlide ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className="text-[11px] font-bold text-slate-700">
                Tornar Slide Inteiro Clicável (CTA Invisível)
              </span>
            </div>
            {form.clickableSlide && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">URL de Destino do Clique</label>
                <Input
                  value={form.destinationUrl || ""}
                  onChange={(e) => set("destinationUrl", e.target.value)}
                  placeholder="Ex: /showroom ou link do WhatsApp"
                  className="bg-white border-slate-200 text-slate-800 h-9"
                />
              </div>
            )}
          </div>

          {/* Layout & Estilos (Estilo Canva/Banner) */}
          <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              🎨 Layout & Estilos (Estilo Canva)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Text Overlay Toggle */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => set("showTextOverlay", !form.showTextOverlay)}
                  className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ${form.showTextOverlay ? "bg-sky-600" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.showTextOverlay ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className="text-[11px] font-bold text-slate-700">
                  Exibir Textos sobre a Imagem (Overlay)
                </span>
              </div>

              {/* Background Opacity */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Opacidade do Fundo ({form.bgOpacity ?? 14}%)</label>
                <Select
                  value={String(form.bgOpacity ?? 14)}
                  onValueChange={(v) => set("bgOpacity", Number(v))}
                >
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-9">
                    <SelectValue placeholder="Opacidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-700">
                    <SelectItem value="10">10% (Muito Escuro)</SelectItem>
                    <SelectItem value="14">14% (Padrão)</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="100">100% (Sem Escurecer / Flyer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.showTextOverlay && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200/50">
                {/* Text Alignment */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alinhamento</label>
                  <Select
                    value={form.textAlignment || "center"}
                    onValueChange={(v) => set("textAlignment", v)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-9">
                      <SelectValue placeholder="Alinhamento" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                      <SelectItem value="left">Esquerda</SelectItem>
                      <SelectItem value="center">Centralizado</SelectItem>
                      <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title Weight */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Espessura do Título</label>
                  <Select
                    value={form.titleWeight || "black"}
                    onValueChange={(v) => set("titleWeight", v)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-9">
                      <SelectValue placeholder="Espessura" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="semibold">Semi-negrito</SelectItem>
                      <SelectItem value="bold">Negrito</SelectItem>
                      <SelectItem value="black">Extra-Negrito (Black)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subtitle Weight */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Espessura do Subtítulo</label>
                  <Select
                    value={form.subtitleWeight || "medium"}
                    onValueChange={(v) => set("subtitleWeight", v)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-9">
                      <SelectValue placeholder="Espessura" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="semibold">Semi-negrito</SelectItem>
                      <SelectItem value="bold">Negrito</SelectItem>
                      <SelectItem value="black">Extra-Negrito (Black)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Height Control */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Altura do Banner (Hero Height)</label>
                <Select
                  value={form.heroHeight || "fullscreen"}
                  onValueChange={(v) => set("heroHeight", v)}
                >
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-9">
                    <SelectValue placeholder="Altura" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-700">
                    <SelectItem value="sm">Pequeno (sm - 350px)</SelectItem>
                    <SelectItem value="md">Médio (md - 450px)</SelectItem>
                    <SelectItem value="lg">Grande (lg - 550px)</SelectItem>
                    <SelectItem value="fullscreen">Tela Cheia (fullscreen - 70vh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Fit Control */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ajuste da Imagem (Image Fit)</label>
                <Select
                  value={form.imageFit || "cover"}
                  onValueChange={(v) => set("imageFit", v)}
                >
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800 h-9">
                    <SelectValue placeholder="Ajuste" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-700">
                    <SelectItem value="cover">Preencher com Corte (Cover - Padrão)</SelectItem>
                    <SelectItem value="contain">Ajustar sem Cortes (Contain - Ideal para Canva)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Agendamento e Prioridade de Exibição */}
          <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              📅 Marketing & Vigência de Campanha
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Display Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Prioridade de Exibição</label>
                <Input
                  type="number"
                  value={form.displayPriority ?? 0}
                  onChange={(e) => set("displayPriority", Number(e.target.value))}
                  placeholder="Ex: 5"
                  className="bg-white border-slate-200 text-slate-800 h-9"
                />
                <span className="text-[8px] text-slate-400 font-medium">Números maiores aparecem primeiro</span>
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Data de Início</label>
                <Input
                  type="datetime-local"
                  value={formatDateForInput(form.startDate)}
                  onChange={(e) => {
                    const date = e.target.value
                    if (!date) set("startDate", "")
                    else set("startDate", new Date(date).toISOString())
                  }}
                  className="bg-white border-slate-200 text-slate-800 h-9 text-xs"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Data de Expiração</label>
                <Input
                  type="datetime-local"
                  value={formatDateForInput(form.endDate)}
                  onChange={(e) => {
                    const date = e.target.value
                    if (!date) set("endDate", "")
                    else set("endDate", new Date(date).toISOString())
                  }}
                  className="bg-white border-slate-200 text-slate-800 h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Imagens */}
          <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> Imagens de Fundo
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-500">Desktop (obrigatório)</label>
                <div className="flex gap-2">
                  <Input
                    value={form.image || ""}
                    onChange={(e) => set("image", e.target.value)}
                    placeholder="/images/banners/1.jpg"
                    className="bg-white border-slate-200 text-slate-800 h-9 text-xs flex-1"
                    required
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setLibraryField("image")}
                    className="h-9 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shrink-0"
                  >
                    Galeria
                  </Button>
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e, "image")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      disabled={uploadingField !== null}
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={uploadingField !== null}
                      className="h-9 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      {uploadingField === "image" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="h-3.5 w-3.5" />
                      )}
                      {uploadingField === "image" ? "..." : "Upload"}
                    </Button>
                  </div>
                </div>
                {/* Desktop Image Preview */}
                {form.image && (
                  <div className="relative aspect-[16/7] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image}
                      alt="Preview desktop"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 to-transparent px-2 py-1.5">
                      <span className="text-[9px] text-white/80 font-bold uppercase tracking-widest">Preview Desktop</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-500">Mobile (opcional)</label>
                <div className="flex gap-2">
                  <Input
                    value={form.mobileImage || ""}
                    onChange={(e) => set("mobileImage", e.target.value)}
                    placeholder="/images/banners/1-mobile.jpg"
                    className="bg-white border-slate-200 text-slate-800 h-9 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setLibraryField("mobileImage")}
                    className="h-9 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shrink-0"
                  >
                    Galeria
                  </Button>
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e, "mobileImage")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      disabled={uploadingField !== null}
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={uploadingField !== null}
                      className="h-9 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      {uploadingField === "mobileImage" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="h-3.5 w-3.5" />
                      )}
                      {uploadingField === "mobileImage" ? "..." : "Upload"}
                    </Button>
                  </div>
                </div>
                {/* Mobile Image Preview */}
                {form.mobileImage && (
                  <div className="relative aspect-[9/16] w-[80px] rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.mobileImage}
                      alt="Preview mobile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 to-transparent px-1 py-1">
                      <span className="text-[8px] text-white/80 font-bold uppercase tracking-widest">Mobile</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vídeo */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5" /> Link Vídeo MP4 — Desktop (opcional, substitui imagem)
            </label>
            <div className="flex gap-2">
              <Input
                value={form.video || ""}
                onChange={(e) => set("video", e.target.value)}
                placeholder="https://... .mp4"
                className="bg-white border-slate-200 text-slate-800 h-9 text-xs flex-1"
              />
              <div className="relative shrink-0">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleUpload(e, "video")}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={uploadingField !== null}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={uploadingField !== null}
                  className="h-9 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all flex items-center gap-1"
                >
                  {uploadingField === "video" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="h-3.5 w-3.5" />
                  )}
                  {uploadingField === "video" ? "..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>

          {/* Publicar toggle */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => set("active", !form.active)}
              className={`relative h-5 w-9 rounded-full transition-colors ${form.active ? "bg-sky-600" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              {form.active ? <Eye className="h-3.5 w-3.5 text-sky-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
              {form.active ? "Slide publicado na Home" : "Slide oculto (rascunho)"}
            </span>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold min-w-[120px]"
            >
              {saving ? "Salvando..." : slide ? "Salvar Alterações" : "Criar Slide"}
            </Button>
          </DialogFooter>
          <MediaSelectorDialog
            open={libraryField !== null}
            onClose={() => setLibraryField(null)}
            onSelect={(url) => {
              if (libraryField) {
                set(libraryField, url)
              }
            }}
            bucket="banners"
            title="Biblioteca de Imagens — Banners"
            description="Selecione um banner já enviado para o seu storage do Supabase."
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
