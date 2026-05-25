"use client"

import { Vehicle } from "@/types/vehicle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, ArrowRight, Zap, Trophy, Shield } from "lucide-react"

interface VehicleHighlightHeroProps {
  vehicle: Vehicle | null
  onOpenDetails: (vehicle: Vehicle) => void
}

export function VehicleHighlightHero({ vehicle, onOpenDetails }: VehicleHighlightHeroProps) {
  if (!vehicle) return null

  // WhatsApp Link Construction
  const waPhone = "5511944830851" // Michelin's commercial contact
  const waText = encodeURIComponent(
    `Olá! Estou vendo o destaque do ${vehicle.name} no site. Gostaria de verificar a disponibilidade de aluguel imediato.`
  )
  const waUrl = `https://wa.me/${waPhone}?text=${waText}`

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-3xl overflow-hidden relative shadow-lg">
      
      {/* Light corporate blue subtle gradient spotlight overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(2,132,199,0.04),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.01)_1px,transparent_1px)] bg-[size:100%_16px] opacity-20 pointer-events-none" />

      <div className="grid lg:grid-cols-12 gap-8 p-6 md:p-12 items-center relative z-10">
        
        {/* Left Column: Storytelling / Text details */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Trophy className="h-3 w-3 text-amber-600" /> Escolha do Diretor
            </Badge>
            {vehicle.isDTaxiApproved && (
              <Badge className="bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 font-bold text-[9px] uppercase tracking-wider shadow-sm">
                ✈️ Homologado Congonhas
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <span className="text-xs text-sky-600 uppercase font-black tracking-widest">{vehicle.brand} Premium</span>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">{vehicle.name}</h3>
            <p className="text-sm md:text-base text-slate-650 font-medium leading-relaxed text-justify">
              O modelo definitivo para faturar alto. Combina a motorização {vehicle.fuelType === "electric" ? "100% Elétrica" : vehicle.isHybrid ? "Híbrida autocarregável" : "Flex de alta performance"} com espaço interno executivo e isenções que trazem mais rentabilidade diária.
            </p>
          </div>

          {/* Value proposition indicators */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <Zap className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Rentabilidade</span>
              </div>
              <p className="text-base font-black text-slate-800">Alta Demanda</p>
              <p className="text-[10px] text-slate-500 font-semibold leading-tight text-justify">Escolha número 1 de motoristas corporativos.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-sky-600">
                <Shield className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Manutenção</span>
              </div>
              <p className="text-base font-black text-slate-800">Seguro Total</p>
              <p className="text-[10px] text-slate-500 font-semibold leading-tight text-justify">Plano de revisões preventivas inclusas.</p>
            </div>

          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">A partir de</span>
            <span className="text-3xl font-black text-slate-900">R$ {vehicle.monthlyPrice}</span>
            <span className="text-xs text-slate-500 font-bold">/mês no plano Micheline's</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={() => onOpenDetails(vehicle)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold h-12 px-6 flex items-center justify-center gap-2 rounded-xl text-xs transition-all shadow-md"
            >
              Ficha Técnica Completa <ArrowRight className="h-4 w-4" />
            </Button>
            <a 
              href={waUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-emerald-600 hover:text-emerald-700 font-bold h-12 px-6 flex items-center justify-center gap-2 rounded-xl text-xs transition-all shadow-sm">
                <MessageSquare className="h-4 w-4" /> Reservar pelo WhatsApp
              </Button>
            </a>
          </div>

        </div>

        {/* Right Column: Cinematographic image showcase */}
        <div className="lg:col-span-6 flex items-center justify-center relative min-h-[260px] group cursor-pointer" onClick={() => onOpenDetails(vehicle)}>
          
          {/* Subtle Glow overlay */}
          <div className="absolute w-[60%] h-[60%] bg-sky-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-sky-500/10 transition-all duration-500" />
          
          {/* Main Car Photo */}
          {vehicle.thumbnail && (
            <div className="relative w-full h-[220px] md:h-[300px] transition-transform duration-700 group-hover:scale-[1.02] group-hover:-translate-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={vehicle.thumbnail} 
                alt={vehicle.name} 
                className="w-full h-full object-contain filter drop-shadow-[0_20px_20px_rgba(15,23,42,0.15)]"
              />
            </div>
          )}

          {/* Floor reflection strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[75%] h-[15px] bg-slate-300/10 blur-md rounded-full pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

        </div>

      </div>

    </div>
  )
}
