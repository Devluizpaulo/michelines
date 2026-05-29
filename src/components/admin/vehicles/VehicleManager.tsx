"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Vehicle } from "@/types/vehicle"
import { Lead } from "@/types/lead"
import { VehicleCard } from "./VehicleCard"
import { VehicleForm } from "./VehicleForm"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Car, RefreshCw, Flame, TrendingUp, DollarSign, Target, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { THEME_TOKENS } from "@/theme/design-system"
import { MetricCard } from "@/components/ui/card-variants"
import { useToast } from "@/components/ui/toast-simple"

interface VehicleManagerProps {
  leads: Lead[]
}

export function VehicleManager({ leads }: VehicleManagerProps) {
  const { success, error: showError, warning } = useToast()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "form">("list")
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null)


  // Load vehicles from Firestore
  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, "vehicles"), orderBy("showroomOrder", "asc"))
      const snap = await getDocs(q)
      const list: Vehicle[] = []
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Vehicle)
      })
      setVehicles(list)
    } catch (e) {
      console.error("Erro ao carregar veículos:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  // Calculate dynamic analytics per vehicle
  const getVehicleInterestStats = (name: string) => {
    const matchedLeads = leads.filter(lead => 
      lead.vehicleInterest?.toLowerCase().includes(name.split(" ")[0].toLowerCase()) ||
      name.toLowerCase().includes(lead.vehicleInterest?.toLowerCase() || "")
    )
    const convertedCount = matchedLeads.filter(l => l.status === "converted").length
    const conversionRate = matchedLeads.length > 0 
      ? Math.round((convertedCount / matchedLeads.length) * 100) 
      : 0

    return {
      leadCount: matchedLeads.length,
      convertedCount,
      conversionRate
    }
  }

  // Find Top Performing Vehicles & dynamic leads growth
  let topVehicleName = ""
  let maxLeads = 0
  let topConvRate = 0
  let topConvVehicleName = ""
  let maxMonthlyValue = 0
  let maxMonthlyVehicle = ""

  vehicles.forEach((car) => {
    const stats = getVehicleInterestStats(car.name)
    if (stats.leadCount > maxLeads) {
      maxLeads = stats.leadCount
      topVehicleName = car.name
    }
    if (stats.conversionRate > topConvRate && stats.leadCount > 0) {
      topConvRate = stats.conversionRate
      topConvVehicleName = car.name
    }
    const val = car.monthlyPrice || 0
    if (val > maxMonthlyValue) {
      maxMonthlyValue = val
      maxMonthlyVehicle = car.name
    }
  })

  // Calculate real monthly growth rate of leads
  let monthlyGrowth = 0
  let growthDescription = "Captação de leads inativa"
  
  if (leads.length > 0) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1005)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1005)

    const currentMonthLeads = leads.filter(lead => {
      const date = lead.createdAt?.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt)
      return date >= thirtyDaysAgo && date <= now
    }).length

    const lastMonthLeads = leads.filter(lead => {
      const date = lead.createdAt?.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt)
      return date >= sixtyDaysAgo && date < thirtyDaysAgo
    }).length

    if (lastMonthLeads > 0) {
      monthlyGrowth = Math.round(((currentMonthLeads - lastMonthLeads) / lastMonthLeads) * 100)
    } else if (currentMonthLeads > 0) {
      monthlyGrowth = 100
    }
    
    if (monthlyGrowth > 0) {
      growthDescription = "Crescimento positivo de leads"
    } else if (monthlyGrowth < 0) {
      growthDescription = "Queda no volume de captação"
    } else {
      growthDescription = "Volume de captação estável"
    }
  }

  // Open Form for Creation
  const handleAddNew = () => {
    setEditingVehicle(null)
    setView("form")
  }

  // Open Form for Editing
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setView("form")
  }

  // Delete vehicle doc
  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este veículo do showroom?")) return
    try {
      await deleteDoc(doc(db, "vehicles", id))
      try {
        await deleteDoc(doc(db, "vehicle_pricing", id))
      } catch (pe) {
        console.warn("Nenhum preço encontrado para deletar:", pe)
      }
      success("Veículo excluído!", "O veículo foi removido do showroom.")
      fetchVehicles()
    } catch (e: any) {
      console.error("Erro ao excluir veículo:", e)
      showError("Erro ao excluir veículo", e?.message || "Tente novamente.")
    }
  }

  // Save vehicle data
  const handleSave = async (vehicleData: Partial<Vehicle>) => {
    try {
      const slug = vehicleData.slug?.trim()
      if (!slug) {
        showError("Erro ao salvar", "O slug do veículo é obrigatório.")
        return
      }

      const now = new Date().toISOString()

      if (editingVehicle?.id) {
        // Edit existing
        const oldId = editingVehicle.id

        // If slug changed, delete the old documents
        if (oldId !== slug) {
          await deleteDoc(doc(db, "vehicles", oldId))
          try {
            await deleteDoc(doc(db, "vehicle_pricing", oldId))
          } catch (pe) {
            console.warn("Nenhum preço antigo encontrado para deletar:", pe)
          }
        }

        // Set/update the new document
        const ref = doc(db, "vehicles", slug)
        const payload = {
          ...vehicleData,
          updatedAt: now
        }
        await setDoc(ref, payload, { merge: true })

        // Save pricing document as well
        const pricingRef = doc(db, "vehicle_pricing", slug)
        const pricingPayload = {
          vehicleId: slug,
          dailyRate: vehicleData.dailyPrice || 0,
          weeklyRate: vehicleData.weeklyPrice || Math.round((vehicleData.monthlyPrice || 0) / 4),
          monthlyRate: vehicleData.monthlyPrice || 0,
          weekendExempt: true,
          acceptedPayments: ["pix", "debito", "credito"],
          active: true,
          updatedAt: now
        }
        await setDoc(pricingRef, pricingPayload, { merge: true })

        success("Veículo atualizado!", `"${vehicleData.name}" foi salvo com sucesso.`)
      } else {
        // Create new
        const ref = doc(db, "vehicles", slug)
        const payload = {
          ...vehicleData,
          createdAt: now,
          updatedAt: now
        }
        await setDoc(ref, payload)

        // Create new pricing document
        const pricingRef = doc(db, "vehicle_pricing", slug)
        const pricingPayload = {
          vehicleId: slug,
          dailyRate: vehicleData.dailyPrice || 0,
          weeklyRate: vehicleData.weeklyPrice || Math.round((vehicleData.monthlyPrice || 0) / 4),
          monthlyRate: vehicleData.monthlyPrice || 0,
          weekendExempt: true,
          acceptedPayments: ["pix", "debito", "credito"],
          active: true,
          createdAt: now,
          updatedAt: now
        }
        await setDoc(pricingRef, pricingPayload)

        success("Veículo criado!", `"${vehicleData.name}" foi adicionado ao showroom.`)
      }
      setView("list")
      fetchVehicles()
    } catch (e: any) {
      console.error("Erro ao salvar veículo:", e)
      showError("Erro ao salvar veículo", e?.message || "Tente novamente.")
    }
  }

  return (
    <div className="space-y-8 select-none">
      
      {view === "list" ? (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Car className="h-5 w-5 text-sky-600" />
                Portfólio Comercial (Showroom)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-semibold">Monitore cliques, conversões de leads e o desempenho de vendas dos seus modelos.</p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={fetchVehicles} 
                className="border-slate-200 hover:border-slate-350 bg-white text-slate-500 hover:text-slate-700 h-10 w-10 p-0 shadow-sm"
              >
                <RefreshCw className="h-4.5 w-4.5" />
              </Button>

              <Button 
                onClick={handleAddNew}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-10 px-4 flex items-center gap-2 rounded-lg shadow-md"
              >
                <Plus className="h-4 w-4" /> Novo Veículo
              </Button>
            </div>
          </div>

          {/* Vehicle Performance Dashboard Overview */}
          {!loading && vehicles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                title="Mais Procurado"
                value={maxLeads > 0 ? topVehicleName.split(" ")[0] : "-"}
                description={maxLeads > 0 ? `${maxLeads} leads interessados` : "Sem dados de procura"}
                icon={<Flame className="h-4 w-4 text-slate-400" />}
              />
              <MetricCard 
                title="Maior Taxa Conversão"
                value={topConvRate > 0 ? `${topConvRate}%` : "-"}
                description={topConvRate > 0 ? `Modelo: ${topConvVehicleName.split(" ")[0]}` : "Sem conversões registradas"}
                icon={<Target className="h-4 w-4 text-slate-400" />}
              />
              <MetricCard 
                title="Crescimento Mensal"
                value={leads.length > 0 ? (monthlyGrowth >= 0 ? `+${monthlyGrowth}%` : `${monthlyGrowth}%`) : "-"}
                description={leads.length > 0 ? growthDescription : "Sem leads cadastrados"}
                icon={<TrendingUp className="h-4 w-4 text-slate-400" />}
              />
              <MetricCard 
                title="Destaque Faturamento"
                value={maxMonthlyValue > 0 ? maxMonthlyVehicle.split(" ")[0] : "-"}
                description={maxMonthlyValue > 0 ? `Mensalidade: R$ ${maxMonthlyValue}` : "Nenhum veículo ativo"}
                icon={<DollarSign className="h-4 w-4 text-slate-400" />}
              />
            </div>
          )}

          {/* Vehicle Grid */}
          {loading ? (
            <div className="h-64 border border-slate-200 rounded-2xl flex flex-col gap-3 items-center justify-center text-slate-400 font-semibold">
              <span className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full"></span>
              <p className="text-xs">Carregando catálogo de veículos...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="h-32 border border-dashed border-slate-250 rounded-xl flex items-center justify-center text-xs text-slate-500 font-semibold">
              Nenhum veículo cadastrado no showroom.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((car) => {
                const stats = getVehicleInterestStats(car.name)
                return (
                  <div key={car.id} className="relative group">
                    <VehicleCard 
                      vehicle={car} 
                      onView={setViewingVehicle}
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                    />
                    
                    {/* Small overlay badge indicating leads count */}
                    <div className="absolute top-2.5 right-24 bg-white/90 backdrop-blur-sm border border-slate-200 text-[9px] font-bold text-slate-600 px-2 py-0.5 rounded-full select-none shadow-sm">
                      {stats.leadCount} leads
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <VehicleForm 
          vehicle={editingVehicle} 
          onSave={handleSave} 
          onCancel={() => setView("list")} 
        />
      )}

      {/* Read-only details dialog */}
      <Dialog open={viewingVehicle !== null} onOpenChange={(open) => !open && setViewingVehicle(null)}>
        <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-0">
          {viewingVehicle && (
            <div className="flex flex-col">
              
              {/* Cover Banner */}
              <div className="relative h-64 bg-slate-900 overflow-hidden flex items-center justify-center">
                {/* Gradient Ambient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
                {viewingVehicle.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={viewingVehicle.thumbnail} 
                    alt={viewingVehicle.name} 
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <span className="text-slate-400 text-sm font-bold uppercase z-10">Sem Capa Comercial</span>
                )}
                
                {/* Floating tags */}
                <div className="absolute bottom-4 left-6 z-20 space-y-1 text-left">
                  <span className="text-[10px] text-sky-400 font-extrabold uppercase tracking-widest block">{viewingVehicle.brand} • Ano {viewingVehicle.year}</span>
                  <h2 className="text-2xl font-black text-white">{viewingVehicle.name}</h2>
                </div>

                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  {viewingVehicle.isDTaxiApproved && (
                    <Badge className="bg-sky-500 text-white border-0 text-[9px] font-black uppercase py-0.5 px-2.5 shadow-md rounded-md">
                      ✈️ D-TAXI
                    </Badge>
                  )}
                  {viewingVehicle.isHybrid && (
                    <Badge className="bg-emerald-500 text-white border-0 text-[9px] font-black uppercase py-0.5 px-2.5 shadow-md rounded-md">
                      🔋 Híbrido
                    </Badge>
                  )}
                  {viewingVehicle.hasGNV && (
                    <Badge className="bg-orange-500 text-white border-0 text-[9px] font-black uppercase py-0.5 px-2.5 shadow-md rounded-md">
                      ⛽ Kit GNV
                    </Badge>
                  )}
                </div>
              </div>

              {/* Grid content */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Planos de Precificação */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black tracking-widest text-slate-450 uppercase text-left">Tabela Comercial de Planos</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-xl text-center">
                      <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider block mb-1">Por Diária</span>
                      <span className="text-base font-black text-slate-800">R$ {viewingVehicle.dailyPrice || 0}</span>
                      <span className="text-[8px] text-slate-500 font-semibold block mt-1">Faturamento diário</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-xl text-center">
                      <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider block mb-1">Semanal</span>
                      <span className="text-base font-black text-slate-800">R$ {viewingVehicle.weeklyPrice || Math.round((viewingVehicle.monthlyPrice || 0) / 4)}</span>
                      <span className="text-[8px] text-slate-500 font-semibold block mt-1">Ajuste de 6 diárias</span>
                    </div>
                    <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-center relative overflow-hidden">
                      <span className="text-[9px] text-sky-700 font-black uppercase tracking-wider block mb-1">Mensal Premium</span>
                      <span className="text-base font-black text-emerald-600">R$ {viewingVehicle.monthlyPrice || 0}</span>
                      <span className="text-[8px] text-sky-600 font-semibold block mt-1">Contrato corporativo</span>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-left">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-450 font-black uppercase tracking-widest block">Resumo do Showroom</span>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed bg-slate-50 p-3.5 border border-slate-200/60 rounded-xl text-justify">
                      {viewingVehicle.shortDescription || "Nenhum resumo comercial preenchido."}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-450 font-black uppercase tracking-widest block">Ficha Técnica Completa</span>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed bg-slate-50 p-3.5 border border-slate-200/60 rounded-xl text-justify">
                      {viewingVehicle.fullDescription || "Nenhuma descrição detalhada preenchida."}
                    </p>
                  </div>
                </div>

                {/* Diferenciais e Pontos Fortes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-left">
                  
                  {/* Pontos Positivos */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-450 font-black uppercase tracking-widest block">Pontos Positivos (Vantagens)</span>
                    {viewingVehicle.positivePoints && viewingVehicle.positivePoints.length > 0 ? (
                      <ul className="space-y-1.5">
                        {viewingVehicle.positivePoints.map((pt, idx) => (
                          <li key={idx} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nenhum ponto registrado.</p>
                    )}
                  </div>

                  {/* Highlights Premium */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-450 font-black uppercase tracking-widest block">Diferenciais Premium</span>
                    {viewingVehicle.highlights && viewingVehicle.highlights.length > 0 ? (
                      <ul className="space-y-1.5">
                        {viewingVehicle.highlights.map((h, idx) => (
                          <li key={idx} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nenhum diferencial registrado.</p>
                    )}
                  </div>

                </div>

                {/* Tags, Specs & SEO */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 pt-4 text-left">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Metadados e SEO</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Tags do Showroom</span>
                      <p className="truncate">{viewingVehicle.tags?.join(", ") || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Especificações Rápidas</span>
                      <p className="truncate">{viewingVehicle.specs?.join(", ") || "—"}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2 border-t border-slate-150 pt-2">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Google Meta Title (SEO)</span>
                      <p className="text-slate-800 font-extrabold">{viewingVehicle.seoTitle || "—"}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Google Meta Description</span>
                      <p className="text-slate-500 font-medium text-justify">{viewingVehicle.seoDescription || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setViewingVehicle(null)}
                    className="border-slate-250 hover:border-slate-350 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm"
                  >
                    Fechar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      const temp = viewingVehicle
                      setViewingVehicle(null)
                      handleEdit(temp)
                    }}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                  >
                    Editar Veículo
                  </Button>
                </div>

              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
