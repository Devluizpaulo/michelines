"use client"

import { Search, Filter, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface LeadFiltersProps {
  searchTerm: string
  setSearchTerm: (val: string) => void
  sourceFilter: string
  setSourceFilter: (val: string) => void
  vehicleFilter: string
  setVehicleFilter: (val: string) => void
  resetFilters: () => void
}

export function LeadFilters({
  searchTerm,
  setSearchTerm,
  sourceFilter,
  setSourceFilter,
  vehicleFilter,
  setVehicleFilter,
  resetFilters
}: LeadFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Buscar lead por nome ou celular..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-sky-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="w-[150px] w-full md:w-auto">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 focus:ring-sky-500">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-750">
              <SelectItem value="all">Todas Origens</SelectItem>
              <SelectItem value="Google">Google Ads</SelectItem>
              <SelectItem value="Facebook">Facebook/Meta</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Organic">Orgânico</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp Direto</SelectItem>
              <SelectItem value="Site">Site Principal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px] w-full md:w-auto">
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 focus:ring-sky-500">
              <SelectValue placeholder="Veículo de Interesse" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-750">
              <SelectItem value="all">Todos Veículos</SelectItem>
              <SelectItem value="Corolla Cross">Corolla Cross</SelectItem>
              <SelectItem value="Corolla Sedan">Corolla Sedan</SelectItem>
              <SelectItem value="Spin">Chevrolet Spin</SelectItem>
              <SelectItem value="Virtus">VW Virtus</SelectItem>
              <SelectItem value="Onix">Chevrolet Onix</SelectItem>
              <SelectItem value="Cronos">Fiat Cronos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(searchTerm || sourceFilter !== "all" || vehicleFilter !== "all") && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 h-10 px-3"
          >
            <RotateCcw className="h-4 w-4" /> Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
