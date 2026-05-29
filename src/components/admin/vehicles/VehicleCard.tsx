"use client"

import { Vehicle } from "@/types/vehicle"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit3, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VehicleCardProps {
  vehicle: Vehicle
  onView: (vehicle: Vehicle) => void
  onEdit: (vehicle: Vehicle) => void
  onDelete: (id: string) => void
}

export function VehicleCard({ vehicle, onView, onEdit, onDelete }: VehicleCardProps) {
  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-350 hover:shadow-md transition-all duration-300">
      
      {/* Thumbnail */}
      <div className="relative h-44 bg-slate-50 flex items-center justify-center overflow-hidden">
        {vehicle.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={vehicle.thumbnail} 
            alt={vehicle.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-slate-400 text-xs font-bold uppercase">Sem Imagem</div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {vehicle.isDTaxiApproved && (
            <Badge className="bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-black uppercase py-0.5 px-2 shadow-sm">
              ✈️ D-TAXI Congonhas
            </Badge>
          )}
          {vehicle.isHybrid && (
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase py-0.5 px-2 shadow-sm">
              🔋 Híbrido
            </Badge>
          )}
        </div>

        {/* Featured Flag */}
        {vehicle.featured && (
          <Badge className="absolute top-2 right-2 bg-amber-50 text-amber-700 border border-amber-250 text-[9px] font-black uppercase py-0.5 px-2 shadow-sm">
            ★ Destaque
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{vehicle.brand}</span>
            <span className="text-[10px] text-slate-500 font-bold">Ano {vehicle.year}</span>
          </div>
          <CardTitle className="text-sm font-extrabold text-slate-900 mt-1 truncate">{vehicle.name}</CardTitle>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-semibold">{vehicle.shortDescription}</p>
        </div>

        {/* Price & Specs row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-650 font-bold">
            Diária: <span className="text-emerald-650 font-extrabold">R$ {vehicle.dailyPrice?.toLocaleString('pt-BR')}</span>
          </div>
          <div className="text-xs text-slate-650 font-bold">
            Mensal: <span className="text-emerald-650 font-extrabold">R$ {vehicle.monthlyPrice?.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </CardContent>

      {/* Footer Actions */}
      <div className="bg-slate-50 border-t border-slate-150 p-3 flex justify-end gap-2">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => onView(vehicle)}
          className="text-slate-600 hover:text-slate-700 hover:bg-slate-100 h-8 px-2.5 flex items-center gap-1 font-bold rounded-lg text-xs"
        >
          <Eye className="h-3.5 w-3.5" /> Ver Dados
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => onEdit(vehicle)}
          className="text-sky-650 hover:text-sky-750 hover:bg-slate-100 h-8 px-2.5 flex items-center gap-1 font-bold rounded-lg text-xs"
        >
          <Edit3 className="h-3.5 w-3.5" /> Editar
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => vehicle.id && onDelete(vehicle.id)}
          className="text-red-650 hover:text-red-750 hover:bg-slate-100 h-8 px-2.5 flex items-center gap-1 font-bold rounded-lg text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" /> Excluir
        </Button>
      </div>

    </Card>
  )
}
