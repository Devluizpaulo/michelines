"use client"

import { Car, MapPin, Clock } from "lucide-react"
import { useLiveStats } from "@/hooks/useLiveStats"
import { LandingSettings } from "@/types/landing"

interface LiveStatusProps {
  landingSettings: LandingSettings
}

export function LiveStatus({ landingSettings }: LiveStatusProps) {
  const { liveDrivers, liveCars, liveCongonhasRuns } = useLiveStats()

  return (
    <section className="w-full py-4 bg-white border-y border-slate-200/80 relative z-30 overflow-hidden shadow-xs">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-around gap-4 text-center md:text-left text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-600"></span>
            </span>
            <p>
              <strong className="text-slate-800 font-bold">{liveDrivers} motoristas</strong> cadastrando hoje em SP
            </p>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden md:block" />
          <div className="flex items-center gap-3">
            <Car className="h-4 w-4 text-sky-600 animate-pulse" />
            <p>
              Apenas <strong className="text-sky-700 font-bold">{liveCars} veículos</strong> livres para retirada
            </p>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden md:block" />
          <div className="flex items-center gap-3">
            <MapPin className="h-4.5 w-4.5 text-emerald-650 animate-bounce" />
            <p>
              <strong className="text-emerald-700 font-bold">{liveCongonhasRuns} corridas</strong> em Congonhas nos últimos 15m
            </p>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden md:block" />
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-slate-500 animate-pulse" />
            <p>
              Fila Congonhas: <strong className="text-slate-800 font-bold">{landingSettings.congonhasStatus}</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
