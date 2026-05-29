"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Lead } from "@/types/lead"
import { 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  Flame, 
  Megaphone, 
  Car, 
  TrendingUp,
  Percent,
  Clock
} from "lucide-react"
import { calculateLeadScore } from "@/lib/lead-score"
import { THEME_TOKENS } from "@/theme/design-system"
import { motion } from "framer-motion"
import { ExecutiveCard, MetricCard } from "@/components/ui/card-variants"

interface DashboardOverviewProps {
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
}

export function DashboardOverview({ leads, onLeadClick }: DashboardOverviewProps) {
  const [activeCampaignsCount, setActiveCampaignsCount] = useState(0)

  // Fetch active hero slides count
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const q = query(collection(db, "hero_slides"), where("active", "==", true))
        const snap = await getDocs(q)
        setActiveCampaignsCount(snap.size)
      } catch (e) {
        console.warn("Erro ao buscar campanhas na dashboard:", e)
      }
    }
    fetchCampaigns()
  }, [])

  // 1. Calculate Metrics
  const totalLeads = leads.length
  
  // Leads today (captured within last 24 hours)
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  
  const leadsToday = leads.filter(lead => {
    if (!lead.createdAt) return false
    const date = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt)
    return date > oneDayAgo
  })

  // Converted leads
  const convertedLeads = leads.filter(lead => lead.status === "converted")
  const conversionRate = totalLeads > 0 
    ? Math.round((convertedLeads.length / totalLeads) * 100) 
    : 0

  // Hot leads (score >= 75)
  const hotLeads = leads.filter(lead => calculateLeadScore(lead).level === "hot")

  // WhatsApp sent
  const whatsappSentCount = leads.filter(lead => lead.whatsappSent).length

  // 2. Calculate Top Vehicles Interest
  const vehicleCounts: Record<string, number> = {}
  leads.forEach(lead => {
    const v = lead.vehicleInterest || "Outros"
    vehicleCounts[v] = (vehicleCounts[v] || 0) + 1
  })
  const topVehicles = Object.entries(vehicleCounts)
    .sort((a, b) => b[1] - a[1])
  const topVehicleName = topVehicles[0] ? topVehicles[0][0] : ""

  // Top Sources
  const sourceCounts: Record<string, number> = {}
  leads.forEach(lead => {
    const s = lead.source || "Direto"
    sourceCounts[s] = (sourceCounts[s] || 0) + 1
  })
  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  return (
    <div className="space-y-8 select-none">
      
      {/* 6 Premium Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard 
          title="Leads Hoje"
          value={leadsToday.length}
          description="Últimas 24h"
          icon={<Clock className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard 
          title="Conversão Geral"
          value={`${conversionRate}%`}
          description={`${convertedLeads.length} fechamentos`}
          icon={<CheckCircle2 className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard 
          title="Mais Procurado"
          value={topVehicleName ? topVehicleName.split(" ")[0] : "-"}
          description={topVehicleName || "Sem dados"}
          icon={<Car className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard 
          title="Leads Quentes"
          value={hotLeads.length}
          description="Score elevado"
          icon={<Flame className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard 
          title="WhatsApps Enviados"
          value={whatsappSentCount}
          description="Atendimentos ativos"
          icon={<MessageSquare className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard 
          title="Campanhas Ativas"
          value={activeCampaignsCount}
          description="Banners do Hero"
          icon={<Megaphone className="h-4 w-4 text-slate-400" />}
        />
      </div>

      {/* Grid de Seções Avançadas */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Leads do Dia (Recentes) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Leads Recentes (Aguardando Atendimento)</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Contatos mais recentes que precisam de follow-up rápido via WhatsApp.</p>
          </div>

          <div className="space-y-3">
            {leads.slice(0, 4).map((lead) => {
              const scoreInfo = calculateLeadScore(lead)
              const cleanPhone = lead.phone.replace(/\D/g, "")
              const waPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
              const waText = encodeURIComponent(`Olá ${lead.fullName.split(" ")[0]}, tudo bem? Sou da equipe comercial do Grupo Michelines...`)
              const waUrl = `https://wa.me/${waPhone}?text=${waText}`

              return (
                <div 
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 group shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate group-hover:text-sky-600 transition-colors">
                      {lead.fullName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                      Interesse: <span className="text-slate-600 font-bold">{lead.vehicleInterest}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${scoreInfo.color}`}>
                      {scoreInfo.score} pts
                    </span>
                    <a 
                      href={waUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-600 transition-colors"
                      title="Chamar no WhatsApp"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )
            })}
            {leads.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">Nenhum lead registrado.</div>
            )}
          </div>
        </div>

        {/* Estatísticas de Demanda */}
        <div className="lg:col-span-6 grid sm:grid-cols-2 gap-6">
          
          {/* Veículos mais Procurados */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Mais Procurados</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Demanda de leads por modelo de táxi.</p>
            </div>
            
            <div className="space-y-3 pt-1">
              {topVehicles.slice(0, 4).map(([vehicle, count], idx) => {
                const percent = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-650">
                      <span>{vehicle}</span>
                      <span>{count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-sky-600 h-full rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {topVehicles.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold">Aguardando dados...</div>
              )}
            </div>
          </div>

          {/* Origem de Leads (Canais de Atração) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Origem dos Leads</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Canais de captação de clientes.</p>
            </div>
            
            <div className="space-y-3 pt-1">
              {topSources.map(([source, count], idx) => {
                const percent = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-650">
                      <span>{source}</span>
                      <span>{count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {topSources.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold">Aguardando dados...</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
