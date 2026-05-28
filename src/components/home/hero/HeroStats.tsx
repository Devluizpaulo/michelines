"use client"

import { motion } from "framer-motion"
import { TrendingUp, Car, MapPin, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroStatsProps {
  theme?: string
}

export function HeroStats({ theme = "navy" }: HeroStatsProps) {
  const stats = [
    { label: "Ganhos Médios", val: "R$ 11.200/mês", detail: "Faturamento líquido superior", icon: TrendingUp },
    { label: "Veículo Pronto", val: "Liberação em 24h", detail: "Sem burocracia", icon: Car },
    { label: "Aeroporto", val: "Fila Rápida D-Taxi", detail: "Acesso direto em Congonhas", icon: MapPin },
    { label: "Suporte 24h/7", val: "45 Anos de Tradição", detail: "Segurança e estabilidade", icon: Shield }
  ]

  const colorClass = cn(
    theme === "navy" && "text-sky-600",
    theme === "amber" && "text-amber-600",
    theme === "emerald" && "text-emerald-600"
  )

  const borderHoverClass = cn(
    theme === "navy" && "hover:border-sky-400/50 hover:shadow-sky-100",
    theme === "amber" && "hover:border-amber-400/50 hover:shadow-amber-100",
    theme === "emerald" && "hover:border-emerald-400/50 hover:shadow-emerald-100"
  )

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
    >
      {stats.map((badge, idx) => (
        <div 
          key={idx} 
          className={cn(
            "bg-white/90 backdrop-blur-md border border-slate-200/70 p-5 rounded-2xl text-left shadow-sm transition-all duration-300 group hover:-translate-y-1 hover:shadow-md",
            borderHoverClass
          )}
        >
          <div className={cn(
            "p-2.5 w-fit rounded-xl bg-slate-50 border border-slate-100 mb-4 group-hover:bg-slate-100 transition-colors",
            colorClass
          )}>
            <badge.icon className="h-5 w-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{badge.label}</h3>
          <p className="text-lg font-black text-slate-900 mt-1">{badge.val}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">{badge.detail}</p>
        </div>
      ))}
    </motion.div>
  )
}
