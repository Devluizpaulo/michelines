"use client"

import React, { useState } from "react"
import { Image as ImageIcon, Search, Check, UploadCloud, Link as LinkIcon, Trash2, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MediaSelectorDialog } from "@/components/admin/shared/MediaSelectorDialog"

export interface LocalCarPreset {
  name: string
  file: string
  category: string
}

export const LOCAL_CAR_PRESETS: LocalCarPreset[] = [
  { name: "Toyota Corolla Cross Híbrido", file: "/images/cars/cross.png", category: "SUV Híbrido" },
  { name: "Toyota Corolla Cross D-Taxi", file: "/images/cars/Cross Dtaxi.png", category: "D-Taxi SP" },
  { name: "Toyota Corolla Sedan Híbrido", file: "/images/cars/corolla.png", category: "Sedan Híbrido" },
  { name: "Toyota Corolla Sedan D-Taxi", file: "/images/cars/corolla Dtaxi.png", category: "D-Taxi SP" },
  { name: "Chevrolet Spin (7 Lugares)", file: "/images/cars/spin.png", category: "Minivan / 7 Lugares" },
  { name: "Chevrolet Spin D-Taxi", file: "/images/cars/Spin Dtaxi.png", category: "D-Taxi SP" },
  { name: "Táxi Adaptado PCD / Acessível", file: "/images/cars/Acessivel.png", category: "Acessibilidade PCD" },
  { name: "Hyundai Ioniq Híbrido", file: "/images/cars/ioniq.png", category: "Híbrido Econômico" },
  { name: "Hyundai Ioniq D-Taxi", file: "/images/cars/Ioniq Dtaxi.png", category: "D-Taxi SP" },
  { name: "BYD King Plug-in Híbrido", file: "/images/cars/King.png", category: "Sedan Premium" },
  { name: "BYD King D-Taxi", file: "/images/cars/king Dtaxi.png", category: "D-Taxi SP" },
  { name: "Volkswagen Virtus", file: "/images/cars/virtus.png", category: "Sedan Conforto" },
  { name: "Volkswagen Virtus D-Taxi", file: "/images/cars/virtus Dtaxi.png", category: "D-Taxi SP" },
  { name: "Chevrolet Onix Plus", file: "/images/cars/onix-plus.png", category: "Sedan Econômico" },
  { name: "Chevrolet Onix Plus D-Taxi", file: "/images/cars/onix-plus Dtaxi.png", category: "D-Taxi SP" },
  { name: "Citroën C3 Aircross (7 Lugares)", file: "/images/cars/C3 Aircross.png", category: "SUV 7 Lugares" },
  { name: "Citroën C3 Aircross D-Taxi", file: "/images/cars/aircross Dtaxi.png", category: "D-Taxi SP" },
  { name: "Citroën C3 Hatch", file: "/images/cars/c3.png", category: "Compacto" },
  { name: "Fiat Cronos", file: "/images/cars/cronos.png", category: "Sedan" },
  { name: "Fiat Cronos D-Taxi", file: "/images/cars/Cronos Dtaxi.png", category: "D-Taxi SP" },
  { name: "Volkswagen Polo", file: "/images/cars/polo.png", category: "Hatch Moderno" },
  { name: "Volkswagen Gol", file: "/images/cars/gol.png", category: "Econômico" },
  { name: "Volkswagen Voyage", file: "/images/cars/voyage.png", category: "Sedan" },
  { name: "Nissan Versa", file: "/images/cars/versa.png", category: "Sedan Amplo" },
  { name: "Renault Logan", file: "/images/cars/logan.png", category: "Sedan" },
  { name: "Toyota Prius Híbrido", file: "/images/cars/prius.png", category: "Híbrido Clássico" },
  { name: "Neta Elétrico", file: "/images/cars/neta.png", category: "100% Elétrico" },
]

interface ImageSelectorFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  helperText?: string
}

