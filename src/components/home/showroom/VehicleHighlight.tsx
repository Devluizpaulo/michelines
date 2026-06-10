"use client"

import { Vehicle } from "@/types/vehicle"
import { optimizeImageUrl } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Star, MessageSquare, ArrowRight, TrendingUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/app/firebase/config"

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
    `Olá! Tenho interesse em alugar o táxi ${vehicle.name} (Diária a partir de R$ ${vehicle.dailyPrice || 150}). Vocês têm disponibilidade imediata?`
  )
  const waUrl = `https://wa.me/${waPhone}?text=${waText}`

  const handleVehicleClick = () => {
    if (vehicle.id && !vehicle.id.includes("fallback")) {
      updateDoc(doc(db, "vehicles", vehicle.id), {
        clicksCount: increment(1)
      }).catch(err => console.warn("Erro ao registrar click do veículo:", err))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-2xl w-full overflow-y-auto max-h-[92vh] rounded-2xl scrollbar-thin scrollbar-thumb-slate-200 p-6 shadow-2xl" descriptionId="vehicle-highlight-dialog-description">
        
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {vehicle.isDTaxiApproved && (
              <Badge className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                ✈️ Credenciado para operação D-Taxi
              </Badge>
            )}
            {vehicle.isHybrid && (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                🔋 Isento de Rodízio
              </Badge>
            )}
            {vehicle.fuelType === "electric" && (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                ⚡ 100% Elétrico
              </Badge>
            )}
            {vehicle.hasGNV && (
              <Badge className="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                ⛽ GNV Alta Economia
              </Badge>
            )}
            {(vehicle.monthlyPrice && vehicle.monthlyPrice > 2500) ? (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                💼 Executivo Premium
              </Badge>
            ) : (
              <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                🚖 Categoria Econômica
              </Badge>
            )}
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">{vehicle.name}</DialogTitle>
          <DialogDescription id="vehicle-highlight-dialog-description" className="text-xs text-slate-400 font-semibold">
            Informações do veículo e condições de locação.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          
          {/* Main Photo Spotlight */}
          {vehicle.thumbnail && (
            <div className="relative aspect-[16/9] w-full bg-gradient-to-b from-slate-50 to-slate-100/10 rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-slate-150 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={optimizeImageUrl(vehicle.thumbnail, 900, 85)} 
                alt={vehicle.name} 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          )}

          {/* O QUE ESTÁ INCLUSO NA LOCAÇÃO */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800">
              <CheckCircle2 className="h-4.5 w-4.5 text-sky-600" />
              <h4 className="text-xs uppercase font-black tracking-widest text-slate-500">O que está incluso na locação</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm">✅</span>
                <span>Oficina própria</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm">✅</span>
                <span>Assistência 24h com guincho</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm">✅</span>
                <span>Suporte operacional</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm">✅</span>
                <span>Licenciamento em dia</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm">✅</span>
                <span>Impostos do veículo por conta da frota</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-sm">✅</span>
                <span>Orientação em caso de sinistro</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-black tracking-widest text-slate-450">Sobre o Veículo</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold text-justify">
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

          {/* Detailed Pricing & Operational Model Box */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs uppercase font-black tracking-widest text-slate-450">Opções de Contrato e Planos</h4>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl text-center space-y-1">
                <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider block">Por Diária</span>
                <span className="text-base font-black text-slate-800 block">R$ {Number(vehicle.dailyPrice || 150).toLocaleString('pt-BR')}/dia</span>
                <span className="text-[8px] text-slate-500 font-bold leading-tight block">Flexibilidade diária</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl text-center space-y-1">
                <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider block">Semanal</span>
                <span className="text-base font-black text-slate-800 block">R$ {Number(vehicle.weeklyPrice || Math.round((vehicle.monthlyPrice || 2400) / 4)).toLocaleString('pt-BR')}/sem</span>
                <span className="text-[8px] text-slate-500 font-bold leading-tight block">Ajuste semanal</span>
              </div>
              <div className="bg-sky-50/40 border border-sky-100 p-3.5 rounded-xl text-center space-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-sky-500 text-[7px] font-black text-white px-1.5 py-0.5 rounded-bl uppercase">Mais Escolhido</div>
                <span className="text-[9px] text-sky-700 font-black uppercase tracking-wider block">Locação Mensal</span>
                <span className="text-base font-black text-emerald-600 block">R$ {Number(vehicle.monthlyPrice || 3200).toLocaleString('pt-BR')}/mês</span>
                <span className="text-[8px] text-slate-500 font-bold leading-tight block">Plano mais utilizado</span>
              </div>
            </div>

            {/* Financial and Exemption Rules */}
            <div className="bg-slate-50/50 border border-slate-200/80 p-4 rounded-xl grid sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Isenção Especial</span>
                <p className="text-slate-800 flex items-center gap-1.5 font-extrabold text-[11px]">
                  📅 {vehicle.pricing?.weekendExempt ? "Domingos & Feriados Isentos" : "Diárias Normais"}
                </p>
                <p className="text-[10px] text-slate-550 font-semibold leading-tight text-justify">
                  {vehicle.pricing?.weekendExempt ? "Cobrança de segunda a sábado. Domingos e feriados nacionais são 100% isentos de diária." : "Diárias calculadas de forma corrida durante o contrato."}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Meios de Pagamento</span>
                <p className="text-slate-800 flex items-center gap-1.5 font-extrabold text-[11px]">
                  💳 Pix, Débito ou Crédito
                </p>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight text-justify">
                  Mais controle financeiro. Escolha pagar via Pix ou cartões de débito/crédito sem burocracias extras.
                </p>
              </div>
            </div>

            {/* Info Disclaimer */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex gap-2">
              <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed text-justify">
                Os resultados financeiros podem variar de acordo com a rotina de trabalho, região de atuação e demanda diária de cada motorista.
              </p>
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
            onClick={handleVehicleClick}
          >
            <Button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-emerald-600 hover:text-emerald-700 font-bold flex items-center justify-center gap-2 rounded-xl text-xs h-12 transition-all shadow-sm">
              <MessageSquare className="h-4 w-4" /> Reservar pelo WhatsApp
            </Button>
          </a>

          <Link 
            href={`/cadastro?vehicleInterest=${encodeURIComponent(vehicle.name)}`} 
            onClick={handleVehicleClick}
            className="flex-1"
          >
            <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2 rounded-xl text-xs h-12 transition-all shadow-md">
              Cadastrar para Alugar <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

      </DialogContent>
    </Dialog>
  )
}
