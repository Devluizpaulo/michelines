"use client"

import { Lead } from "@/types/lead"
import { ExecutiveCard, MetricCard } from "@/components/ui/card-variants"
import { Badge } from "@/components/ui/badge"
import { THEME_TOKENS } from "@/theme/design-system"
import { BarChart3, TrendingUp, PieChart, Users, Award, Percent } from "lucide-react"

interface AnalyticsDashboardProps {
  leads: Lead[]
}

export function AnalyticsDashboard({ leads }: AnalyticsDashboardProps) {
  const totalLeads = leads.length
  
  // Status Counts
  const newCount = leads.filter(l => l.status === "new").length
  const contactedCount = leads.filter(l => l.status === "contacted").length
  const negotiatingCount = leads.filter(l => l.status === "negotiating").length
  const scheduledCount = leads.filter(l => l.status === "scheduled").length
  const convertedCount = leads.filter(l => l.status === "converted").length
  const lostCount = leads.filter(l => l.status === "lost").length

  // Funnel conversion percentages (relative to total leads)
  const percentNew = totalLeads > 0 ? Math.round((newCount / totalLeads) * 100) : 0
  const percentContacted = totalLeads > 0 ? Math.round((contactedCount / totalLeads) * 100) : 0
  const percentNegotiating = totalLeads > 0 ? Math.round((negotiatingCount / totalLeads) * 100) : 0
  const percentScheduled = totalLeads > 0 ? Math.round((scheduledCount / totalLeads) * 100) : 0
  const percentConverted = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0
  const percentLost = totalLeads > 0 ? Math.round((lostCount / totalLeads) * 100) : 0

  const conversionGlobal = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Overview stats block */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Total de Leads"
          value={totalLeads}
          description="Contatos recebidos via Landing Page"
          icon={<Users className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard 
          title="Taxa de Conversão"
          value={`${conversionGlobal}%`}
          description="Percentual de fechamentos bem-sucedidos"
          icon={<Percent className="h-4 w-4 text-slate-400" />}
          trend={{
            value: "+2.4%",
            label: "vs média mensal",
            isPositive: true
          }}
        />
        <MetricCard 
          title="Contratos Ativos"
          value={convertedCount}
          description="Motoristas rodando na frota"
          icon={<Award className="h-4 w-4 text-slate-400" />}
        />
        <MetricCard 
          title="Em Negociação"
          value={negotiatingCount}
          description="Contatos quentes na esteira"
          icon={<TrendingUp className="h-4 w-4 text-slate-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Metas de Negócio / Conversões */}
        <ExecutiveCard className="p-6 flex flex-col justify-between" hoverEffect={false}>
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-sky-600" />
                  Meta de Efetividade Comercial
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Metas de locação semanais e taxa global.</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {convertedCount} aluguéis
              </Badge>
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {conversionGlobal}%
                </span>
                <span className="text-xs font-semibold text-slate-500">conversão global acumulada</span>
              </div>

              <div className="space-y-2.5 pt-4">
                <div className="flex justify-between text-xs text-slate-650 font-bold">
                  <span>Meta de Conversão Semanal</span>
                  <span>{convertedCount} de 10 Alugados</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                  <div 
                    className="bg-sky-600 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((convertedCount / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50/50 -mx-6 -mb-6 p-4 rounded-b-xl">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Meta baseada em veículos híbridos / GNV contratados em São Paulo.
          </div>
        </ExecutiveCard>

        {/* Funil Visual de Vendas */}
        <ExecutiveCard className="p-6" hoverEffect={false}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <PieChart className="h-4 w-4 text-sky-600" />
                Funil de Aquisição de Leads
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribuição dos contatos por estágio de vendas.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* New */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-650 font-bold">
                <span>Novos Contatos</span>
                <span className="text-slate-900">{newCount} ({percentNew}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${percentNew}%` }} />
              </div>
            </div>

            {/* Contacted */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-650 font-bold">
                <span>Contatos Efetuados</span>
                <span className="text-slate-900">{contactedCount} ({percentContacted}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentContacted}%` }} />
              </div>
            </div>

            {/* Negotiating */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-650 font-bold">
                <span>Em Negociação</span>
                <span className="text-slate-900">{negotiatingCount} ({percentNegotiating}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percentNegotiating}%` }} />
              </div>
            </div>

            {/* Scheduled */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-650 font-bold">
                <span>Visitas Agendadas</span>
                <span className="text-slate-900">{scheduledCount} ({percentScheduled}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${percentScheduled}%` }} />
              </div>
            </div>

            {/* Converted */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-650 font-bold">
                <span>Convertidos (Alugados)</span>
                <span className="text-slate-900">{convertedCount} ({percentConverted}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentConverted}%` }} />
              </div>
            </div>

            {/* Lost */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-650 font-bold">
                <span>Perdidos</span>
                <span className="text-slate-900">{lostCount} ({percentLost}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${percentLost}%` }} />
              </div>
            </div>
          </div>
        </ExecutiveCard>
      </div>
    </div>
  )
}