export function ImageSelectorField({
  label,
  value,
  onChange,
  helperText = "Insira um link, escolha da frota local ou use imagens do Supabase.",
}: ImageSelectorFieldProps) {
  const [localGalleryOpen, setLocalGalleryOpen] = useState(false)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Categorias disponíveis
  const categories = [
    { id: "all", label: "Todos os Carros" },
    { id: "Híbrido", label: "Híbridos / Elétricos" },
    { id: "D-Taxi", label: "D-Taxi SP" },
    { id: "Sedan", label: "Sedans" },
    { id: "SUV", label: "SUVs & 7 Lugares" },
  ]

  const filteredCars = LOCAL_CAR_PRESETS.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      car.category.toLowerCase().includes(searchFilter.toLowerCase())

    if (categoryFilter === "all") return matchesSearch
    if (categoryFilter === "Híbrido") {
      return (
        matchesSearch &&
        (car.category.includes("Híbrido") || car.category.includes("Elétrico") || car.name.includes("King") || car.name.includes("Prius"))
      )
    }
    if (categoryFilter === "D-Taxi") {
      return matchesSearch && car.category.includes("D-Taxi")
    }
    if (categoryFilter === "Sedan") {
      return matchesSearch && car.category.includes("Sedan")
    }
    if (categoryFilter === "SUV") {
      return matchesSearch && (car.category.includes("SUV") || car.category.includes("7 Lugares") || car.category.includes("Minivan"))
    }
    return matchesSearch
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
          >
            <Trash2 className="h-3 w-3" />
            Remover
          </button>
        )}
      </div>

      {/* Input de URL ou Caminho */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... ou /images/cars/cross.png"
            className="pl-8 bg-white text-xs h-9"
          />
        </div>
      </div>

      {/* Ações Rápidas: Galeria Local ou Nuvem */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLocalGalleryOpen(true)}
          className="h-8 gap-1.5 border-violet-200 bg-white text-violet-700 hover:bg-violet-50 text-xs font-bold"
        >
          <Car className="h-3.5 w-3.5 text-violet-600" />
          Galeria da Frota ({LOCAL_CAR_PRESETS.length} carros)
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMediaLibraryOpen(true)}
          className="h-8 gap-1.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold"
        >
          <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
          Biblioteca Supabase
        </Button>
      </div>

      {/* Mini Preview se houver imagem selecionada */}
      {value && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="relative flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-900 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Prévia"
              className="h-full w-full object-contain p-1"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = "none"
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-800">{value.split("/").pop()}</p>
            <p className="truncate text-[10px] text-slate-500">{value}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <Check className="h-3 w-3" /> Ativa
          </span>
        </div>
      )}

      {helperText && <p className="text-[10px] text-slate-400">{helperText}</p>}

      {/* MODAL: Galeria de Carros Locais */}
      <Dialog open={localGalleryOpen} onOpenChange={setLocalGalleryOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Car className="h-5 w-5 text-violet-600" />
              Galeria da Frota Michelines
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Selecione qualquer veículo oficial da frota com fundo transparente otimizado para a Landing Page.
            </DialogDescription>
          </DialogHeader>

          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por Corolla, Spin, D-Taxi, Híbrido..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 text-xs h-9 bg-slate-50 border-slate-200"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                    categoryFilter === cat.id
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Carros */}
          <div className="flex-1 overflow-y-auto pr-1 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredCars.map((car) => {
                const isSelected = value === car.file
                return (
                  <button
                    key={car.file}
                    type="button"
                    onClick={() => {
                      onChange(car.file)
                      setLocalGalleryOpen(false)
                    }}
                    className={`group relative flex flex-col items-center rounded-2xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/30"
                        : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-md"
                    }`}
                  >
                    <div className="relative flex h-24 w-full items-center justify-center rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 p-2 overflow-hidden shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={car.file}
                        alt={car.name}
                        className="h-full w-full object-contain drop-shadow transition-transform duration-300 group-hover:scale-110"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 rounded-full bg-violet-600 p-1 text-white shadow">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5 w-full">
                      <span className="text-[9px] font-black uppercase tracking-wider text-violet-600">
                        {car.category}
                      </span>
                      <h5 className="truncate text-xs font-black text-slate-800">{car.name}</h5>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Galeria do Supabase Storage */}
      <MediaSelectorDialog
        open={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={(url) => {
          onChange(url)
          setMediaLibraryOpen(false)
        }}
        bucket="vehicles"
        title="Biblioteca de Mídias (Supabase)"
        description="Selecione ou faça upload de novas imagens na nuvem."
      />
    </div>
  )
}
