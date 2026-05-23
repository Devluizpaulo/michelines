"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeroActionsProps {
  ctaText: string
  ctaUrl: string
  theme?: string
}

export function HeroActions({ ctaText, ctaUrl, theme = "navy" }: HeroActionsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20"
    >
      {ctaText && ctaUrl && (
        <Link href={ctaUrl} className="w-full sm:w-auto">
          <Button 
            className={cn(
              "w-full sm:w-auto h-15 px-8 text-base font-extrabold rounded-lg shadow-md hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2",
              theme === "amber" && "bg-amber-500 hover:bg-amber-400 text-slate-950",
              theme === "emerald" && "bg-emerald-600 hover:bg-emerald-500 text-white",
              theme === "navy" && "bg-sky-600 hover:bg-sky-500 text-white"
            )}
          >
            {ctaText} <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      )}
      <Link href="https://wa.me/5511944830851" className="w-full sm:w-auto">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto h-15 px-8 text-base rounded-lg border-slate-200 hover:border-sky-500 bg-white hover:bg-slate-50 text-slate-700 transition-all duration-300 flex items-center justify-center gap-2"
        >
          Falar com Consultor <Phone className="h-4 w-4 text-sky-600" />
        </Button>
      </Link>
    </motion.div>
  )
}
