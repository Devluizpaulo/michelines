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
import { Eye, EyeOff, Image as ImageIcon, Film } from "lucide-react"

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
}

export function HeroSlideDialog({ open, onClose, onSaved, slide, slidesCount }: HeroSlideDialogProps) {
  const { success, error: showError } = useToast()
  const [form, setForm] = useState<Partial<HeroSlideType>>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

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

          {/* Imagens */}
          <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> Imagens de Fundo
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500">Desktop (obrigatório)</label>
                <Input
                  value={form.image || ""}
                  onChange={(e) => set("image", e.target.value)}
                  placeholder="/images/banners/1.jpg"
                  className="bg-white border-slate-200 text-slate-800 h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500">Mobile (opcional)</label>
                <Input
                  value={form.mobileImage || ""}
                  onChange={(e) => set("mobileImage", e.target.value)}
                  placeholder="/images/banners/1-mobile.jpg"
                  className="bg-white border-slate-200 text-slate-800 h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Vídeo */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5" /> Link Vídeo MP4 — Desktop (opcional, substitui imagem)
            </label>
            <Input
              value={form.video || ""}
              onChange={(e) => set("video", e.target.value)}
              placeholder="https://... .mp4"
              className="bg-white border-slate-200 text-slate-800 h-9 text-xs"
            />
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
