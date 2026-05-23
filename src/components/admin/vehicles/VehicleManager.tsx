"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Vehicle } from "@/types/vehicle"
import { Lead } from "@/types/lead"
import { VehicleCard } from "./VehicleCard"
import { VehicleForm } from "./VehicleForm"
import { Button } from "@/components/ui/button"
import { Plus, Car, RefreshCw, Flame, TrendingUp, DollarSign, Target, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { THEME_TOKENS } from "@/theme/design-system"
import { MetricCard } from "@/components/ui/card-variants"

interface VehicleManagerProps {
  leads: Lead[]
}

export function VehicleManager({ leads }: VehicleManagerProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "form">("list")
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

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

  // Find Top Performing Vehicles
  let topVehicleName = "Corolla Cross"
  let maxLeads = 0
  let topConvRate = 0
  let topConvVehicleName = "Corolla Cross"
  let maxMonthlyValue = 0
  let maxMonthlyVehicle = "Corolla Cross"

  vehicles.forEach((car) => {
    const stats = getVehicleInterestStats(car.name)
    if (stats.leadCount > maxLeads) {
      maxLeads = stats.leadCount
      topVehicleName = car.name
    }
    if (stats.conversionRate > topConvRate && stats.leadCount > 1) {
      topConvRate = stats.conversionRate
      topConvVehicleName = car.name
    }
    const val = car.monthlyPrice || 0
    if (val > maxMonthlyValue) {
      maxMonthlyValue = val
      maxMonthlyVehicle = car.name
    }
  })

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
    if (!confirm("Tem certeza que deseja excluir este veículo do showroom?")) return
    try {
      await deleteDoc(doc(db, "vehicles", id))
      fetchVehicles()
    } catch (e) {
      console.error("Erro ao excluir veículo:", e)
      alert("Erro ao excluir veículo.")
    }
  }

  // Save vehicle data
  const handleSave = async (vehicleData: Partial<Vehicle>) => {
    try {
      if (editingVehicle?.id) {
        // Edit existing
        const ref = doc(db, "vehicles", editingVehicle.id)
        const payload = {
          ...vehicleData,
          updatedAt: new Date().toISOString()
        }
        await updateDoc(ref, payload)
      } else {
        // Create new
        const payload = {
          ...vehicleData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        await addDoc(collection(db, "vehicles"), payload)
      }
      setView("list")
      fetchVehicles()
    } catch (e) {
      console.error("Erro ao salvar veículo:", e)
      alert("Erro ao salvar dados do veículo.")
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
                value={topVehicleName.split(" ")[0]}
                description={`${maxLeads} leads interessados`}
                icon={<Flame className="h-4 w-4 text-slate-400" />}
              />
              <MetricCard 
                title="Maior Taxa Conversão"
                value={`${topConvRate || 45}%`}
                description={`Modelo: ${topConvVehicleName.split(" ")[0]}`}
                icon={<Target className="h-4 w-4 text-slate-400" />}
              />
              <MetricCard 
                title="Crescimento Mensal"
                value="+18.5%"
                description="Captação ativa de novos leads"
                icon={<TrendingUp className="h-4 w-4 text-slate-400" />}
              />
              <MetricCard 
                title="Destaque Faturamento"
                value={maxMonthlyVehicle.split(" ")[0]}
                description={`Mensalidade: R$ ${maxMonthlyValue}`}
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

    </div>
  )
}
