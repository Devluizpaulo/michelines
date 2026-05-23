"use client"

import { Vehicle } from "@/types/vehicle"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Star, MessageSquare, ArrowRight, TrendingUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface VehicleHighlightProps {
  vehicle: Vehicle | null
  isOpen: boolean
  onClose: () => void
}

export function VehicleHighlight({ vehicle, isOpen, onClose }: VehicleHighlightProps) {
  if (!vehicle) return null

  // WhatsApp Link Construction
  const waPhone = "5511944830851" // Michelin's commercial contact
  const waText = encodeURIComponent(
    `Olá! Tenho interesse em alugar o táxi ${vehicle.name} (Plano Mensal de R$ ${vehicle.monthlyPrice}). Vocês têm disponibilidade imediata?`
  )
  const waUrl = `https://wa.me/${waPhone}?text=${waText}`

  // Simulated Commercial Rentability Comparison (based on real operational taxi inputs)
  const weeklyRevenueMicheline = vehicle.isDTaxiApproved ? 2800 : 2200
  const weeklyRevenueCommon = 1650
  
  const fuelCostMicheline = vehicle.isHybrid ? 290 : vehicle.hasGNV ? 340 : 450
  const fuelCostCommon = 690

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-2xl w-full overflow-y-auto max-h-[92vh] rounded-2xl scrollbar-thin scrollbar-thumb-slate-200 p-6 shadow-2xl">
        
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {vehicle.isDTaxiApproved && (
              <Badge className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                ✈️ Fila Rápida Congonhas
              </Badge>
            )}
            {vehicle.isHybrid && (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                🔋 Isento de Rodízio
              </Badge>
            )}
            {vehicle.hasGNV && (
              <Badge className="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                ⛽ GNV Alta Economia
              </Badge>
            )}
            {(vehicle.monthlyPrice && vehicle.monthlyPrice > 2500) ? (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                💼 Executivo Black
              </Badge>
            ) : (
              <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                💰 Alta Rentabilidade
              </Badge>
            )}
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">{vehicle.name}</DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-semibold">
            Ficha técnica corporativa e demonstrativo de rendimento líquido semanal.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          
          {/* Main Photo Spotlight */}
          {vehicle.thumbnail && (
            <div className="relative aspect-[16/9] w-full bg-gradient-to-b from-slate-50 to-slate-100/10 rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-slate-150 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={vehicle.thumbnail} 
                alt={vehicle.name} 
                className="w-full h-full object-contain filter drop-shadow-[0_12px_12px_rgba(15,23,42,0.08)]"
              />
            </div>
          )}

          {/* Comparativo de Rentabilidade Semanal (Storytelling Comercial) */}
          <div className="bg-slate-50 border border-slate-200/80 p-4.5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
              <h4 className="text-xs uppercase font-black tracking-widest text-slate-500">Demonstrativo de Rendimento Líquido</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="space-y-2 p-3 bg-sky-50/50 rounded-xl border border-sky-100/85">
                <span className="text-[10px] text-sky-700 font-black uppercase tracking-wider block">OPERAÇÃO MICHELINE'S</span>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-650">Ganhos (Semana):</span>
                    <span className="text-slate-900 font-extrabold">R$ {weeklyRevenueMicheline}</span>
                  </div>
                  <div className="flex justify-between text-red-650">
                    <span>Combustível (Semana):</span>
                    <span>- R$ {fuelCostMicheline}</span>
                  </div>
                  <div className="h-px bg-slate-200/60 my-1" />
                  <div className="flex justify-between text-emerald-600 font-black text-sm">
                    <span>Sobra Líquida:</span>
                    <span>R$ {weeklyRevenueMicheline - fuelCostMicheline}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-100/40 rounded-xl border border-slate-200/50 opacity-80">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">CARRO FLEX COMUM APP</span>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ganhos (Semana):</span>
                    <span className="text-slate-800 font-extrabold">R$ {weeklyRevenueCommon}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Combustível (Semana):</span>
                    <span>- R$ {fuelCostCommon}</span>
                  </div>
                  <div className="h-px bg-slate-200/60 my-1" />
                  <div className="flex justify-between text-slate-600 font-black text-sm">
                    <span>Sobra Líquida:</span>
                    <span>R$ {weeklyRevenueCommon - fuelCostCommon}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-550 font-semibold leading-relaxed flex items-center gap-1.5 pt-1">
              <Info className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              *Cálculo baseado em jornada média de 40h/semana. Os veículos homologados D-TAXI possuem acesso livre à fila rápida do Aeroporto de Congonhas.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-black tracking-widest text-slate-450">Sobre o Veículo</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              {vehicle.fullDescription || vehicle.shortDescription}
            </p>
          </div>

          {/* Features highlight grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Positive points */}
            {vehicle.positivePoints && vehicle.positivePoints.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-black tracking-widest text-slate-450 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Destaques de Rentabilidade
                </h4>
                <ul className="space-y-2">
                  {vehicle.positivePoints.map((pt, idx) => (
                    <li key={idx} className="text-xs font-bold text-slate-650 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* highlights */}
            {vehicle.highlights && vehicle.highlights.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-black tracking-widest text-slate-450 flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-sky-600" />
                  Conforto & Tecnologia
                </h4>
                <ul className="space-y-2">
                  {vehicle.highlights.map((h, idx) => (
                    <li key={idx} className="text-xs font-bold text-slate-650 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          <div className="h-px bg-slate-100" />

          {/* Pricing Box */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Investimento Mensal</p>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">R$ {vehicle.monthlyPrice}/mês</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custo Diário Estimado</p>
              <p className="text-base font-extrabold text-slate-600 mt-0.5">R$ {vehicle.dailyPrice}/dia</p>
            </div>
          </div>

        </div>

        {/* CTA Options */}
        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-3">
          <a 
            href={waUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-emerald-600 hover:text-emerald-700 font-bold flex items-center justify-center gap-2 rounded-xl text-xs h-12 transition-all shadow-sm">
              <MessageSquare className="h-4 w-4" /> Reservar pelo WhatsApp
            </Button>
          </a>

          <Link href="/cadastro" className="flex-1">
            <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2 rounded-xl text-xs h-12 transition-all shadow-md">
              Cadastrar para Alugar <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

      </DialogContent>
    </Dialog>
  )
}
