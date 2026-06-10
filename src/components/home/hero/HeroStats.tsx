"use client"

import { motion } from "framer-motion"
import { Car, MapPin, Shield, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroStatsProps {
  theme?: string
  alignment?: "left" | "center" | "right"
}

export function HeroStats({ theme = "navy", alignment = "center" }: HeroStatsProps) {
  const stats = [
    { label: "Mobilidade", val: "Corredores Exclusivos", detail: "Mais eficiência operacional", icon: MapPin },
    { label: "Operação", val: "Rodízio Isento", detail: "Táxi regulamentado", icon: Car },
    { label: "Estrutura", val: "Suporte 24h", detail: "Oficina e assistência", icon: Shield },
    { label: "Tradição", val: "45 Anos", detail: "Experiência no setor", icon: Award }
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
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl",
        alignment === "left" && "mr-auto ml-0 text-left",
        alignment === "right" && "ml-auto mr-0 text-right",
        alignment === "center" && "mx-auto text-center"
      )}
    >
      {stats.map((badge, idx) => (
        <div 
          key={idx} 
          className={cn(
            "bg-white/95 backdrop-blur-[2px] border border-slate-200/70 p-5 rounded-2xl text-left shadow-sm transition-all duration-300 group hover:-translate-y-1 hover:shadow-md",
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
          <p className="text-sm font-black text-slate-900 mt-1.5 leading-snug">{badge.val}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">{badge.detail}</p>
        </div>
      ))}
    </motion.div>
  )
}
