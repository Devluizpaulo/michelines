"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Vehicle } from "@/types/vehicle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Sliders, 
  Coins, 
  Check, 
  Edit3, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  Sparkles,
  Layers,
  HelpCircle
} from "lucide-react"

interface PricingConfig {
  id?: string
  vehicleId: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  weekendExempt: boolean
  acceptedPayments: string[]
  active: boolean
  promoCampaign?: string
}

interface OperationalFeature {
  id?: string
  title: string
  description: string
  icon: string
  featured: boolean
  active: boolean
  order: number
}

interface SimulatorScenario {
  id?: string
  category: "convencional" | "michelines"
  weeklyCostLabel: string
  monthlyCostLabel: string
  kmLimit: string
  hasDeposit: boolean
  rodizioExempt: boolean
  support24h: boolean
  executiveOperation: boolean
}

export function OperationManager() {
  const [activeSubTab, setActiveSubTab] = useState<"pricing" | "features" | "scenarios">("pricing")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [pricingConfigs, setPricingConfigs] = useState<PricingConfig[]>([])
  const [operationalFeatures, setOperationalFeatures] = useState<OperationalFeature[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pricing Form States
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [pricingForm, setPricingForm] = useState<Partial<PricingConfig>>({
    dailyRate: 0,
    weeklyRate: 0,
    monthlyRate: 0,
    weekendExempt: true,
    acceptedPayments: ["pix"],
    active: true,
    promoCampaign: ""
  })
  const [isEditingPricing, setIsEditingPricing] = useState(false)

  // Features Form States
  const [selectedFeature, setSelectedFeature] = useState<OperationalFeature | null>(null)
  const [featureForm, setFeatureForm] = useState<Partial<OperationalFeature>>({
    title: "",
    description: "",
    icon: "Shield",
    featured: false,
    active: true,
    order: 0
  })
  const [isEditingFeature, setIsEditingFeature] = useState(false)

  // Simulator Scenario States
  const [convencionalForm, setConvencionalForm] = useState<Partial<SimulatorScenario>>({
    category: "convencional",
    weeklyCostLabel: "A partir de R$ 750/sem",
    monthlyCostLabel: "A partir de R$ 3.000/mês",
    kmLimit: "Restrito (2.500 km/sem)",
    hasDeposit: true,
    rodizioExempt: false,
    support24h: false,
    executiveOperation: false
  })
  const [michelinesForm, setMichelinesForm] = useState<Partial<SimulatorScenario>>({
    category: "michelines",
    weeklyCostLabel: "A partir de R$ 900/sem",
    monthlyCostLabel: "A partir de R$ 3.600/mês",
    kmLimit: "Quilometragem flexível",
    hasDeposit: false,
    rodizioExempt: true,
    support24h: true,
    executiveOperation: true
  })

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load Vehicles
      const vehiclesSnap = await getDocs(query(collection(db, "vehicles"), orderBy("showroomOrder", "asc")))
      const vList: Vehicle[] = []
      vehiclesSnap.forEach((doc) => {
        vList.push({ id: doc.id, ...doc.data() } as Vehicle)
      })
      setVehicles(vList)

      // Load Pricing Rules
      const pricingSnap = await getDocs(collection(db, "vehicle_pricing"))
      const pList: PricingConfig[] = []
      pricingSnap.forEach((doc) => {
        pList.push({ id: doc.id, ...doc.data() } as PricingConfig)
      })
      setPricingConfigs(pList)

      // Load Features
      const featuresSnap = await getDocs(query(collection(db, "operational_features"), orderBy("order", "asc")))
      const fList: OperationalFeature[] = []
      featuresSnap.forEach((doc) => {
        fList.push({ id: doc.id, ...doc.data() } as OperationalFeature)
      })
      setOperationalFeatures(fList)

      // Load Simulator Scenarios
      const scenariosSnap = await getDocs(collection(db, "simulator_scenarios"))
      const sList: SimulatorScenario[] = []
      scenariosSnap.forEach((doc) => {
        sList.push({ id: doc.id, ...doc.data() } as SimulatorScenario)
      })
      
      const conv = sList.find(s => s.category === "convencional")
      if (conv) setConvencionalForm(conv)

      const mich = sList.find(s => s.category === "michelines")
      if (mich) setMichelinesForm(mich)

    } catch (e) {
      console.error("Erro ao carregar dados operacionais:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Start pricing config
  const handleConfigurePricing = (vehicle: Vehicle) => {
    const existing = pricingConfigs.find(p => p.vehicleId === vehicle.id)
    setSelectedVehicle(vehicle)
    if (existing) {
      setPricingForm(existing)
    } else {
      setPricingForm({
        vehicleId: vehicle.id!,
        dailyRate: vehicle.dailyPrice || Math.round((vehicle.monthlyPrice || 2400) / 30),
        weeklyRate: Math.round((vehicle.monthlyPrice || 2400) / 4),
        monthlyRate: vehicle.monthlyPrice || 2400,
        weekendExempt: true,
        acceptedPayments: ["pix", "debito", "credito"],
        active: true,
        promoCampaign: ""
      })
    }
    setIsEditingPricing(true)
  }

  // Save Pricing
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicle?.id) return
    try {
      const docId = pricingForm.id || `pricing_${selectedVehicle.id}`
      const ref = doc(db, "vehicle_pricing", docId)
      
      const payload = {
        ...pricingForm,
        vehicleId: selectedVehicle.id,
        updatedAt: new Date().toISOString()
      }
      
      await setDoc(ref, payload)
      setIsEditingPricing(false)
      setSelectedVehicle(null)
      loadData()
    } catch (e) {
      console.error(e)
      alert("Erro ao salvar precificação.")
    }
  }

  // Handle payment method toggling
  const handleTogglePaymentMethod = (method: string) => {
    const current = pricingForm.acceptedPayments || []
    if (current.includes(method)) {
      setPricingForm(prev => ({
        ...prev,
        acceptedPayments: current.filter(m => m !== method)
      }))
    } else {
      setPricingForm(prev => ({
        ...prev,
        acceptedPayments: [...current, method]
      }))
    }
  }

  // Seeding default features helper
  const handleSeedFeatures = async () => {
    if (!confirm("Isso irá criar os 6 diferenciais operacionais padrão recomendados no banco de dados. Confirmar?")) return
    try {
      const defaultFeatures = [
        { title: "Suporte Operacional Real", description: "Atendimento presencial e telefônico por equipe humana capacitada.", icon: "PhoneCall", featured: true, active: true, order: 1 },
        { title: "Oficina Própria Integrada", description: "Infraestrutura própria de manutenção preventiva e mecânica geral rápida.", icon: "Hammer", featured: true, active: true, order: 2 },
        { title: "Previsibilidade Financeira", description: "Diárias estipuladas de segunda a sábado. Domingos isentos.", icon: "Shield", featured: true, active: true, order: 3 },
        { title: "Estrutura para o Motorista", description: "Sede física com Wi-Fi, café expresso, área de descanso e carregamento.", icon: "Coffee", featured: false, active: true, order: 4 },
        { title: "Isenção Total de Rodízio", description: "Veículos híbridos ou táxis autorizados com rodagem 100% livre em SP.", icon: "AlertCircle", featured: false, active: true, order: 5 },
        { title: "Frota Moderna & Revisada", description: "Veículos seminovos (2 a 3 anos de idade média) com inspeções frequentes.", icon: "RefreshCw", featured: false, active: true, order: 6 }
      ]

      for (const feat of defaultFeatures) {
        await addDoc(collection(db, "operational_features"), feat)
      }
      loadData()
      alert("Diferenciais criados com sucesso!")
    } catch (e) {
      console.error(e)
      alert("Erro ao semear diferenciais.")
    }
  }

  // Start Feature Edit
  const handleEditFeature = (feature: OperationalFeature) => {
    setSelectedFeature(feature)
    setFeatureForm(feature)
    setIsEditingFeature(true)
  }

  // Create new feature
  const handleAddNewFeature = () => {
    setSelectedFeature(null)
    setFeatureForm({
      title: "",
      description: "",
      icon: "Shield",
      featured: false,
      active: true,
      order: operationalFeatures.length + 1
    })
    setIsEditingFeature(true)
  }

  // Save Feature
  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedFeature?.id) {
        // Edit
        const ref = doc(db, "operational_features", selectedFeature.id)
        await updateDoc(ref, {
          ...featureForm,
          updatedAt: new Date().toISOString()
        })
      } else {
        // Create
        await addDoc(collection(db, "operational_features"), {
          ...featureForm,
          createdAt: new Date().toISOString()
        })
      }
      setIsEditingFeature(false)
      setSelectedFeature(null)
      loadData()
    } catch (e) {
      console.error(e)
      alert("Erro ao salvar diferencial.")
    }
  }

  // Delete Feature
  const handleDeleteFeature = async (id: string) => {
    if (!confirm("Excluir este diferencial do banco?")) return
    try {
      await deleteDoc(doc(db, "operational_features", id))
      loadData()
    } catch (e) {
      console.error(e)
      alert("Erro ao excluir diferencial.")
    }
  }

  // Save Scenario
  const handleSaveScenario = async (category: "convencional" | "michelines") => {
    try {
      const form = category === "convencional" ? convencionalForm : michelinesForm
      const docId = `scenario_${category}`
      const ref = doc(db, "simulator_scenarios", docId)
      
      const payload = {
        ...form,
        category,
        updatedAt: new Date().toISOString()
      }
      
      await setDoc(ref, payload)
      alert(`Cenário ${category === "convencional" ? "Modelo Convencional" : "Grupo Michelines"} atualizado no Firestore!`)
      loadData()
    } catch (e) {
      console.error(e)
      alert("Erro ao salvar cenário de simulação.")
    }
  }

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-sky-600" />
            Configurações Operacionais & Precificação
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">
            Gerencie planos flexíveis de pagamento, isenções de rodízio e os cenários do comparador no Firestore.
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={loadData} 
          className="border-slate-200 hover:border-slate-350 bg-white text-slate-500 hover:text-slate-700 h-10 w-10 p-0 shadow-sm"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </Button>
      </div>

      {/* Sub-tabs Selection */}
      <div className="flex gap-2 border-b border-slate-250 pb-px">
        <button
          onClick={() => { setActiveSubTab("pricing"); setIsEditingPricing(false); setIsEditingFeature(false); }}
          className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-all ${
            activeSubTab === "pricing" 
              ? "border-sky-500 text-sky-650" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          💰 Precificação por Veículo
        </button>
        <button
          onClick={() => { setActiveSubTab("features"); setIsEditingPricing(false); setIsEditingFeature(false); }}
          className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-all ${
            activeSubTab === "features" 
              ? "border-sky-500 text-sky-650" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          🛡️ Diferenciais do Grupo
        </button>
        <button
          onClick={() => { setActiveSubTab("scenarios"); setIsEditingPricing(false); setIsEditingFeature(false); }}
          className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-all ${
            activeSubTab === "scenarios" 
              ? "border-sky-500 text-sky-650" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          📊 Cenários Comparador
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="h-64 flex flex-col gap-2 items-center justify-center text-slate-500">
          <span className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full" />
          <p className="text-xs font-semibold">Carregando painel operacional...</p>
        </div>
      ) : activeSubTab === "pricing" ? (
        
        isEditingPricing && selectedVehicle ? (
          /* PRICING FORM EDITOR */
          <form onSubmit={handleSavePricing} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Configurar Regras de Faturamento</h3>
                <p className="text-xs text-sky-650 font-semibold mt-0.5">{selectedVehicle.name}</p>
              </div>
              <Badge className="bg-sky-50 text-sky-700 border-sky-200 uppercase text-[9px] font-black">
                pricing_settings
              </Badge>
            </div>

            {/* Rates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="dailyRate" className="text-xs font-bold text-slate-700">Preço Diário (R$)</Label>
                <Input 
                  id="dailyRate" 
                  type="number"
                  value={pricingForm.dailyRate || 0}
                  onChange={(e) => setPricingForm(prev => ({ ...prev, dailyRate: Number(e.target.value) }))}
                  className="bg-white border-slate-200 focus-visible:ring-sky-500 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weeklyRate" className="text-xs font-bold text-slate-700">Preço Semanal (R$)</Label>
                <Input 
                  id="weeklyRate" 
                  type="number"
                  value={pricingForm.weeklyRate || 0}
                  onChange={(e) => setPricingForm(prev => ({ ...prev, weeklyRate: Number(e.target.value) }))}
                  className="bg-white border-slate-200 focus-visible:ring-sky-500 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="monthlyRate" className="text-xs font-bold text-slate-700">Preço Mensal (R$)</Label>
                <Input 
                  id="monthlyRate" 
                  type="number"
                  value={pricingForm.monthlyRate || 0}
                  onChange={(e) => setPricingForm(prev => ({ ...prev, monthlyRate: Number(e.target.value) }))}
                  className="bg-white border-slate-200 focus-visible:ring-sky-500 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Exempt Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
              <input 
                type="checkbox" 
                id="weekendExempt" 
                checked={pricingForm.weekendExempt || false}
                onChange={(e) => setPricingForm(prev => ({ ...prev, weekendExempt: e.target.checked }))}
                className="h-4.5 w-4.5 rounded border-slate-250 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <div>
                <label htmlFor="weekendExempt" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                  Domingos e Feriados Nacionais Isentos
                </label>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Se ativado, o showroom exibirá as diárias calculadas de segunda a sábado, com domingos e feriados nacionais isentos de diária.
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Meios de Pagamento Aceitos</Label>
              <div className="flex gap-4">
                {["pix", "debito", "credito"].map((method) => {
                  const isChecked = (pricingForm.acceptedPayments || []).includes(method)
                  return (
                    <div key={method} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`pm-${method}`}
                        checked={isChecked}
                        onChange={() => handleTogglePaymentMethod(method)}
                        className="h-4 w-4 rounded border-slate-250 text-sky-600 cursor-pointer"
                      />
                      <label htmlFor={`pm-${method}`} className="text-xs font-bold text-slate-700 uppercase cursor-pointer">
                        {method}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Promotion Field */}
            <div className="space-y-1.5">
              <Label htmlFor="promoCampaign" className="text-xs font-bold text-slate-700">Campanha Promocional Vinculada (Opcional)</Label>
              <Input 
                id="promoCampaign" 
                value={pricingForm.promoCampaign || ""}
                onChange={(e) => setPricingForm(prev => ({ ...prev, promoCampaign: e.target.value }))}
                placeholder="Ex: TAXA ZERO primeira semana"
                className="bg-white border-slate-200"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2.5">
              <input 
                type="checkbox" 
                id="active"
                checked={pricingForm.active || false}
                onChange={(e) => setPricingForm(prev => ({ ...prev, active: e.target.checked }))}
                className="h-4.5 w-4.5 rounded border-slate-250 text-sky-600"
              />
              <label htmlFor="active" className="text-xs font-bold text-slate-700 cursor-pointer">
                Ativar este plano de precificação no showroom
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsEditingPricing(false); setSelectedVehicle(null); }}
                className="border-slate-250 text-slate-700 bg-white"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-sky-650 hover:bg-sky-555 text-white font-bold flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> Salvar Configurações
              </Button>
            </div>

          </form>
        ) : (
          /* VEHICLES LIST VIEW */
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs uppercase font-black tracking-widest text-slate-450">Tabela de Preços e Isenções</h3>
            </div>
            
            <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {vehicles.map((car) => {
                const config = pricingConfigs.find(p => p.vehicleId === car.id)
                return (
                  <div key={car.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/40">
                    <div className="space-y-1">
                      <p className="text-sm font-extrabold text-slate-900">{car.name}</p>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>Marca: {car.brand}</span>
                        <span>•</span>
                        <span>Categoria: {car.category}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      {config ? (
                        <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase font-black block">Diária</span>
                            <span className="font-extrabold text-slate-800">R$ {config.dailyRate}/d</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase font-black block">Semanal</span>
                            <span className="font-extrabold text-slate-800">R$ {config.weeklyRate}/s</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase font-black block">Mensal</span>
                            <span className="font-extrabold text-emerald-650">R$ {config.monthlyRate}/m</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-450 italic">Utilizando preços padrão do showroom</div>
                      )}

                      <div className="flex items-center gap-2">
                        {config?.weekendExempt ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-250 text-[9px] font-bold">
                            📅 Domingos & Feriados Isentos
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-550 border-slate-250 text-[9px] font-bold">
                            Diárias Corridas
                          </Badge>
                        )}

                        {config?.active ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-350" />
                        )}
                      </div>

                      <Button 
                        onClick={() => handleConfigurePricing(car)}
                        className="bg-slate-50 border border-slate-200 hover:border-sky-500 hover:bg-sky-600 hover:text-white text-slate-700 text-xs font-bold h-9 px-3 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Configurar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      ) : activeSubTab === "features" ? (
        /* OPERATIONAL FEATURES TAB */
        isEditingFeature ? (
          /* FEATURE FORM EDITOR */
          <form onSubmit={handleSaveFeature} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  {selectedFeature ? "Editar Diferencial" : "Adicionar Novo Diferencial"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Defina o benefício que o motorista terá na plataforma.</p>
              </div>
              <Badge className="bg-sky-50 text-sky-700 border-sky-200 uppercase text-[9px] font-black">
                operational_features
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="feat-title" className="text-xs font-bold text-slate-700">Título do Benefício</Label>
                <Input 
                  id="feat-title"
                  value={featureForm.title || ""}
                  onChange={(e) => setFeatureForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Suporte operacional real"
                  className="bg-white border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="feat-icon" className="text-xs font-bold text-slate-700">Ícone (Nome Lucide)</Label>
                  <Input 
                    id="feat-icon"
                    value={featureForm.icon || ""}
                    onChange={(e) => setFeatureForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="Ex: Coffee, Hammer, Shield"
                    className="bg-white border-slate-200 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="feat-order" className="text-xs font-bold text-slate-700">Ordem de Exibição</Label>
                  <Input 
                    id="feat-order"
                    type="number"
                    value={featureForm.order || 0}
                    onChange={(e) => setFeatureForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                    className="bg-white border-slate-200"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="feat-desc" className="text-xs font-bold text-slate-700">Descrição Detalhada</Label>
              <Textarea 
                id="feat-desc"
                value={featureForm.description || ""}
                onChange={(e) => setFeatureForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Explique o diferencial de forma humana, clara e profissional."
                className="bg-white border-slate-200 min-h-[80px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox" 
                  id="feat-feat"
                  checked={featureForm.featured || false}
                  onChange={(e) => setFeatureForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4.5 w-4.5 rounded border-slate-250 text-sky-600 cursor-pointer"
                />
                <label htmlFor="feat-feat" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Destaque Principal (Exibição Premium)
                </label>
              </div>

              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox" 
                  id="feat-active"
                  checked={featureForm.active || false}
                  onChange={(e) => setFeatureForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4.5 w-4.5 rounded border-slate-250 text-sky-600 cursor-pointer"
                />
                <label htmlFor="feat-active" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Diferencial Ativo
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsEditingFeature(false); setSelectedFeature(null); }}
                className="border-slate-250 text-slate-700 bg-white"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-sky-650 hover:bg-sky-550 text-white font-bold flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> Salvar Diferencial
              </Button>
            </div>
          </form>
        ) : (
          /* FEATURES LIST VIEW */
          <div className="space-y-6">
            <div className="flex gap-3 justify-end">
              {operationalFeatures.length === 0 && (
                <Button 
                  onClick={handleSeedFeatures}
                  className="bg-emerald-650 hover:bg-emerald-555 text-white font-bold text-xs h-10 px-4 flex items-center gap-2 rounded-lg shadow-sm"
                >
                  <Sparkles className="h-4.5 w-4.5" /> Semear Diferenciais Padrão
                </Button>
              )}
              <Button 
                onClick={handleAddNewFeature}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-10 px-4 flex items-center gap-2 rounded-lg shadow-md"
              >
                <Plus className="h-4 w-4" /> Novo Diferencial
              </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs uppercase font-black tracking-widest text-slate-450">Diferenciais Operacionais Cadastrados</h3>
              </div>

              <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {operationalFeatures.map((feat) => (
                  <div key={feat.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/40">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[9px]">
                          {feat.icon}
                        </Badge>
                        <p className="text-sm font-extrabold text-slate-900">{feat.title}</p>
                        {feat.featured && (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-250 text-[9px] font-black">
                            Destaque
                          </Badge>
                        )}
                        {!feat.active && (
                          <Badge className="bg-slate-100 text-slate-400 text-[9px]">Inativo</Badge>
                        )}
                      </div>
                      <p className="text-slate-500 leading-relaxed">{feat.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-black">Ordem: {feat.order}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditFeature(feat)}
                        className="text-sky-650 hover:text-sky-750 hover:bg-slate-100 h-8 px-2.5 flex items-center gap-1 font-bold rounded-lg text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => feat.id && handleDeleteFeature(feat.id)}
                        className="text-red-650 hover:text-red-750 hover:bg-slate-100 h-8 px-2.5 flex items-center gap-1 font-bold rounded-lg text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        /* SIMULATOR SCENARIOS TAB */
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Cenário Convencional */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSaveScenario("convencional"); }}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6"
          >
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center bg-slate-50/50 -m-6 mb-2 p-5 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Modelos Convencionais de App</h3>
                <p className="text-[10px] text-slate-550 font-semibold">Cenário representativo da concorrência</p>
              </div>
              <Badge className="bg-slate-100 text-slate-600 border-slate-200 uppercase text-[8px] font-black">
                category_convencional
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="conv-weekly" className="text-xs font-bold text-slate-700">Rótulo Custo Semanal</Label>
                <Input 
                  id="conv-weekly"
                  type="text"
                  value={convencionalForm.weeklyCostLabel || ""}
                  onChange={(e) => setConvencionalForm(prev => ({ ...prev, weeklyCostLabel: e.target.value }))}
                  className="bg-white border-slate-200 font-semibold"
                  placeholder="Ex: A partir de R$ 750/sem"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="conv-monthly" className="text-xs font-bold text-slate-700">Rótulo Custo Mensal</Label>
                <Input 
                  id="conv-monthly"
                  type="text"
                  value={convencionalForm.monthlyCostLabel || ""}
                  onChange={(e) => setConvencionalForm(prev => ({ ...prev, monthlyCostLabel: e.target.value }))}
                  className="bg-white border-slate-200 font-semibold"
                  placeholder="Ex: A partir de R$ 3.000/mês"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="conv-kmlim" className="text-xs font-bold text-slate-700">Limite de Quilometragem</Label>
              <Input 
                id="conv-kmlim"
                value={convencionalForm.kmLimit || ""}
                onChange={(e) => setConvencionalForm(prev => ({ ...prev, kmLimit: e.target.value }))}
                placeholder="Ex: Restrito (2.500 km/sem)"
                className="bg-white border-slate-200 font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="conv-dep"
                  checked={convencionalForm.hasDeposit || false}
                  onChange={(e) => setConvencionalForm(prev => ({ ...prev, hasDeposit: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-250 text-sky-600"
                />
                <Label htmlFor="conv-dep" className="text-xs font-semibold text-slate-700 cursor-pointer">Exige Caução Alto</Label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="conv-rod"
                  checked={convencionalForm.rodizioExempt || false}
                  onChange={(e) => setConvencionalForm(prev => ({ ...prev, rodizioExempt: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-250 text-sky-600"
                />
                <Label htmlFor="conv-rod" className="text-xs font-semibold text-slate-700 cursor-pointer">Isento de Rodízio SP</Label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="conv-sup"
                  checked={convencionalForm.support24h || false}
                  onChange={(e) => setConvencionalForm(prev => ({ ...prev, support24h: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-250 text-sky-600"
                />
                <Label htmlFor="conv-sup" className="text-xs font-semibold text-slate-700 cursor-pointer">Suporte Humano 24h</Label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="conv-exec"
                  checked={convencionalForm.executiveOperation || false}
                  onChange={(e) => setConvencionalForm(prev => ({ ...prev, executiveOperation: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-250 text-sky-600"
                />
                <Label htmlFor="conv-exec" className="text-xs font-semibold text-slate-700 cursor-pointer">Fila Rápida Congonhas</Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs h-10 rounded-lg flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" /> Salvar Cenário Convencional
            </Button>
          </form>

          {/* Cenário Michelines */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSaveScenario("michelines"); }}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6"
          >
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center bg-sky-50/20 -m-6 mb-2 p-5 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-bold text-sky-900 uppercase tracking-wide">Plataforma Grupo Michelines</h3>
                <p className="text-[10px] text-sky-700 font-semibold">Cenário real da frota premium</p>
              </div>
              <Badge className="bg-sky-50 text-sky-700 border-sky-200 uppercase text-[8px] font-black">
                category_michelines
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="mich-weekly" className="text-xs font-bold text-slate-700">Rótulo Custo Semanal</Label>
                <Input 
                  id="mich-weekly"
                  type="text"
                  value={michelinesForm.weeklyCostLabel || ""}
                  onChange={(e) => setMichelinesForm(prev => ({ ...prev, weeklyCostLabel: e.target.value }))}
                  className="bg-white border-slate-200 font-semibold"
                  placeholder="Ex: A partir de R$ 900/sem"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mich-monthly" className="text-xs font-bold text-slate-700">Rótulo Custo Mensal</Label>
                <Input 
                  id="mich-monthly"
                  type="text"
                  value={michelinesForm.monthlyCostLabel || ""}
                  onChange={(e) => setMichelinesForm(prev => ({ ...prev, monthlyCostLabel: e.target.value }))}
                  className="bg-white border-slate-200 font-semibold"
                  placeholder="Ex: A partir de R$ 3.600/mês"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mich-kmlim" className="text-xs font-bold text-slate-700">Limite de Quilometragem</Label>
              <Input 
                id="mich-kmlim"
                value={michelinesForm.kmLimit || ""}
                onChange={(e) => setMichelinesForm(prev => ({ ...prev, kmLimit: e.target.value }))}
                placeholder="Ex: Operação flexível"
                className="bg-white border-slate-200 font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="mich-dep"
                  checked={michelinesForm.hasDeposit || false}
                  onChange={(e) => setMichelinesForm(prev => ({ ...prev, hasDeposit: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-250 text-sky-600"
                />
                <Label htmlFor="mich-dep" className="text-xs font-semibold text-slate-700 cursor-pointer">Exige Caução Alto</Label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="mich-rod"
                  checked={michelinesForm.rodizioExempt || false}
                  onChange={(e) => setMichelinesForm(prev => ({ ...prev, rodizioExempt: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-250 text-sky-600"
                />
                <Label htmlFor="mich-rod" className="text-xs font-semibold text-slate-700 cursor-pointer">Isento de Rodízio SP</Label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="mich-sup"
                  checked={michelinesForm.support24h || false}
                  onChange={(e) => setMichelinesForm(prev => ({ ...prev, support24h: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-250 text-sky-600"
                />
                <Label htmlFor="mich-sup" className="text-xs font-semibold text-slate-700 cursor-pointer">Suporte Humano 24h</Label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="mich-exec"
                  checked={michelinesForm.executiveOperation || false}
                  onChange={(e) => setMichelinesForm(prev => ({ ...prev, executiveOperation: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-250 text-sky-600"
                />
                <Label htmlFor="mich-exec" className="text-xs font-semibold text-slate-700 cursor-pointer">Fila Rápida Congonhas</Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-10 rounded-lg flex items-center justify-center gap-2 shadow-md"
            >
              <Save className="h-4 w-4" /> Salvar Cenário Michelines
            </Button>
          </form>

        </div>
      )}

    </div>
  )
}
