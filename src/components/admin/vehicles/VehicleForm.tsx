"use client"

import { useState, useEffect } from "react"
import { Vehicle } from "@/types/vehicle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { VehicleGallery } from "./VehicleGallery"
import { ChevronLeft, Save } from "lucide-react"

interface VehicleFormProps {
  vehicle: Vehicle | null
  onSave: (vehicleData: Partial<Vehicle>) => void
  onCancel: () => void
}

export function VehicleForm({ vehicle, onSave, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: "",
    slug: "",
    category: "dtaxi",
    brand: "Toyota",
    year: "2024",
    transmission: "automatic",
    fuelType: "flex",
    isHybrid: false,
    hasGNV: false,
    isDTaxiApproved: false,
    shortDescription: "",
    fullDescription: "",
    monthlyPrice: 0,
    weeklyPrice: 0,
    dailyPrice: 0,
    status: "active",
    available: true,
    featured: false,
    showroomFeatured: true,
    showroomOrder: 0,
    thumbnail: "",
    images: [],
    specs: [],
    tags: [],
    positivePoints: [],
    highlights: [],
    seoTitle: "",
    seoDescription: ""
  })

  // Populate data when editing
  useEffect(() => {
    if (vehicle) {
      setFormData({
        ...vehicle,
        weeklyPrice: vehicle.weeklyPrice || (vehicle.monthlyPrice ? Math.round(vehicle.monthlyPrice / 4) : 0),
        images: vehicle.images || [],
        specs: vehicle.specs || [],
        tags: vehicle.tags || [],
        positivePoints: vehicle.positivePoints || [],
        highlights: vehicle.highlights || []
      })
    }
  }, [vehicle])

  // Dynamic price calculation handlers
  const handleDailyPriceChange = (val: number) => {
    setFormData(prev => {
      const weekly = val * 6
      const monthly = weekly * 4 // Equivalência para 4 semanas (24 diárias)
      return {
        ...prev,
        dailyPrice: val,
        weeklyPrice: weekly,
        monthlyPrice: monthly
      }
    })
  }

  const handleWeeklyPriceChange = (val: number) => {
    setFormData(prev => {
      const daily = Math.round(val / 6)
      const monthly = val * 4
      return {
        ...prev,
        dailyPrice: daily,
        weeklyPrice: val,
        monthlyPrice: monthly
      }
    })
  }

  const handleMonthlyPriceChange = (val: number) => {
    setFormData(prev => {
      const weekly = Math.round(val / 4)
      const daily = Math.round(weekly / 6)
      return {
        ...prev,
        dailyPrice: daily,
        weeklyPrice: weekly,
        monthlyPrice: val
      }
    })
  }

  // Automatically compute slug on name change
  const handleNameChange = (val: string) => {
    const computedSlug = val
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove spec chars
      .replace(/[\s-]+/g, "-") // Replace spaces/hyphens with a single hyphen

    setFormData(prev => ({
      ...prev,
      name: val,
      slug: computedSlug
    }))
  }

  // Handle saving the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  // Helper arrays parsing (comma separated text helper)
  const handleArrayStringChange = (field: keyof Vehicle, val: string) => {
    const arr = val.split(",").map(item => item.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, [field]: arr }))
  }

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex items-center gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-slate-250 hover:border-slate-350 text-slate-700 bg-white h-9 px-3 shadow-sm hover:bg-slate-50 transition-all"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {vehicle ? `Editar ${vehicle.name}` : "Cadastrar Novo Veículo"}
          </h2>
          <p className="text-xs text-slate-500">Preencha os dados e gerencie a galeria comercial do veículo.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        
        {/* GALERIA E IMAGENS */}
        <div className="space-y-2.5">
          <Label className="text-xs font-bold text-slate-700">Galeria de Imagens & Capa</Label>
          <VehicleGallery 
            images={formData.images || []}
            thumbnail={formData.thumbnail || ""}
            slug={formData.slug || ""}
            onChange={(imgs, thumb) => setFormData(prev => ({ ...prev, images: imgs, thumbnail: thumb }))}
          />
        </div>

        <div className="h-px bg-slate-100" />

        {/* DADOS BÁSICOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-bold text-slate-700">Nome do Veículo</Label>
            <Input 
              id="name" 
              value={formData.name || ""} 
              onChange={(e) => handleNameChange(e.target.value)} 
              placeholder="Ex: Corolla Cross D-TAXI"
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-xs font-bold text-slate-700">Slug (URL Amigável)</Label>
            <Input 
              id="slug" 
              value={formData.slug || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="ex-corolla-cross-dtaxi"
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Categoria Comercial</Label>
            <Select 
              value={formData.category} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
            >
              <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-700">
                <SelectItem value="dtaxi">D-TAXI (Aeroporto Congonhas)</SelectItem>
                <SelectItem value="hibridos">Híbridos (Combustível Híbrido)</SelectItem>
                <SelectItem value="sedans">Sedans (Executivo)</SelectItem>
                <SelectItem value="hatches">Compactos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="brand" className="text-xs font-bold text-slate-700">Marca</Label>
            <Input 
              id="brand" 
              value={formData.brand || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="Ex: Toyota"
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year" className="text-xs font-bold text-slate-700">Ano Fabricação</Label>
            <Input 
              id="year" 
              value={formData.year || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              placeholder="Ex: 2024"
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Câmbio</Label>
            <Select 
              value={formData.transmission} 
              onValueChange={(val: any) => setFormData(prev => ({ ...prev, transmission: val }))}
            >
              <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                <SelectValue placeholder="Câmbio" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-700">
                <SelectItem value="automatic">Automático</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Combustível</Label>
            <Select 
              value={formData.fuelType} 
              onValueChange={(val: any) => setFormData(prev => ({ ...prev, fuelType: val }))}
            >
              <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                <SelectValue placeholder="Combustível" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-700">
                <SelectItem value="flex">Flex (Álcool/Gasolina)</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
                <SelectItem value="electric">Elétrico</SelectItem>
                <SelectItem value="gasoline">Gasolina</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* PARTE DE PRECIFICAÇÃO E ORDENAÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="dailyPrice" className="text-xs font-bold text-slate-700">Preço Diário Médio (R$)</Label>
            <Input 
              id="dailyPrice" 
              type="number"
              value={formData.dailyPrice || 0} 
              onChange={(e) => handleDailyPriceChange(Number(e.target.value))}
              placeholder="Ex: 85"
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="weeklyPrice" className="text-xs font-bold text-slate-700">Preço Semanal (R$)</Label>
            <Input 
              id="weeklyPrice" 
              type="number"
              value={formData.weeklyPrice || 0} 
              onChange={(e) => handleWeeklyPriceChange(Number(e.target.value))}
              placeholder="Ex: 510"
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="monthlyPrice" className="text-xs font-bold text-slate-700">Preço Mensal (R$)</Label>
            <Input 
              id="monthlyPrice" 
              type="number"
              value={formData.monthlyPrice || 0} 
              onChange={(e) => handleMonthlyPriceChange(Number(e.target.value))}
              placeholder="Ex: 2600"
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="showroomOrder" className="text-xs font-bold text-slate-700">Ordem Showroom (Exibição)</Label>
            <Input 
              id="showroomOrder" 
              type="number"
              value={formData.showroomOrder || 0} 
              onChange={(e) => setFormData(prev => ({ ...prev, showroomOrder: Number(e.target.value) }))}
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* FLAGS DO VEÍCULO */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="isHybrid" 
              checked={formData.isHybrid || false} 
              onChange={(e) => setFormData(prev => ({ ...prev, isHybrid: e.target.checked }))}
              className="h-4.5 w-4.5 rounded border-slate-250 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="isHybrid" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">Híbrido 🔋</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="hasGNV" 
              checked={formData.hasGNV || false} 
              onChange={(e) => setFormData(prev => ({ ...prev, hasGNV: e.target.checked }))}
              className="h-4.5 w-4.5 rounded border-slate-250 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="hasGNV" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">Kit GNV ⛽</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="isDTaxiApproved" 
              checked={formData.isDTaxiApproved || false} 
              onChange={(e) => setFormData(prev => ({ ...prev, isDTaxiApproved: e.target.checked }))}
              className="h-4.5 w-4.5 rounded border-slate-250 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="isDTaxiApproved" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">D-TAXI Aeroporto ✈️</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="featured" 
              checked={formData.featured || false} 
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="h-4.5 w-4.5 rounded border-slate-250 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="featured" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">Destaque Geral ★</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="showroomFeatured" 
              checked={formData.showroomFeatured || false} 
              onChange={(e) => setFormData(prev => ({ ...prev, showroomFeatured: e.target.checked }))}
              className="h-4.5 w-4.5 rounded border-slate-250 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="showroomFeatured" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">Menu Showroom</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="available" 
              checked={formData.available || false} 
              onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
              className="h-4.5 w-4.5 rounded border-slate-250 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="available" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">Disponível Locação</label>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* DESCRIÇÃO E DETALHES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="shortDescription" className="text-xs font-bold text-slate-700">Descrição Curta (Showroom Card)</Label>
            <Textarea 
              id="shortDescription" 
              value={formData.shortDescription || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
              placeholder="Ex: Corolla Cross com kit GNV homologado para a fila de Congonhas. Diárias a partir de R$ 85."
              className="bg-white border-slate-200 text-slate-800 min-h-[80px] focus-visible:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullDescription" className="text-xs font-bold text-slate-700">Descrição Completa (Ficha Técnica)</Label>
            <Textarea 
              id="fullDescription" 
              value={formData.fullDescription || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
              className="bg-white border-slate-200 text-slate-800 min-h-[80px] focus-visible:ring-sky-500"
            />
          </div>
        </div>

        {/* ARRAYS DE DIFERENCIAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="positivePoints" className="text-xs font-bold text-slate-700">Pontos Positivos (Separados por vírgula)</Label>
            <Input 
              id="positivePoints" 
              value={formData.positivePoints?.join(", ") || ""} 
              onChange={(e) => handleArrayStringChange("positivePoints", e.target.value)}
              placeholder="Isenção de rodízio, Consumo eco-híbrido, Espaço família..."
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="highlights" className="text-xs font-bold text-slate-700">Diferenciais Premium (Separados por vírgula)</Label>
            <Input 
              id="highlights" 
              value={formData.highlights?.join(", ") || ""} 
              onChange={(e) => handleArrayStringChange("highlights", e.target.value)}
              placeholder="Bancos em couro, Câmbio borboleta, Faróis LED..."
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>
        </div>

        {/* SPECS E TAGS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="specs" className="text-xs font-bold text-slate-700">Especificações Técnicas (Separados por vírgula)</Label>
            <Input 
              id="specs" 
              value={formData.specs?.join(", ") || ""} 
              onChange={(e) => handleArrayStringChange("specs", e.target.value)}
              placeholder="Espaçoso, Econômico, Seguro..."
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags" className="text-xs font-bold text-slate-700">Tags Comerciais (Separados por vírgula)</Label>
            <Input 
              id="tags" 
              value={formData.tags?.join(", ") || ""} 
              onChange={(e) => handleArrayStringChange("tags", e.target.value)}
              placeholder="Mais Alugado, Novidade, Super Econômico..."
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>
        </div>

        {/* SEO CONFIG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="seoTitle" className="text-xs font-bold text-slate-700">Título de SEO (Google Meta Title)</Label>
            <Input 
              id="seoTitle" 
              value={formData.seoTitle || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
              placeholder="Aluguel de Corolla Cross D-TAXI | Grupo Micheline's"
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seoDescription" className="text-xs font-bold text-slate-700">Descrição de SEO (Meta Description)</Label>
            <Input 
              id="seoDescription" 
              value={formData.seoDescription || ""} 
              onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
              placeholder="Alugue o melhor Corolla Cross homologado D-TAXI em Congonhas..."
              className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
            />
          </div>
        </div>

        {/* SUBMIT ACTIONS */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="h-4 w-4" /> Salvar Veículo
          </Button>
        </div>

      </form>
    </div>
  )
}
