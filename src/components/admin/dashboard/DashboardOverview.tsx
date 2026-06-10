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
  Clock,
  AlertCircle,
  FileQuestion,
  Calendar,
  Star,
  BarChart3,
} from "lucide-react"
import { calculateLeadScore } from "@/lib/lead-score"
import { ExecutiveCard, MetricCard } from "@/components/ui/card-variants"

interface DashboardOverviewProps {
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
  /** Papel do usuário logado — usado para exibir KPIs restritos */
  role?: string
}

export function DashboardOverview({ leads, onLeadClick, role }: DashboardOverviewProps) {
  const [activeCampaignsCount, setActiveCampaignsCount] = useState(0)
  const isSupervisor = role === "supervisor" || role === "super_admin"

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

  // 1. Base Metrics
  const activeLeads = leads.filter(l => !l.archived)
  const totalLeads = activeLeads.length
  
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  
  const leadsToday = activeLeads.filter(lead => {
    if (!lead.createdAt) return false
    const date = (lead.createdAt as any).toDate ? (lead.createdAt as any).toDate() : new Date(lead.createdAt as any)
    return date > oneDayAgo
  })

  const convertedLeads = activeLeads.filter(lead => lead.status === "converted")
  const conversionRate = totalLeads > 0 
    ? Math.round((convertedLeads.length / totalLeads) * 100) 
    : 0

  const hotLeads = activeLeads.filter(lead => {
    const level = calculateLeadScore(lead).level
    return level === "hot" || level === "priority"
  })

  const priorityLeads = activeLeads.filter(lead => calculateLeadScore(lead).level === "priority")
  const whatsappSentCount = activeLeads.filter(lead => lead.whatsappSent).length

  // 2. Advanced Commercial KPIs
  const leadsWithoutContact = activeLeads.filter(lead => {
    if (lead.contacted || lead.status !== "new") return false
    const date = (lead.createdAt as any)?.toDate ? (lead.createdAt as any).toDate() : new Date((lead.createdAt as any) || 0)
    return (Date.now() - date.getTime()) > 24 * 60 * 60 * 1000
  })

  const leadsAwaitingDocs = activeLeads.filter(lead => (lead as any).needsMoreData === true)
  const leadsAwaitingVisit = activeLeads.filter(lead => lead.status === "scheduled")
  const leadsAwaitingApproval = activeLeads.filter(lead => 
    lead.creditAnalysisStatus === "pending" && lead.cnhNumber
  )

  // Score médio
  const scoreSum = activeLeads.reduce((acc, l) => acc + calculateLeadScore(l).score, 0)
  const avgScore = totalLeads > 0 ? Math.round(scoreSum / totalLeads) : 0

  // Conversão por origem
  const sourceCounts: Record<string, { total: number; converted: number }> = {}
  activeLeads.forEach(lead => {
    const s = lead.source || "Direto"
    if (!sourceCounts[s]) sourceCounts[s] = { total: 0, converted: 0 }
    sourceCounts[s].total++
    if (lead.status === "converted") sourceCounts[s].converted++
  })
  const sourceConversionList = Object.entries(sourceCounts)
    .map(([source, { total, converted }]) => ({
      source,
      total,
      converted,
      rate: total > 0 ? Math.round((converted / total) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // 3. Top vehicles
  const vehicleCounts: Record<string, number> = {}
  activeLeads.forEach(lead => {
    const v = lead.vehicleInterest || "Outros"
    vehicleCounts[v] = (vehicleCounts[v] || 0) + 1
  })
  const topVehicles = Object.entries(vehicleCounts).sort((a, b) => b[1] - a[1])
  const topVehicleName = topVehicles[0] ? topVehicles[0][0] : ""

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
          description={`${priorityLeads.length} prioritários`}
          icon={<Flame className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard 
          title="WhatsApps Enviados"
          value={whatsappSentCount}
          description="Atendimentos ativos"
          icon={<MessageSquare className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard 
          title="Score Médio"
          value={`${avgScore} pts`}
          description="Qualificação do funil"
          icon={<Star className="h-4 w-4 text-slate-400" />}
        />
      </div>

      {/* Supervisor KPIs */}
      {isSupervisor && (
        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <BarChart3 className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">KPIs Operacionais — Supervisores</h3>
            <span className="ml-auto text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              Restrito
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-[10px] font-black uppercase tracking-wider text-red-600">Sem Retorno</p>
              </div>
              <p className="text-2xl font-black text-red-700">{leadsWithoutContact.length}</p>
              <p className="text-[10px] text-red-400 font-semibold">Leads novos sem contato &gt;24h</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1.5">
                <FileQuestion className="h-4 w-4 text-amber-500" />
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">Aguard. Docs</p>
              </div>
              <p className="text-2xl font-black text-amber-700">{leadsAwaitingDocs.length}</p>
              <p className="text-[10px] text-amber-400 font-semibold">Fichas com dados pendentes</p>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-sky-500" />
                <p className="text-[10px] font-black uppercase tracking-wider text-sky-600">Visitas Agend.</p>
              </div>
              <p className="text-2xl font-black text-sky-700">{leadsAwaitingVisit.length}</p>
              <p className="text-[10px] text-sky-400 font-semibold">Motoristas com visita marcada</p>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Aguard. Aprova.</p>
              </div>
              <p className="text-2xl font-black text-indigo-700">{leadsAwaitingApproval.length}</p>
              <p className="text-[10px] text-indigo-400 font-semibold">Crédito pendente de análise</p>
            </div>
          </div>

          {/* Conversão por Canal */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-slate-400" />
              Taxa de Conversão por Canal de Origem
            </h4>
            <div className="space-y-2.5">
              {sourceConversionList.map(({ source, total, converted, rate }) => (
                <div key={source} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-650">
                    <span>{source}</span>
                    <span className="text-slate-500">{converted}/{total} leads ({rate}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-500 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              ))}
              {sourceConversionList.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400 font-semibold">Aguardando dados...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid de Seções */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Leads Recentes */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Leads Recentes</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Contatos mais recentes que precisam de follow-up rápido.</p>
          </div>

          <div className="space-y-3">
            {activeLeads.slice(0, 4).map((lead) => {
              const scoreInfo = calculateLeadScore(lead)
              const cleanPhone = lead.phone.replace(/\D/g, "")
              const waPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
              const waText = encodeURIComponent(`Olá ${lead.fullName.split(" ")[0]}, tudo bem? Sou da equipe comercial do Grupo Michelines. Recebemos seu interesse no ${lead.vehicleInterest}.`)
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
                      {scoreInfo.labelEmoji} {scoreInfo.score} pts
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
            {activeLeads.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">Nenhum lead registrado.</div>
            )}
          </div>
        </div>

        {/* Estatísticas de Demanda */}
        <div className="lg:col-span-6 grid sm:grid-cols-2 gap-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Mais Procurados</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Demanda por modelo de táxi.</p>
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
                      <div className="bg-sky-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
              {topVehicles.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold">Aguardando dados...</div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Origem dos Leads</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Canais de captação ativos.</p>
            </div>
            
            <div className="space-y-3 pt-1">
              {sourceConversionList.map(({ source, total }, idx) => {
                const percent = totalLeads > 0 ? Math.round((total / totalLeads) * 100) : 0
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-650">
                      <span>{source}</span>
                      <span>{total} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
              {sourceConversionList.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold">Aguardando dados...</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
