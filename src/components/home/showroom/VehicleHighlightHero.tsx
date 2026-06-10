"use client"

import { Vehicle } from "@/types/vehicle"
import { optimizeImageUrl } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  ArrowRight,
  Zap,
  Trophy,
  Shield,
} from "lucide-react"

interface VehicleHighlightHeroProps {
  vehicle: Vehicle | null
  onOpenDetails: (vehicle: Vehicle) => void
}

export function VehicleHighlightHero({
  vehicle,
  onOpenDetails,
}: VehicleHighlightHeroProps) {
  if (!vehicle) return null

  // WhatsApp Link
  const waPhone = "5511944830851"

  const waText = encodeURIComponent(
    `Olá! Tenho interesse na locação do ${vehicle.name} para operação na D-Taxi Congonhas. Gostaria de verificar disponibilidade e condições.`
  )

  const waUrl = `https://wa.me/${waPhone}?text=${waText}`

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg">
      
      {/* Background overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(2,132,199,0.04),transparent_50%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.01)_1px,transparent_1px)] bg-[size:100%_16px] opacity-20" />

      <div className="relative z-10 grid items-center gap-8 p-6 md:p-12 lg:grid-cols-12">
        
        {/* LEFT */}
        <div className="space-y-6 text-left lg:col-span-6">
          
          {/* BADGES */}
          <div className="flex flex-wrap gap-2">
            <Badge className="flex items-center gap-1 border border-amber-200 bg-amber-50 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-700 shadow-sm">
              <Trophy className="h-3 w-3 text-amber-600" />
              Destaque da Frota
            </Badge>

            {vehicle.isDTaxiApproved && (
              <Badge className="border border-sky-200 bg-sky-50 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-sky-700 shadow-sm">
                ✈️ Operação D-Taxi
              </Badge>
            )}
          </div>

          {/* TITLE */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-sky-600">
              {vehicle.brand} Executivo
            </span>

            <h3 className="text-3xl font-black leading-none tracking-tight text-slate-900 md:text-5xl">
              {vehicle.name}
            </h3>

            <p className="text-sm font-medium leading-relaxed text-slate-600 md:text-base">
              Um veículo preparado para quem busca faturamento elevado na
              operação executiva. Combina conforto, economia e excelente
              desempenho operacional no dia a dia.
            </p>
          </div>

          {/* BENEFITS */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            
            {/* CARD 1 */}
            <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <Zap className="h-4 w-4" />

                <span className="text-[10px] font-black uppercase tracking-widest">
                  Rentabilidade
                </span>
              </div>

              <p className="text-base font-black text-slate-800">
                Alta Demanda
              </p>

              <p className="text-[10px] font-semibold leading-tight text-slate-500">
                Ideal para operação corporativa e executiva.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-1.5 text-sky-600">
                <Shield className="h-4 w-4" />

                <span className="text-[10px] font-black uppercase tracking-widest">
                  Suporte
                </span>
              </div>

              <p className="text-base font-black text-slate-800">
                Mais tranquilidade
              </p>

              <p className="text-[10px] font-semibold leading-tight text-slate-500">
                Frota com suporte e manutenção preventiva inclusa.
              </p>
            </div>
          </div>

          {/* PRICE */}
          <div className="flex items-baseline gap-2 border-t border-slate-100 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Diária a partir de
            </span>

            <span className="text-3xl font-black text-slate-900">
              R$ {vehicle.dailyPrice?.toLocaleString('pt-BR') || "0"}
            </span>

            <span className="text-xs font-bold text-slate-500">
              /dia
            </span>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              onClick={() => onOpenDetails(vehicle)}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 text-xs font-bold text-white shadow-md transition-all hover:bg-sky-500"
            >
              Ver Detalhes
              <ArrowRight className="h-4 w-4" />
            </Button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 text-xs font-bold text-emerald-600 shadow-sm transition-all hover:bg-slate-100 hover:text-emerald-700">
                <MessageSquare className="h-4 w-4" />
                Consultar Disponibilidade
              </Button>
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="group relative flex min-h-[260px] cursor-pointer items-center justify-center lg:col-span-6"
          onClick={() => onOpenDetails(vehicle)}
        >
          {/* Glow */}
          <div className="pointer-events-none absolute h-[60%] w-[60%] rounded-full bg-sky-500/5 blur-[80px] transition-all duration-500 group-hover:bg-sky-500/10" />

          {/* CAR */}
          {vehicle.thumbnail && (
            <div className="relative h-[220px] w-full transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-[1.02] md:h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={optimizeImageUrl(vehicle.thumbnail, 900, 85)}
                alt={vehicle.name}
                className="h-full w-full object-contain mix-blend-multiply"
              />
            </div>
          )}

          {/* Reflection */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 h-[15px] w-[75%] -translate-x-1/2 rounded-full bg-slate-300/10 blur-md opacity-40 transition-opacity duration-500 group-hover:opacity-60" />
        </div>
      </div>
    </div>
  )
}