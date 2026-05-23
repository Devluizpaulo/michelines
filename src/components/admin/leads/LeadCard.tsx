"use client"

import { Lead } from "@/types/lead"
import { Badge } from "@/components/ui/badge"
import { Phone, Calendar, MessageSquare, Flame, Sparkles, Snowflake } from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateLeadScore } from "@/lib/lead-score"
import { THEME_TOKENS } from "@/theme/design-system"
import { motion } from "framer-motion"

interface LeadCardProps {
  lead: Lead
  onClick: (lead: Lead) => void
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const scoreInfo = calculateLeadScore(lead)
  
  // Format date
  const dateString = lead.createdAt?.toDate
    ? lead.createdAt.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    : typeof lead.createdAt === "string" 
      ? new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      : "Recém criado"

  // Source badges styling
  const sourceColor = cn(
    lead.source === "Google" && "bg-blue-50 text-blue-700 border-blue-200",
    lead.source === "Facebook" && "bg-indigo-50 text-indigo-700 border-indigo-200",
    lead.source === "Instagram" && "bg-pink-50 text-pink-700 border-pink-200",
    lead.source === "WhatsApp" && "bg-emerald-50 text-emerald-700 border-emerald-200",
    (lead.source === "Site" || lead.source === "Organic" || lead.source === "Cadastro Site" || lead.source === "Cadastro Site (Legado)") && "bg-slate-50 text-slate-500 border-slate-200"
  )

  // WhatsApp link construction
  const cleanPhone = lead.phone.replace(/\D/g, "")
  const waPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
  const waText = encodeURIComponent(
    `Olá ${lead.fullName.split(" ")[0]}, tudo bem? Sou da equipe comercial do Grupo Micheline's. Recebemos seu interesse no aluguel do táxi ${lead.vehicleInterest}. Como posso te ajudar hoje?`
  )
  const waUrl = `https://wa.me/${waPhone}?text=${waText}`

  // HTML5 Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", lead.id)
    e.dataTransfer.effectAllowed = "move"
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(lead)}
      className={cn(
        "cursor-grab active:cursor-grabbing p-4 rounded-xl flex flex-col justify-between space-y-3 relative overflow-hidden select-none border border-slate-200 bg-white hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.015] hover:-translate-y-0.5 active:scale-[0.985] shadow-sm",
        scoreInfo.level === "hot" && "hover:border-red-300 hover:shadow-md",
        scoreInfo.level === "warm" && "hover:border-amber-300 hover:shadow-md",
        scoreInfo.level === "cold" && "hover:border-sky-300 hover:shadow-md"
      )}
    >
      {/* Light temperature indicator stripe at the left */}
      <span className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        scoreInfo.level === "hot" && "bg-red-500",
        scoreInfo.level === "warm" && "bg-amber-500",
        scoreInfo.level === "cold" && "bg-sky-500"
      )} />

      <div className="space-y-2.5">
        <div className="flex justify-between items-center pl-1">
          <Badge className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border", sourceColor)}>
            {lead.source}
          </Badge>

          {/* Lead score & temperature */}
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1", scoreInfo.color)}>
              {scoreInfo.level === "hot" && <Flame className="h-3 w-3 animate-pulse text-red-500" />}
              {scoreInfo.level === "warm" && <Sparkles className="h-2.5 w-2.5 text-amber-500" />}
              {scoreInfo.level === "cold" && <Snowflake className="h-2.5 w-2.5 text-blue-500" />}
              {scoreInfo.score} pts
            </span>
          </div>
        </div>

        <div className="pl-1">
          <h4 className="text-sm font-extrabold text-slate-800 truncate">
            {lead.fullName}
          </h4>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Interesse: <span className="text-slate-700 font-bold">{lead.vehicleInterest}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-1 pl-1">
        <span className="text-[10px] text-slate-450 font-bold flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {dateString}
        </span>

        <div className="flex items-center gap-2">
          {lead.whatsappSent && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold">
              WA
            </Badge>
          )}
          
          <a 
            href={waUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} 
            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 transition-all duration-300 flex items-center justify-center"
            title="Chamar no WhatsApp"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
