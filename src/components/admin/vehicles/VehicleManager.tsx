"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Vehicle } from "@/types/vehicle"
import { Lead } from "@/types/lead"
import { VehicleCard } from "./VehicleCard"
import { VehicleForm } from "./VehicleForm"
import { Button } from "@/components/ui/button"
import { Plus, Car, RefreshCw, Flame, TrendingUp, DollarSign, Target, Clock, Database } from "lucide-react"
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
  const [seeding, setSeeding] = useState(false)

  const handleSeedVehicles = async () => {
    if (!confirm("Deseja semear o catálogo com os 10 veículos padrão da Michelines?")) return
    try {
      setSeeding(true)
      
      const BASE_URL = "https://cbynwzxalzcaownnouwp.supabase.co/storage/v1/object/public"
      const carUrl = (f: string) => `${BASE_URL}/vehicles/${f}`

      const DEFAULT_VEHICLES = [
        {
          name: "Corolla Cross D-TAXI",
          slug: "corolla-cross-dtaxi",
          category: "dtaxi",
          brand: "Toyota",
          year: "2024",
          transmission: "automatic",
          fuelType: "hybrid",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: true,
          shortDescription: "Corolla Cross híbrido homologado D-TAXI para a fila de Congonhas. Alta demanda, baixo custo operacional.",
          fullDescription: "O Toyota Corolla Cross é o veículo mais procurado na fila D-TAXI de Congonhas. Motor híbrido proporciona economia de até 40% em combustível vs flex convencional.",
          monthlyPrice: 3200,
          dailyPrice: 110,
          status: "active",
          available: true,
          featured: true,
          showroomFeatured: true,
          showroomOrder: 1,
          thumbnail: carUrl("corolla-cross.png"),
          images: [carUrl("corolla-cross.png")],
          specs: ["Motor 1.8 Híbrido", "CVT Automático", "SUV Compacto", "5 Lugares"],
          tags: ["D-TAXI", "Mais Alugado", "Híbrido Premium"],
          positivePoints: ["Isenção de rodízio", "Consumo eco-híbrido", "Alta demanda Congonhas", "Público executivo"],
          highlights: ["Aprovado D-TAXI", "Motor Híbrido Toyota", "Câmbio CVT"],
          seoTitle: "Corolla Cross D-TAXI Híbrido | Grupo Michelines",
          seoDescription: "Alugue o Corolla Cross D-TAXI homologado para Congonhas. Veículo híbrido com alta demanda aeroportuária.",
        },
        {
          name: "Toyota Corolla Sedan",
          slug: "corolla-sedan",
          category: "sedans",
          brand: "Toyota",
          year: "2024",
          transmission: "automatic",
          fuelType: "hybrid",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan executivo híbrido. Conforto e economia para jornadas longas em São Paulo.",
          fullDescription: "O Toyota Corolla Sedan híbrido é ideal para operações executivas. Combina elegância, conforto e eficiência energética superior.",
          monthlyPrice: 2800,
          dailyPrice: 95,
          status: "active",
          available: true,
          featured: true,
          showroomFeatured: true,
          showroomOrder: 2,
          thumbnail: carUrl("corolla.png"),
          images: [carUrl("corolla.png")],
          specs: ["Motor 1.8 Híbrido", "CVT Automático", "Sedan Executivo", "5 Lugares"],
          tags: ["Executivo", "Híbrido", "Sedan Premium"],
          positivePoints: ["Motor híbrido econômico", "Interior premium", "Ideal para app executivo"],
          highlights: ["Motor Híbrido Toyota", "Acabamento Premium", "Conforto Executivo"],
          seoTitle: "Corolla Sedan Híbrido | Locação Taxi São Paulo",
          seoDescription: "Alugue o Toyota Corolla Sedan híbrido para operações de táxi executivo em SP.",
        },
        {
          name: "Toyota Prius Premium",
          slug: "prius-premium",
          category: "hibridos",
          brand: "Toyota",
          year: "2024",
          transmission: "automatic",
          fuelType: "hybrid",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "O ícone híbrido com máxima eficiência. Custo por km mais baixo da frota.",
          fullDescription: "O Toyota Prius é referência mundial em eficiência híbrida. Consumo médio de 22-25 km/l — menor custo operacional por km.",
          monthlyPrice: 3000,
          dailyPrice: 100,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 3,
          thumbnail: carUrl("prius.png"),
          images: [carUrl("prius.png")],
          specs: ["Motor 1.8 Híbrido", "E-CVT Automático", "Hatchback Premium", "5 Lugares"],
          tags: ["Mais Econômico", "Híbrido", "Baixo Custo"],
          positivePoints: ["25 km/l na cidade", "Isenção de rodízio", "Manutenção econômica"],
          highlights: ["Mais Econômico da Frota", "22-25 km/l", "Marca Toyota"],
          seoTitle: "Toyota Prius Híbrido | Locação Táxi São Paulo",
          seoDescription: "Alugue o Toyota Prius, o veículo híbrido mais econômico para operações de táxi em SP.",
        },
        {
          name: "Hyundai Ioniq Híbrido",
          slug: "ioniq-hibrido",
          category: "hibridos",
          brand: "Hyundai",
          year: "2023",
          transmission: "automatic",
          fuelType: "hybrid",
          isHybrid: true,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedã híbrido coreano. Tecnologia de ponta com custo acessível.",
          fullDescription: "O Hyundai Ioniq híbrido combina design moderno, tecnologia avançada e eficiência energética. Excelente custo de locação.",
          monthlyPrice: 2600,
          dailyPrice: 88,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 4,
          thumbnail: carUrl("ioniq.png"),
          images: [carUrl("ioniq.png")],
          specs: ["Motor 1.6 Híbrido", "DCT Automático", "Sedan", "5 Lugares"],
          tags: ["Híbrido", "Econômico", "Coreano"],
          positivePoints: ["Consumo excepcional", "Design moderno", "Garantia Hyundai"],
          highlights: ["Híbrido Hyundai", "DCT Automático", "Design Aerodinâmico"],
          seoTitle: "Hyundai Ioniq Híbrido | Locação Táxi SP",
          seoDescription: "Alugue o Hyundai Ioniq híbrido para operações de táxi. Econômico e tecnológico.",
        },
        {
          name: "Chevrolet Spin D-TAXI",
          slug: "spin-dtaxi",
          category: "dtaxi",
          brand: "Chevrolet",
          year: "2023",
          transmission: "manual",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: true,
          isDTaxiApproved: true,
          shortDescription: "Minivan com 7 lugares homologada D-TAXI. Alta capacidade e kit GNV incluído.",
          fullDescription: "A Chevrolet Spin D-TAXI com kit GNV é ideal para maximizar capacidade de passageiros em Congonhas. Custo por km reduzido.",
          monthlyPrice: 2400,
          dailyPrice: 82,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 5,
          thumbnail: carUrl("dtaxi-spin.png"),
          images: [carUrl("dtaxi-spin.png"), carUrl("spin-big.png")],
          specs: ["Motor 1.0 Turbo Flex/GNV", "Manual 6 Marchas", "Minivan 7 Lugares", "D-TAXI Homologada"],
          tags: ["D-TAXI", "7 Lugares", "Kit GNV"],
          positivePoints: ["7 passageiros", "Kit GNV instalado", "Baixo custo operacional", "Aprovada Congonhas"],
          highlights: ["D-TAXI Congonhas", "7 Lugares", "Kit GNV Incluso"],
          seoTitle: "Spin D-TAXI 7 Lugares com GNV | Grupo Michelines",
          seoDescription: "Alugue a Chevrolet Spin D-TAXI com kit GNV para a fila de Congonhas. 7 lugares.",
        },
        {
          name: "VW Virtus",
          slug: "virtus",
          category: "sedans",
          brand: "Volkswagen",
          year: "2024",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan moderno com câmbio automático. Ideal para app e corridas urbanas.",
          fullDescription: "O VW Virtus com câmbio automático Tiptronic e motor 1.0 Turbo combina desempenho, conforto e economia.",
          monthlyPrice: 2000,
          dailyPrice: 68,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 6,
          thumbnail: carUrl("virtus.png"),
          images: [carUrl("virtus.png")],
          specs: ["Motor 1.0 TSI 128cv", "Automático Tiptronic", "Sedan Compacto", "5 Lugares"],
          tags: ["Sedan", "Automático", "Econômico"],
          positivePoints: ["Motor turbo eficiente", "Câmbio automático", "Porta-malas espaçoso"],
          highlights: ["TSI 1.0 Turbo", "Automático Tiptronic", "Sedan VW"],
          seoTitle: "VW Virtus | Locação Táxi São Paulo",
          seoDescription: "Alugue o VW Virtus automático para operações de táxi em São Paulo.",
        },
        {
          name: "Chevrolet Onix Plus",
          slug: "onix-plus",
          category: "sedans",
          brand: "Chevrolet",
          year: "2024",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan compacto com a melhor diária da frota. Conforto para o dia a dia.",
          fullDescription: "O Onix Plus com câmbio automático é a opção mais acessível da frota. Ideal para motoristas iniciando na operação de táxi.",
          monthlyPrice: 1850,
          dailyPrice: 62,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 7,
          thumbnail: carUrl("onix-plus.png"),
          images: [carUrl("onix-plus.png")],
          specs: ["Motor 1.0 Turbo", "Automático 6M", "Sedan", "5 Lugares"],
          tags: ["Mais Acessível", "Sedan", "Iniciante"],
          positivePoints: ["Menor diária da frota", "Câmbio automático", "Consumo eficiente"],
          highlights: ["Melhor Custo-Benefício", "1.0 Turbo", "Chevy Quality"],
          seoTitle: "Onix Plus | Locação Táxi São Paulo - Grupo Michelines",
          seoDescription: "Alugue o Chevrolet Onix Plus com a menor diária da frota. Ideal para iniciar no táxi.",
        },
        {
          name: "VW Polo",
          slug: "polo",
          category: "hatches",
          brand: "Volkswagen",
          year: "2024",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Hatch premium com tecnologia avançada e câmbio DSG.",
          fullDescription: "O VW Polo com câmbio DSG de dupla embreagem e motor 1.0 TSI oferece condução suave e eficiente.",
          monthlyPrice: 1950,
          dailyPrice: 66,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 8,
          thumbnail: carUrl("polo.png"),
          images: [carUrl("polo.png")],
          specs: ["Motor 1.0 TSI 116cv", "DSG 7 Marchas", "Hatchback", "5 Lugares"],
          tags: ["Hatch Premium", "DSG", "VW"],
          positivePoints: ["Câmbio DSG suave", "Motor turbo eficiente", "Design premium"],
          highlights: ["DSG 7 Marchas", "TSI 1.0 Turbo", "Premium Hatch"],
          seoTitle: "VW Polo | Locação Táxi São Paulo",
          seoDescription: "Alugue o VW Polo com câmbio DSG. Hatchback premium para táxi em São Paulo.",
        },
        {
          name: "Renault Logan",
          slug: "logan",
          category: "sedans",
          brand: "Renault",
          year: "2023",
          transmission: "manual",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan robusto com porta-malas amplo. Clássico do segmento de táxi.",
          fullDescription: "O Renault Logan é referência inegável em robustez e simplicidade. Com porta-malas generoso e manutenção acessível, é ideal para operações de longa jornada.",
          monthlyPrice: 1700,
          dailyPrice: 57,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 9,
          thumbnail: carUrl("logan.png"),
          images: [carUrl("logan.png")],
          specs: ["Motor 1.0 Flex", "Manual 5 Marchas", "Sedan", "5 Lugares"],
          tags: ["Clássico", "Robusto", "Baixo Custo"],
          positivePoints: ["Porta-malas amplo", "Manutenção barata", "Robustez comprovada"],
          highlights: ["560L de porta-malas", "Motor 1.0 Flex", "Clássico do Táxi"],
          seoTitle: "Renault Logan | Locação Táxi São Paulo",
          seoDescription: "Alugue o Renault Logan para operações de táxi. Robusto, econômico e com grande porta-malas.",
        },
        {
          name: "Fiat Cronos",
          slug: "cronos",
          category: "sedans",
          brand: "Fiat",
          year: "2024",
          transmission: "automatic",
          fuelType: "flex",
          isHybrid: false,
          hasGNV: false,
          isDTaxiApproved: false,
          shortDescription: "Sedan moderno com design europeu e câmbio automático CVT.",
          fullDescription: "O Fiat Cronos traz design italiano, câmbio automático CVT e conforto superior para o segmento de sedan compacto.",
          monthlyPrice: 1900,
          dailyPrice: 65,
          status: "active",
          available: true,
          featured: false,
          showroomFeatured: true,
          showroomOrder: 10,
          thumbnail: carUrl("cronos.png"),
          images: [carUrl("cronos.png")],
          specs: ["Motor 1.3 Firefly", "CVT Automático", "Sedan", "5 Lugares"],
          tags: ["Sedan", "Design Europeu", "Automático"],
          positivePoints: ["Design italiano", "CVT automático suave", "Econômico"],
          highlights: ["Design Fiat Premium", "CVT Suave", "Motor Firefly"],
          seoTitle: "Fiat Cronos | Locação Táxi São Paulo",
          seoDescription: "Alugue o Fiat Cronos CVT automático para operações de táxi em São Paulo.",
        },
      ]

      for (const vehicle of DEFAULT_VEHICLES) {
        await setDoc(doc(db, "vehicles", vehicle.slug), {
          ...vehicle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        const pricing = {
          vehicleId: vehicle.slug,
          dailyRate: vehicle.dailyPrice,
          weeklyRate: Math.round(vehicle.monthlyPrice / 4),
          monthlyRate: vehicle.monthlyPrice,
          weekendExempt: true,
          acceptedPayments: ["pix", "debito", "credito"],
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await setDoc(doc(db, "vehicle_pricing", vehicle.slug), pricing)
      }

      alert("Catálogo de veículos semeado com sucesso!")
      await fetchVehicles()
    } catch (err: any) {
      console.error("Erro ao semear veículos:", err)
      alert("Erro ao semear veículos: " + err.message)
    } finally {
      setSeeding(false)
    }
  }

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
                onClick={handleSeedVehicles}
                disabled={seeding || loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-4 flex items-center gap-2 rounded-lg shadow-md"
              >
                <Database className="h-4 w-4" /> {seeding ? "Semeando..." : "Semear Catálogo"}
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
