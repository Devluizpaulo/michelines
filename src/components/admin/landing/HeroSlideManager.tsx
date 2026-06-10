"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { HeroSlideType } from "@/types/hero-slide"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HeroSlideDialog } from "./HeroSlideDialog"
import { useToast } from "@/components/ui/toast-simple"
import {
  Plus, Edit3, Trash2, Eye, EyeOff, GripVertical,
  Film, Image as ImageIcon, Layers, RefreshCw
} from "lucide-react"

const THEME_STYLES: Record<string, { badge: string; dot: string }> = {
  navy:    { badge: "bg-sky-50 text-sky-700 border-sky-200",     dot: "bg-sky-600" },
  amber:   { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  emerald: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
}

export function HeroSlideManager() {
  const { success, error: showError } = useToast()
  const [slides, setSlides] = useState<HeroSlideType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<HeroSlideType | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true)
      const q = query(collection(db, "hero_slides"), orderBy("order", "asc"))
      const snap = await getDocs(q)
      const list: HeroSlideType[] = []
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as HeroSlideType))
      setSlides(list)
    } catch (e) {
      console.error("Erro ao carregar slides:", e)
      showError("Erro", "Não foi possível carregar os slides.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  const openCreate = () => {
    setSelectedSlide(null)
    setDialogOpen(true)
  }

  const openEdit = (slide: HeroSlideType) => {
    setSelectedSlide(slide)
    setDialogOpen(true)
  }

  const handleToggleActive = async (slide: HeroSlideType) => {
    if (!slide.id) return

    // Validação: máximo 5 slides ativos
    if (!slide.active && activeCount >= 5) {
      showError("Limite atingido", "Você já tem 5 slides ativos no carrossel. Desative outro slide antes de ativar este.")
      return
    }

    try {
      setTogglingId(slide.id)
      await updateDoc(doc(db, "hero_slides", slide.id), {
        active: !slide.active,
        updatedAt: new Date().toISOString(),
      })
      success(
        slide.active ? "Slide ocultado" : "Slide publicado",
        `"${slide.title}" foi ${slide.active ? "removido da Home" : "publicado na Home"}.`
      )
      fetchSlides()
    } catch (e: any) {
      console.error("Erro ao publicar/ocultar slide:", e)
      showError("Erro", e?.message || "Tente novamente.")
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (slide: HeroSlideType) => {
    if (!slide.id) return
    if (!window.confirm(`Excluir o slide "${slide.title}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteDoc(doc(db, "hero_slides", slide.id))
      success("Slide excluído!", "O slide foi removido do carrossel.")
      fetchSlides()
    } catch (e: any) {
      showError("Erro ao excluir", e?.message || "Tente novamente.")
    }
  }

  const activeCount = slides.filter((s) => s.active).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Layers className="h-4 w-4 text-sky-600" />
            Slides do Carrossel Hero
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {slides.length === 0
              ? "Nenhum slide — exibindo slide padrão."
              : `${slides.length} slide${slides.length > 1 ? "s" : ""} cadastrado${slides.length > 1 ? "s" : ""} · ${activeCount} ativo${activeCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchSlides}
            disabled={loading}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-8 w-8 p-0"
            title="Recarregar slides"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            type="button"
            onClick={openCreate}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-9 px-4 flex items-center gap-2 rounded-lg"
          >
            <Plus className="h-3.5 w-3.5" /> Novo Slide
          </Button>
        </div>
      </div>

      {/* Slides grid */}
      {loading ? (
        <div className="h-40 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400">
          <span className="animate-spin h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full" />
          <span className="text-xs font-semibold">Carregando slides...</span>
        </div>
      ) : slides.length === 0 ? (
        <div
          onClick={openCreate}
          className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50/50 hover:bg-slate-50 hover:border-sky-300 hover:text-sky-500 cursor-pointer transition-all group"
        >
          <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-semibold">Criar primeiro slide</p>
          <p className="text-[10px]">Enquanto não houver slides, o padrão será exibido com os textos configurados abaixo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {slides.map((slide) => {
            const themeStyle = THEME_STYLES[slide.theme || "navy"] || THEME_STYLES.navy
            const isToggling = togglingId === slide.id
            return (
              <Card
                key={slide.id}
                className={`bg-white border-slate-200 shadow-sm rounded-xl flex flex-col overflow-hidden transition-opacity ${!slide.active ? "opacity-60" : ""}`}
              >
                {/* Card top color bar by theme */}
                <div className={`h-1 w-full ${
                  slide.theme === "navy" ? "bg-sky-600" :
                  slide.theme === "amber" ? "bg-amber-500" : "bg-emerald-500"
                }`} />

                {/* Slide Preview Thumbnail */}
                <div className="relative aspect-[16/7] w-full bg-slate-950 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                  {slide.video ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-sky-450 gap-1 z-10">
                      <Film className="h-5 w-5 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-sky-400">Vídeo Ativo</span>
                    </div>
                  ) : null}
                  
                  {slide.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.image}
                      alt={slide.title || "Preview do Slide"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
                      }}
                    />
                  ) : (
                    <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                      <span>Sem imagem</span>
                    </div>
                  )}

                  {/* Badges on top of image */}
                  <div className="absolute top-2 left-2 z-10 flex gap-1 flex-wrap">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shadow ${
                      slide.active 
                        ? "bg-emerald-600 text-white" 
                        : "bg-slate-500 text-white"
                    }`}>
                      {slide.active ? "Ativo" : "Oculto"}
                    </span>
                    {slide.displayPriority ? (
                      <span className="text-[8px] bg-indigo-650 text-white px-1.5 py-0.5 rounded font-black shadow uppercase tracking-wider">
                        Prio: {slide.displayPriority}
                      </span>
                    ) : null}
                    {!slide.showTextOverlay && (
                      <span className="text-[8px] bg-rose-650 text-white px-1.5 py-0.5 rounded font-black shadow uppercase tracking-wider">
                        Flyer
                      </span>
                    )}
                  </div>
                </div>

                <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">#{slide.order}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold px-1.5 py-0 h-4 ${themeStyle.badge}`}
                      >
                        <span className={`mr-1 h-1.5 w-1.5 rounded-full inline-block ${themeStyle.dot}`} />
                        {slide.theme === "navy" ? "Navy" : slide.theme === "amber" ? "Amber" : "Emerald"}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-800 leading-snug line-clamp-1">
                      {slide.title || "— Sem Título (Apenas Imagem) —"}
                    </CardTitle>
                    {slide.glowTitle && (
                      <p className="text-xs font-semibold text-sky-600 truncate">{slide.glowTitle}</p>
                    )}
                    <CardDescription className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {slide.subtitle || "Campanha visual."}
                    </CardDescription>
                    
                    {/* Vigência / Agendamento Badge */}
                    {(slide.startDate || slide.endDate) && (
                      <div className="mt-1.5 flex items-center gap-1 text-[8px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-bold w-fit">
                        <span>📅 Vigência:</span>
                        <span className="text-slate-700 font-extrabold">
                          {slide.startDate ? new Date(slide.startDate).toLocaleDateString("pt-BR") : "Início"}
                        </span>
                        <span>→</span>
                        <span className="text-slate-700 font-extrabold">
                          {slide.endDate ? new Date(slide.endDate).toLocaleDateString("pt-BR") : "Expira"}
                        </span>
                      </div>
                    )}
                  </div>
                  <GripVertical className="h-4 w-4 text-slate-300 shrink-0 mt-1" />
                </CardHeader>

                <CardContent className="px-4 pb-3 space-y-2.5">
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      {slide.video ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      {slide.video ? "Vídeo" : "Imagem"}
                    </span>
                    {slide.badge && (
                      <span className="truncate max-w-[120px] text-slate-400">· {slide.badge}</span>
                    )}
                  </div>
                  
                  {/* Analytics display */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div>
                      <p className="text-[8px] text-slate-400 font-black uppercase">Views</p>
                      <p className="text-xs font-bold text-slate-700">{slide.views ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 font-black uppercase">Clicks</p>
                      <p className="text-xs font-bold text-slate-700">{slide.clicks ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 font-black uppercase">CTR</p>
                      <p className="text-xs font-black text-sky-600">
                        {slide.views ? `${((slide.clicks ?? 0) / slide.views * 100).toFixed(1)}%` : "0.0%"}
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Toggle active */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(slide)}
                    disabled={isToggling}
                    className={`flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2.5 py-1 border transition-all ${
                      slide.active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                    }`}
                    title={slide.active ? "Ocultar slide" : "Publicar slide"}
                  >
                    {isToggling ? (
                      <span className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : slide.active ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {slide.active ? "Ativo" : "Oculto"}
                  </button>

                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(slide)}
                      className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 h-7 px-2 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Edit3 className="h-3 w-3" /> Editar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(slide)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Excluir
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog */}
      <HeroSlideDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={fetchSlides}
        slide={selectedSlide}
        slidesCount={slides.length}
      />
    </div>
  )
}
